using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ChallengeServer.Data;
using ChallengeServer.Models;
using System.Security.Claims;
using ChallengeServer.DTOs;

namespace ChallengeServer.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TasksController> _logger;

        public TasksController(
            AppDbContext context,
            ILogger<TasksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/tasks/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTask(int id)
        {
            try
            {
                // Get current user ID from claims
                var userId = User.FindFirstValue("Id");
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
                {
                    return Unauthorized(new { message = "User not authenticated properly" });
                }

                // Get the task
                var task = await _context.Tasks
                    .Include(t => t.Assignee)
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null)
                {
                    return NotFound(new { message = "Task not found" });
                }

                // Security check: Only allow access if user is the project manager or the assigned programmer
                var userType = User.FindFirstValue("UserType");
                if (string.IsNullOrEmpty(userType) || !int.TryParse(userType, out int userTypeId))
                {
                    return Unauthorized(new { message = "User type not determined" });
                }

                // Project Manager (type 1) can only access tasks for projects they manage
                if (userTypeId == 1 && task.Project.ManagerId != currentUserId)
                {
                    return Forbid();
                }
                // Programmer (type 2) can only access tasks assigned to them
                else if (userTypeId == 2 && task.AssigneeId != currentUserId)
                {
                    return Forbid();
                }

                // Map to DTO
                var taskDto = new TaskDto
                {
                    Id = task.Id,
                    Name = task.Name,
                    Description = task.Description,
                    CreatedAt = task.CreatedAt,
                    Deadline = task.Deadline,
                    Status = task.Status,
                    CompletedAt = task.CompletedAt,
                    ProjectId = task.ProjectId,
                    AssigneeId = task.AssigneeId,
                    AssigneeName = task.Assignee.FullName,
                    ProjectName = task.Project.Name
                };

                return Ok(taskDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task with ID {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // POST: api/tasks
        [HttpPost]
        [Authorize(Policy = "ProjectManager")]
        public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto taskDto)
        {
            try
            {
                // Get current user ID from claims
                var userId = User.FindFirstValue("Id");
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
                {
                    return Unauthorized(new { message = "User not authenticated properly" });
                }

                // Verify that the project exists and the current user is the manager
                var project = await _context.Projects.FindAsync(taskDto.ProjectId);
                if (project == null)
                {
                    return NotFound(new { message = "Project not found" });
                }

                if (project.ManagerId != currentUserId)
                {
                    return Forbid();
                }

                // Verify that the assignee exists and is a programmer
                var assignee = await _context.Users.FindAsync(taskDto.AssigneeId);
                if (assignee == null || assignee.UserType != 2) // 2 = Programmer
                {
                    return BadRequest(new { message = "Invalid assignee ID. Must be a programmer." });
                }

                // Create a new task
                var task = new ProjectTask
                {
                    Name = taskDto.Name,
                    Description = taskDto.Description,
                    CreatedAt = DateTime.UtcNow,
                    Deadline = taskDto.Deadline,
                    Status = taskDto.Status ?? "Pendente",
                    ProjectId = taskDto.ProjectId,
                    AssigneeId = taskDto.AssigneeId
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                // Return the created task with additional info
                await _context.Entry(task).Reference(t => t.Assignee).LoadAsync();
                await _context.Entry(task).Reference(t => t.Project).LoadAsync();

                var createdTaskDto = new TaskDto
                {
                    Id = task.Id,
                    Name = task.Name,
                    Description = task.Description,
                    CreatedAt = task.CreatedAt,
                    Deadline = task.Deadline,
                    Status = task.Status,
                    CompletedAt = task.CompletedAt,
                    ProjectId = task.ProjectId,
                    AssigneeId = task.AssigneeId,
                    AssigneeName = task.Assignee.FullName,
                    ProjectName = task.Project.Name
                };

                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, createdTaskDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        [Authorize(Policy = "ProjectManager")]
        public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto taskDto)
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

                // Get the task
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null)
                {
                    return NotFound(new { message = "Task not found" });
                }

                // Verify the current user is the project manager
                if (task.Project.ManagerId != currentUserId)
                {
                    return Forbid();
                }

                // Prevent Project Managers from changing the status
                if (userTypeId == 1 && !string.IsNullOrEmpty(taskDto.Status) && taskDto.Status != task.Status)
                {
                    return BadRequest(new { message = "Project Managers cannot update task status" });
                }

                // If assignee is being changed, verify the new assignee is valid
                if (taskDto.AssigneeId.HasValue && taskDto.AssigneeId.Value != task.AssigneeId)
                {
                    var assignee = await _context.Users.FindAsync(taskDto.AssigneeId.Value);
                    if (assignee == null || assignee.UserType != 2) // 2 = Programmer
                    {
                        return BadRequest(new { message = "Invalid assignee ID. Must be a programmer." });
                    }
                    task.AssigneeId = taskDto.AssigneeId.Value;
                }

                // Update the task properties
                if (!string.IsNullOrEmpty(taskDto.Name))
                {
                    task.Name = taskDto.Name;
                }

                task.Description = taskDto.Description; // Can be null

                if (taskDto.Deadline.HasValue)
                {
                    task.Deadline = taskDto.Deadline.Value;
                }

                // Only update status if we're not a Project Manager (this is redundant now with the check above)
                if (!string.IsNullOrEmpty(taskDto.Status) && userTypeId != 1)
                {
                    task.Status = taskDto.Status;
                    
                    // If status is changed to "Concluída" (Completed), set the completion date
                    if (taskDto.Status == "Concluída")
                    {
                        task.CompletedAt = DateTime.UtcNow;
                    }
                    else if (task.CompletedAt != null)
                    {
                        // If status is changed from "Concluída" to something else, clear the completion date
                        task.CompletedAt = null;
                    }
                }

                // Update the task
                _context.Entry(task).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                {
                    return NotFound(new { message = "Task not found" });
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task with ID {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // PATCH: api/tasks/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateTaskStatus(int id, UpdateTaskStatusDto statusDto)
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

                // Get the task
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null)
                {
                    return NotFound(new { message = "Task not found" });
                }

                // Apply business rules for status updates
                if (userTypeId == 1) // Project Manager
                {
                    // Project Managers can only change status to "Bloqueada" or "Pendente"
                    if (statusDto.Status != "Bloqueada" && statusDto.Status != "Pendente")
                    {
                        return BadRequest(new { message = "Project Managers can only set tasks to Blocked or Pending status" });
                    }
                    
                    // Project Managers can only update tasks for projects they manage
                    if (task.Project.ManagerId != currentUserId)
                    {
                        return Forbid();
                    }
                }
                else if (userTypeId == 2) // Programmer
                {
                    // Programmers can only update their own tasks
                    if (task.AssigneeId != currentUserId)
                    {
                        return Forbid();
                    }
                    
                    // Programmers cannot set status to "Bloqueada"
                    if (statusDto.Status == "Bloqueada")
                    {
                        return BadRequest(new { message = "Programmers cannot set tasks to Blocked status" });
                    }
                    
                    // Make sure the status is one of the allowed values
                    if (statusDto.Status != "Pendente" && statusDto.Status != "Em Progresso" && statusDto.Status != "Concluída")
                    {
                        return BadRequest(new { message = "Invalid status. Must be one of: Pendente, Em Progresso, Concluída" });
                    }
                }
                else
                {
                    return BadRequest(new { message = "Invalid user type" });
                }

                // Update the task status
                task.Status = statusDto.Status;

                // Set or clear completion date when status changes
                if (statusDto.Status == "Concluída")
                {
                    task.CompletedAt = DateTime.UtcNow;
                }
                else if (task.CompletedAt != null)
                {
                    // If status is changed from "Concluída" to something else, clear the completion date
                    task.CompletedAt = null;
                }

                _context.Entry(task).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for task with ID {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        [Authorize(Policy = "ProjectManager")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                // Get current user ID from claims
                var userId = User.FindFirstValue("Id");
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
                {
                    return Unauthorized(new { message = "User not authenticated properly" });
                }

                // Get the task
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null)
                {
                    return NotFound(new { message = "Task not found" });
                }

                // Verify the current user is the project manager
                if (task.Project.ManagerId != currentUserId)
                {
                    return Forbid();
                }

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task with ID {TaskId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}