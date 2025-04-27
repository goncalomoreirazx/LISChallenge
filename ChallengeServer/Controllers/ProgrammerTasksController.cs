using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ChallengeServer.Data;
using ChallengeServer.DTOs;
using System.Security.Claims;

namespace ChallengeServer.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class ProgrammerTasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProgrammerTasksController> _logger;

        public ProgrammerTasksController(
            AppDbContext context,
            ILogger<ProgrammerTasksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/tasks/my-tasks
        [HttpGet("my-tasks")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetMyTasks([FromQuery] string? status = null)
        {
            try
            {
                // Get current user ID from claims
                var userId = User.FindFirstValue("Id");
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
                {
                    _logger.LogWarning("User ID not found in token or invalid: {UserId}", userId);
                    return Unauthorized(new { message = "User not authenticated properly" });
                }

                // Get user type from claims
                var userType = User.FindFirstValue("UserType");
                if (string.IsNullOrEmpty(userType) || !int.TryParse(userType, out int userTypeId))
                {
                    _logger.LogWarning("User type not found in token or invalid: {UserType}", userType);
                    return Unauthorized(new { message = "User type not determined" });
                }

                _logger.LogInformation("GetMyTasks called by user ID {UserId}, type {UserType}", currentUserId, userTypeId);

                // Create base query depending on user type
                IQueryable<Models.ProjectTask> query;

                if (userTypeId == 1) // Project Manager: get all tasks for projects they manage
                {
                    _logger.LogInformation("Fetching tasks for Project Manager {UserId}", currentUserId);
                    
                    // First check if the project manager has any projects
                    var projectCount = await _context.Projects
                        .Where(p => p.ManagerId == currentUserId)
                        .CountAsync();
                        
                    _logger.LogInformation("Project Manager {UserId} has {ProjectCount} projects", currentUserId, projectCount);
                    
                    query = _context.Tasks
                        .Include(t => t.Project)
                        .Include(t => t.Assignee)
                        .Where(t => t.Project.ManagerId == currentUserId);
                }
                else // Programmer: get only their assigned tasks
                {
                    _logger.LogInformation("Fetching tasks for Programmer {UserId}", currentUserId);
                    
                    query = _context.Tasks
                        .Include(t => t.Project)
                        .Include(t => t.Assignee)
                        .Where(t => t.AssigneeId == currentUserId);
                }

                // Check if the query returns any tasks before filtering
                var preFilterCount = await query.CountAsync();
                _logger.LogInformation("Pre-filter task count: {PreFilterCount}", preFilterCount);

                // Filter by status if provided
                if (!string.IsNullOrEmpty(status))
                {
                    _logger.LogInformation("Filtering by status: {Status}", status);
                    query = query.Where(t => t.Status == status);
                }

                var tasks = await query.ToListAsync();
                _logger.LogInformation("Retrieved {TaskCount} tasks after filtering", tasks.Count);
                
                // Map to DTOs
                var taskDtos = tasks.Select(t => new TaskDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    Deadline = t.Deadline,
                    Status = t.Status,
                    CompletedAt = t.CompletedAt,
                    ProjectId = t.ProjectId,
                    ProjectName = t.Project.Name,
                    AssigneeId = t.AssigneeId,
                    AssigneeName = t.Assignee.FullName
                }).ToList();

                return Ok(taskDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        // GET: api/tasks/my-tasks/stats
        [HttpGet("my-tasks/stats")]
        [Authorize]
        public async Task<ActionResult<object>> GetMyTasksStats()
        {
            try
            {
                // Get current user ID from claims
                var userId = User.FindFirstValue("Id");
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
                {
                    return Unauthorized(new { message = "User not authenticated properly" });
                }
                
                // Get user type from claims
                var userType = User.FindFirstValue("UserType");
                if (string.IsNullOrEmpty(userType) || !int.TryParse(userType, out int userTypeId))
                {
                    return Unauthorized(new { message = "User type not determined" });
                }
                
                _logger.LogInformation("GetMyTasksStats called by user ID {UserId}, type {UserType}", currentUserId, userTypeId);
                
                // Allow both project managers and programmers to view statistics
                var tasks = new List<Models.ProjectTask>();
                
                if (userTypeId == 1) // Project Manager
                {
                    tasks = await _context.Tasks
                        .Where(t => t.Project.ManagerId == currentUserId)
                        .ToListAsync();
                        
                    _logger.LogInformation("Retrieved {TaskCount} tasks for Project Manager {UserId}", tasks.Count, currentUserId);
                }
                else if (userTypeId == 2) // Programmer
                {
                    tasks = await _context.Tasks
                        .Where(t => t.AssigneeId == currentUserId)
                        .ToListAsync();
                        
                    _logger.LogInformation("Retrieved {TaskCount} tasks for Programmer {UserId}", tasks.Count, currentUserId);
                }
                else
                {
                    _logger.LogWarning("Invalid user type {UserType} for user {UserId}", userTypeId, currentUserId);
                    return Forbid();
                }

                // Calculate statistics
                var totalTasks = tasks.Count;
                var pendingTasks = tasks.Count(t => t.Status == "Pendente");
                var inProgressTasks = tasks.Count(t => t.Status == "Em Progresso");
                var completedTasks = tasks.Count(t => t.Status == "Concluída");
                var blockedTasks = tasks.Count(t => t.Status == "Bloqueada");
                
                // Count overdue tasks (deadline passed and not completed)
                var now = DateTime.UtcNow;
                var overdueTasks = tasks.Count(t => t.Deadline < now && t.Status != "Concluída");

                // Return stats object
                var stats = new
                {
                    TotalTasks = totalTasks,
                    PendingTasks = pendingTasks,
                    InProgressTasks = inProgressTasks,
                    CompletedTasks = completedTasks,
                    BlockedTasks = blockedTasks,
                    OverdueTasks = overdueTasks,
                    CompletionRate = totalTasks > 0 ? (double)completedTasks / totalTasks : 0
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task statistics");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }
    }
}