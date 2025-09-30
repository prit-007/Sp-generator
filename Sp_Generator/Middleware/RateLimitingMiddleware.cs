using System.Collections.Concurrent;
using System.Net;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace Sp_Generator.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly IMemoryCache _cache;
        private readonly int _maxRequestsPerMinute;
        private readonly int _maxRequestsPerHour;
        private readonly TimeSpan _requestTimeout;
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _throttlers = new();

        public RateLimitingMiddleware(
            RequestDelegate next,
            ILogger<RateLimitingMiddleware> logger,
            IMemoryCache cache,
            IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _cache = cache;
            
            // Read configuration values or use defaults
            _maxRequestsPerMinute = configuration.GetValue<int>("RateLimiting:RequestsPerMinute", 60);
            _maxRequestsPerHour = configuration.GetValue<int>("RateLimiting:RequestsPerHour", 500);
            _requestTimeout = TimeSpan.FromSeconds(configuration.GetValue<int>("RateLimiting:TimeoutSeconds", 30));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var endpoint = context.GetEndpoint()?.DisplayName;
            var ip = GetClientIpAddress(context);
            var key = $"{ip}:{endpoint}";

            // Get or create rate limiter for this client
            var semaphore = _throttlers.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));

            try
            {
                // Try to enter the semaphore (with timeout)
                var entered = await semaphore.WaitAsync(_requestTimeout);
                if (!entered)
                {
                    _logger.LogWarning("Request timed out waiting for throttle lock: {Key}", key);
                    context.Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                    context.Response.ContentType = "application/json";
                    
                    var timeoutResponse = new
                    {
                        Success = false,
                        Message = "Too many concurrent requests. Please try again later.",
                        Error = "Request timed out due to high load"
                    };
                    
                    await context.Response.WriteAsync(JsonConvert.SerializeObject(timeoutResponse));
                    return;
                }

                // Check minute rate limit
                var minuteKey = $"min:{key}:{DateTime.UtcNow:yyyy-MM-dd-HH-mm}";
                var minuteCount = _cache.GetOrCreate(minuteKey, entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromMinutes(2)); // Keep for an extra minute
                    return 0;
                });

                // Check hour rate limit
                var hourKey = $"hour:{key}:{DateTime.UtcNow:yyyy-MM-dd-HH}";
                var hourCount = _cache.GetOrCreate(hourKey, entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromHours(2)); // Keep for an extra hour
                    return 0;
                });

                // Check if rate limits are exceeded
                if (minuteCount >= _maxRequestsPerMinute)
                {
                    _logger.LogWarning("Rate limit exceeded (per minute): {Key}", key);
                    await SendRateLimitResponse(context, "per minute", minuteKey);
                    return;
                }

                if (hourCount >= _maxRequestsPerHour)
                {
                    _logger.LogWarning("Rate limit exceeded (per hour): {Key}", key);
                    await SendRateLimitResponse(context, "per hour", hourKey);
                    return;
                }

                // Update counters
                _cache.Set(minuteKey, minuteCount + 1);
                _cache.Set(hourKey, hourCount + 1);

                // Add rate limit headers
                context.Response.Headers.Add("X-RateLimit-Limit-Minute", _maxRequestsPerMinute.ToString());
                context.Response.Headers.Add("X-RateLimit-Remaining-Minute", (_maxRequestsPerMinute - minuteCount - 1).ToString());
                context.Response.Headers.Add("X-RateLimit-Limit-Hour", _maxRequestsPerHour.ToString());
                context.Response.Headers.Add("X-RateLimit-Remaining-Hour", (_maxRequestsPerHour - hourCount - 1).ToString());

                // Process the request
                await _next(context);
            }
            finally
            {
                // Always release the semaphore
                semaphore.Release();
            }
        }

        private async Task SendRateLimitResponse(HttpContext context, string type, string limitKey)
        {
            var retryAfterSeconds = GetRetryAfterSeconds(type, limitKey);
            
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers.Add("Retry-After", retryAfterSeconds.ToString());
            context.Response.ContentType = "application/json";
            
            var response = new
            {
                Success = false,
                Message = $"Rate limit exceeded ({type}). Please try again later.",
                Error = "Too many requests",
                RetryAfterSeconds = retryAfterSeconds
            };
            
            await context.Response.WriteAsync(JsonConvert.SerializeObject(response));
        }

        private int GetRetryAfterSeconds(string type, string limitKey)
        {
            if (type == "per minute")
            {
                // Calculate seconds until next minute
                var now = DateTime.UtcNow;
                var nextMinute = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0).AddMinutes(1);
                return (int)(nextMinute - now).TotalSeconds;
            }
            else // per hour
            {
                // Calculate seconds until next hour
                var now = DateTime.UtcNow;
                var nextHour = new DateTime(now.Year, now.Month, now.Day, now.Hour, 0, 0).AddHours(1);
                return (int)(nextHour - now).TotalSeconds;
            }
        }

        private string GetClientIpAddress(HttpContext context)
        {
            // Try to get IP from headers first (for clients behind proxies)
            var forwardedIps = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedIps))
            {
                var ips = forwardedIps.Split(',', StringSplitOptions.RemoveEmptyEntries);
                return ips[0].Trim();
            }

            // Fall back to connection remote IP
            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }
}