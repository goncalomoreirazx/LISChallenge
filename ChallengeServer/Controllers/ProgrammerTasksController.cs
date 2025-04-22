// ChallengeServer/Controllers/ProgrammerController.cs
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
                    return Unauthorized(new { message = "User not authenticated properly" });
                }

                // Get all tasks assigned to the current programmer
                var query = _context.Tasks
                    .Include(t => t.Project)
                    .Include(t => t.Assignee)
                    .Where(t => t.AssigneeId == currentUserId);

                // Filter by status if provided
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(t => t.Status == status);
                }

                var tasks = await query.ToListAsync();
                
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
                _logger.LogError(ex, "Error retrieving programmer tasks");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // GET: api/tasks/my-tasks/stats
        [HttpGet("my-tasks/stats")]
        [Authorize(Policy = "Programmer")]
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

                // Get tasks assigned to the current programmer
                var tasks = await _context.Tasks
                    .Where(t => t.AssigneeId == currentUserId)
                    .ToListAsync();

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
                _logger.LogError(ex, "Error retrieving programmer task statistics");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // PATCH: api/tasks/{id}/status
        // This endpoint already exists in TasksController, but ensure programmers can only set status to "Concluída"
    }
}