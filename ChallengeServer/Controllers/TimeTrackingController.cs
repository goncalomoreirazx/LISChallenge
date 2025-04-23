using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ChallengeServer.Data;
using ChallengeServer.DTOs;
using ChallengeServer.Models;
using System.Security.Claims;

namespace ChallengeServer.Controllers
{
    [ApiController]
    [Route("api/time-tracking")]
    [Authorize]
    public class TimeTrackingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TimeTrackingController> _logger;

        public TimeTrackingController(
            AppDbContext context,
            ILogger<TimeTrackingController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/time-tracking/task/{taskId}
        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<IEnumerable<TimeEntryDto>>> GetTimeEntriesForTask(int taskId)
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

                // Check if the task exists
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == taskId);

                if (task == null)
                {
                    return NotFound(new { message = "Task not found" });
                }

                // Verify access rights
                if (userTypeId == 1) // Project Manager
                {
                    // Project Managers can only see time entries for tasks in projects they manage
                    if (task.Project.ManagerId != currentUserId)
                    {
                        return Forbid();
                    }
                }
                else if (userTypeId == 2) // Programmer
                {
                    // Programmers can only see time entries for tasks assigned to them
                    if (task.AssigneeId != currentUserId)
                    {
                        return Forbid();
                    }
                }
                else
                {
                    return Forbid();
                }

                // Get time entries for the task
                var timeEntries = await _context.TimeEntries
                    .Include(te => te.User)
                    .Include(te => te.Task)
                    .Where(te => te.TaskId == taskId)
                    .OrderByDescending(te => te.Date)
                    .ToListAsync();

                // Map to DTOs
                var timeEntryDtos = timeEntries.Select(te => new TimeEntryDto
                {
                    Id = te.Id,
                    TaskId = te.TaskId,
                    TaskName = te.Task.Name,
                    UserId = te.UserId,
                    UserName = te.User.FullName,
                    Date = te.Date,
                    Hours = te.Hours,
                    Notes = te.Notes,
                    CreatedAt = te.CreatedAt
                }).ToList();

                return Ok(timeEntryDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving time entries for task with ID {TaskId}", taskId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // POST: api/time-tracking
        [HttpPost]
        public async Task<ActionResult<TimeEntryDto>> CreateTimeEntry(CreateTimeEntryDto timeEntryDto)
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

                // Only programmers can log time
                if (userTypeId != 2) // Not a programmer
                {
                    return Forbid(new { message = "Only programmers can log time for tasks" });
                }

                // Verify that the task exists and the current user is assigned to it
                var task = await _context.Tasks.FindAsync(timeEntryDto.TaskId);
                if (task == null)
                {
                    return NotFound(new { message = "Task not found" });
                }

                if (task.AssigneeId != currentUserId)
                {
                    return Forbid(new { message = "You can only log time for tasks assigned to you" });
                }

                // Create a new time entry
                var timeEntry = new TimeTracking
                {
                    TaskId = timeEntryDto.TaskId,
                    UserId = currentUserId,
                    Date = timeEntryDto.Date.Date, // Store only the date part
                    Hours = timeEntryDto.Hours,
                    Notes = timeEntryDto.Notes,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TimeEntries.Add(timeEntry);
                await _context.SaveChangesAsync();

                // Load related entities for response
                await _context.Entry(timeEntry).Reference(te => te.Task).LoadAsync();
                await _context.Entry(timeEntry).Reference(te => te.User).LoadAsync();

                // Return the created time entry
                var createdTimeEntryDto = new TimeEntryDto
                {
                    Id = timeEntry.Id,
                    TaskId = timeEntry.TaskId,
                    TaskName = timeEntry.Task.Name,
                    UserId = timeEntry.UserId,
                    UserName = timeEntry.User.FullName,
                    Date = timeEntry.Date,
                    Hours = timeEntry.Hours,
                    Notes = timeEntry.Notes,
                    CreatedAt = timeEntry.CreatedAt
                };

                return CreatedAtAction(nameof(GetTimeEntriesForTask), new { taskId = timeEntry.TaskId }, createdTimeEntryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating time entry");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private ActionResult<TimeEntryDto> Forbid(object result)
        {
            throw new NotImplementedException();
        }

        // GET: api/time-tracking/summary/task/{taskId}
        [HttpGet("summary/task/{taskId}")]
        public async Task<ActionResult<TimeEntrySummaryDto>> GetTimeEntrySummaryForTask(int taskId)
        {
            try
            {
                // Security checks similar to GetTimeEntriesForTask
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

                // Check if the task exists
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == taskId);

                if (task == null)
                {
                    return NotFound(new { message = "Task not found" });
                }

                // Verify access rights (same as in GetTimeEntriesForTask)
                if (userTypeId == 1 && task.Project.ManagerId != currentUserId)
                {
                    return Forbid();
                }
                else if (userTypeId == 2 && task.AssigneeId != currentUserId)
                {
                    return Forbid();
                }

                // Calculate summary data
                var timeEntries = await _context.TimeEntries
                    .Where(te => te.TaskId == taskId)
                    .ToListAsync();

                var totalHours = timeEntries.Sum(te => te.Hours);
                var lastEntry = timeEntries.OrderByDescending(te => te.Date).FirstOrDefault();
                var entriesCount = timeEntries.Count;

                var summary = new TimeEntrySummaryDto
                {
                    TaskId = taskId,
                    TotalHours = totalHours,
                    EntriesCount = entriesCount,
                    LastEntryDate = lastEntry?.Date,
                    LastEntryHours = lastEntry?.Hours
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving time entry summary for task with ID {TaskId}", taskId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}