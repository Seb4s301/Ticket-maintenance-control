using System.Reflection;
using Dapper;
using DotNetEnv;
using Microsoft.AspNetCore.Mvc;
using TicketMaintenance.API.Data;
using TicketMaintenance.API.Middleware;
using TicketMaintenance.API.Repositories;
using TicketMaintenance.API.Services;

try
{
    Env.TraversePath().Load();
}
catch
{
    // No local .env (e.g. Railway): real environment variables are used instead.
}

DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
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
    options.InvalidModelStateResponseFactory = _ =>
        new BadRequestObjectResult(new
        {
            status = 400,
            error = "VALIDATION_ERROR",
            message = "One or more validation errors occurred."
        })
        { ContentTypes = { "application/json" } };
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
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
