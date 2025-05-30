using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ChallengeServer.Data;
using ChallengeServer.Services;
using ChallengeServer.Middleware;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => new
                {
                    Field = e.Key,
                    Errors = e.Value?.Errors.Select(err => err.ErrorMessage).ToArray()
                })
                .ToArray();

            var result = new
            {
                Message = "Validation Failed",
                Errors = errors
            };

            return new BadRequestObjectResult(result);
        };
    });
builder.Services.AddEndpointsApiExplorer();

// Configure OpenAPI/Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Challenge API", Version = "v1" });
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Configure database connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? 
    "Server=localhost\\SQLEXPRESS;Database=IPNChallenge;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Configure Authentication
// ChallengeServer/Program.cs - JWT Configuration

// Configure Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new Exception("JWT Key is not configured")))
        };

        // Add event handlers for more detailed logging
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogError("Authentication failed: {Exception}", context.Exception);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogInformation("Token validated successfully");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("Authorization challenge issued for request to {Path}", context.Request.Path);
                return Task.CompletedTask;
            }
        };
    });

// Configure Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ProjectManager", policy => policy.RequireClaim("UserType", "1"));
    options.AddPolicy("Programmer", policy => policy.RequireClaim("UserType", "2"));
});

// Register our services
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PasswordService>();

// Add CORS - updated with appropriate origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
    {
        builder.WithOrigins(
                "http://localhost:4200",  // Angular dev server
                "http://localhost:4000",  // Node Express server
                "http://localhost:5043"   // .NET API server
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Development-specific settings
    app.UseExceptionHandler("/error-development");
    
    // Explicitly setting ports for HTTPS redirection in development
    // This fixes the HTTPS redirection warning
    app.UseHttpsRedirection();
}
else
{
    // Production error handler
    app.UseExceptionHandler("/error");
    
    // The default HSTS value is 30 days
    app.UseHsts();
    
    app.UseHttpsRedirection();
}

// Apply CORS middleware before auth middleware
app.UseCors("AllowAngular");

// Global error handling middleware
app.UseErrorHandling();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();