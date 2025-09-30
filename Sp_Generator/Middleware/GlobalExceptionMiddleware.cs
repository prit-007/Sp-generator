using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using Sp_Generator.Models;
using System.Net;

namespace Sp_Generator.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionMiddleware> logger,
            IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ErrorResponse();

            switch (exception)
            {
                case SqlException sqlEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Error = "Database Error";
                    response.Message = GetFriendlySqlErrorMessage(sqlEx);
                    // Only include detailed SQL error in development
                    response.Details = _environment.IsDevelopment() ? sqlEx.Message : null;
                    break;

                case InvalidOperationException invOpEx when invOpEx.Message.Contains("connection"):
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Error = "Connection Error";
                    response.Message = "No active database connection. Please connect to a database first.";
                    response.Details = _environment.IsDevelopment() ? invOpEx.Message : null;
                    break;

                case ArgumentException argEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Error = "Invalid Request";
                    response.Message = "The request contains invalid parameters.";
                    response.Details = _environment.IsDevelopment() ? argEx.Message : null;
                    break;

                case UnauthorizedAccessException:
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.Error = "Unauthorized";
                    response.Message = "You are not authorized to perform this action.";
                    break;

                case TimeoutException:
                    response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                    response.Error = "Timeout";
                    response.Message = "The operation timed out. Please try again.";
                    break;

                case OperationCanceledException:
                    response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                    response.Error = "Operation Canceled";
                    response.Message = "The operation was canceled. Please try again later.";
                    break;

                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response.Error = "Internal Server Error";
                    response.Message = "An unexpected error occurred. Please try again later.";
                    // Only include stack trace in development environment
                    response.Details = _environment.IsDevelopment() ? exception.ToString() : null;
                    break;
            }

            context.Response.StatusCode = response.StatusCode;

            var jsonResponse = JsonConvert.SerializeObject(
                new
                {
                    Success = false,
                    Message = response.Message,
                    Error = response.Error,
                    Details = response.Details
                },
                Formatting.Indented);

            await context.Response.WriteAsync(jsonResponse);
        }

        private static string GetFriendlySqlErrorMessage(SqlException sqlException)
        {
            return sqlException.Number switch
            {
                2 => "Unable to connect to the database server. Please check your connection string and ensure the server is running.",
                18 => "Login failed. Please check your username and password.",
                53 => "Network path not found. Please check the server name and network connectivity.",
                208 => "Invalid object name. The specified table or view does not exist.",
                515 => "Cannot insert null value into a required field.",
                547 => "Foreign key constraint violation. The referenced record does not exist.",
                2812 => "Could not find stored procedure. The specified procedure does not exist.",
                4060 => "The database specified in the connection string is not available or does not exist.",
                4064 => "Cannot open the specified database. Please check database name and status.",
                10061 => "Cannot connect to the database server. The server might be offline or the port is blocked.",
                17142 => "The SQL Server service is paused. Resume the service and try again.",
                18456 => "Login failed for the specified user. Check credentials and permissions.",
                _ => "A database error occurred. Please check your query and try again."
            };
        }
    }
}

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Error { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string RequestId { get; set; } = Guid.NewGuid().ToString();
}

