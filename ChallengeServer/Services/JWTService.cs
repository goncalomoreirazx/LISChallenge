using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChallengeServer.Models;
using Microsoft.IdentityModel.Tokens;

namespace ChallengeServer.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<JwtService> _logger;

        public JwtService(IConfiguration configuration, ILogger<JwtService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public string GenerateToken(User user)
        {
            try
            {
                var issuer = _configuration["Jwt:Issuer"];
                var audience = _configuration["Jwt:Audience"];
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new Exception("JWT Key is not configured"));
                
                _logger.LogInformation("Generating token for user ID: {UserId}, Email: {Email}", user.Id, user.Email);
                
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim("Id", user.Id.ToString()),
                        new Claim(ClaimTypes.Name, user.FullName),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(ClaimTypes.Role, user.UserType == 1 ? "ProjectManager" : "Programmer"),
                        new Claim("UserType", user.UserType.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddDays(7),
                    Issuer = issuer,
                    Audience = audience,
                    SigningCredentials = new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                };
                
                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);
                
                _logger.LogInformation("Token generated successfully for user ID: {UserId}", user.Id);
                
                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token for user ID: {UserId}", user.Id);
                throw;
            }
        }
    }
}