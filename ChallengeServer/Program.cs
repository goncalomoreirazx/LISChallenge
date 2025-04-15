using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ChallengeServer.Data;
using ChallengeServer.Services;
using ChallengeServer.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
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
    "Server=localhost\\SQLEXPRESS;Database=ChallengeDb;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

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

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
    {
        builder.WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Add automatic migrations and seeding in development
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var dbContext = services.GetRequiredService<AppDbContext>();
            
            // Ensure database is created and migrations are applied
            dbContext.Database.Migrate();
            
            // Seed data
            SeedData(dbContext, services.GetRequiredService<PasswordService>());
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        }
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Database seeding method
void SeedData(AppDbContext dbContext, PasswordService passwordService)
{
    // Check if we have the user types table defined
    if (dbContext.Model.FindEntityType(typeof(UserType)) != null)
    {
        // Seed user types if they don't exist
        if (!dbContext.UserTypes.Any())
        {
            dbContext.UserTypes.AddRange(
                new UserType { Id = 1, Name = "Project Manager" },
                new UserType { Id = 2, Name = "Programmer" }
            );
            dbContext.SaveChanges();
        }
    }
    
    // Check if we have the users table defined
    if (dbContext.Model.FindEntityType(typeof(User)) != null)
    {
        // Seed admin user if it doesn't exist
        if (!dbContext.Users.Any(u => u.Email == "admin@example.com"))
        {
            dbContext.Users.Add(new User
            {
                FullName = "Admin User",
                Email = "admin@example.com",
                PasswordHash = passwordService.HashPassword("Admin123!"),
                UserType = 1, // Project Manager
                CreatedAt = DateTime.UtcNow
            });
            dbContext.SaveChanges();
        }
    }
}