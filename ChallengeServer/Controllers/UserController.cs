// Create a new controller: UsersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ChallengeServer.Data;
using ChallengeServer.DTOs;
using System.Linq;
using System.Threading.Tasks;

namespace ChallengeServer.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            AppDbContext context,
            ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/users/programmers
        [HttpGet("programmers")]
        [Authorize(Policy = "ProjectManager")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetProgrammers()
        {
            try
            {
                var programmers = await _context.Users
                    .Where(u => u.UserType == 2) // 2 is Programmer type
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        FullName = u.FullName,
                        Email = u.Email,
                        UserType = u.UserType,
                        UserTypeDescription = u.UserTypeDescription
                    })
                    .ToListAsync();

                return Ok(programmers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving programmers");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}