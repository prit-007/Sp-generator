using Microsoft.Extensions.Caching.Memory;
using Sp_Generator.Repos.Services;
using Sp_Generator.Middleware;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure encryption key if not present
var configuration = builder.Configuration;
if (string.IsNullOrEmpty(configuration["ConnectionEncryption:Key"]) || 
    string.IsNullOrEmpty(configuration["ConnectionEncryption:IV"]))
{
    using (var aes = Aes.Create())
    {
        configuration["ConnectionEncryption:Key"] = Convert.ToBase64String(aes.Key);
        configuration["ConnectionEncryption:IV"] = Convert.ToBase64String(aes.IV);
    }
}

// Add controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add memory cache for rate limiting
builder.Services.AddMemoryCache();

// Register services
builder.Services.AddSingleton<ConnectionService>();
builder.Services.AddScoped<DatabaseRepository>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.AllowAnyOrigin() // Allow requests from any origin
                   .AllowAnyMethod() // Allow any HTTP method (GET, POST, PUT, etc.)
                   .AllowAnyHeader(); // Allow any headers
        });
});

// Configure HTTP client factory with basic timeouts
builder.Services.AddHttpClient("default", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS before other middleware
app.UseCors("AllowAllOrigins");

// Add global exception handling middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Add rate limiting middleware 
app.UseMiddleware<RateLimitingMiddleware>();

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();
