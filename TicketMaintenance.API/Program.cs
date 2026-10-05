using System.Reflection;
using Dapper;
using DotNetEnv;
using Microsoft.AspNetCore.Mvc;
using TicketMaintenance.API.Data;
using TicketMaintenance.API.Exceptions;
using TicketMaintenance.API.Middleware;
using TicketMaintenance.API.Repositories;
using TicketMaintenance.API.Serialization;
using TicketMaintenance.API.Services;

LoadLocalEnvFile();

DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.Configure<JsonOptions>(options =>
{
    options.JsonSerializerOptions.Converters.Add(new UtcDateTimeJsonConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        options.IncludeXmlComments(xmlPath);
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(entry => entry.Value is { Errors.Count: > 0 })
            .SelectMany(entry => entry.Value!.Errors.Select(error => $"{entry.Key}: {error.ErrorMessage}"))
            .ToList();

        var message = errors.Count > 0
            ? string.Join(" | ", errors)
            : "One or more validation errors occurred.";

        return new BadRequestObjectResult(new { status = 400, error = ErrorCodes.ValidationError, message })
        {
            ContentTypes = { "application/json" }
        };
    };
});

builder.Services.AddSingleton<IDbConnectionFactory, MySqlConnectionFactory>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ILookupRepository, LookupRepository>();
builder.Services.AddScoped<ILookupService, LookupService>();

var origins = (Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS") ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(o => o.AddPolicy("Frontend",
    p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("Frontend");
app.MapControllers();

app.MapGet("/health", async (HttpContext context, CancellationToken cancellationToken) =>
{
    var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Health");
    try
    {
        var factory = context.RequestServices.GetRequiredService<IDbConnectionFactory>();
        using var connection = factory.Create();
        await connection.ExecuteAsync(new CommandDefinition("SELECT 1", cancellationToken: cancellationToken));
        return Results.Ok(new { status = "ok" });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Health check failed");
        return Results.Json(new { status = "unhealthy" }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});

app.MapFallback(async context =>
{
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    await context.Response.WriteAsJsonAsync(new
    {
        status = 404,
        error = ErrorCodes.NotFound,
        message = "The requested endpoint does not exist."
    });
});

app.Run();

static void LoadLocalEnvFile()
{
    var directory = new DirectoryInfo(AppContext.BaseDirectory);
    while (directory is not null)
    {
        var envPath = Path.Combine(directory.FullName, ".env");
        if (File.Exists(envPath))
        {
            Env.Load(envPath);
            return;
        }
        directory = directory.Parent;
    }
    // No .env found: the host (e.g. Railway) provides real environment variables instead.
}
