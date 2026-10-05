using TicketMaintenance.API.Exceptions;

namespace TicketMaintenance.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogInformation(ex,
                "{ErrorCode} ({StatusCode}) for {Method} {Path}",
                ex.ErrorCode, ex.StatusCode, context.Request.Method, context.Request.Path);
            await WriteErrorAsync(context, ex.StatusCode, ex.ErrorCode, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unhandled exception for {Method} {Path}",
                context.Request.Method, context.Request.Path);
            await WriteErrorAsync(context, 503, ErrorCodes.ServiceUnavailable, "The service is temporarily unavailable.");
        }
    }

    private static Task WriteErrorAsync(HttpContext context, int status, string errorCode, string message)
    {
        if (context.Response.HasStarted)
            return Task.CompletedTask;

        context.Response.StatusCode = status;
        return context.Response.WriteAsJsonAsync(new { status, error = errorCode, message });
    }
}
