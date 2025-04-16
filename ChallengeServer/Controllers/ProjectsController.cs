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
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(
            AppDbContext context,
            ILogger<ProjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
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

                // Project Manager (type 1) can see all projects they manage
                if (userTypeId == 1)
                {
                    var projects = await _context.Projects
                        .Where(p => p.ManagerId == currentUserId)
                        .ToListAsync();
                    
                    return Ok(projects);
                }
                // Programmer (type 2) can see projects they have tasks for
                else if (userTypeId == 2)
                {
                    var projects = await _context.Projects
                        .Where(p => p.Tasks.Any(t => t.AssigneeId == currentUserId))
                        .ToListAsync();
                    
                    return Ok(projects);
                }
                else
                {
                    return Forbid();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving projects");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // GET: api/projects/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
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

                var project = await _context.Projects.FindAsync(id);
                
                if (project == null)
                {
                    return NotFound(new { message = "Project not found" });
                }

                // Project Manager (type 1) can only see their own projects
                if (userTypeId == 1 && project.ManagerId != currentUserId)
                {
                    return Forbid();
                }
                // Programmer (type 2) can only see projects they have tasks for
                else if (userTypeId == 2 && !await _context.Tasks.AnyAsync(t => t.ProjectId == id && t.AssigneeId == currentUserId))
                {
                    return Forbid();
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project with ID {ProjectId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

       // POST: api/projects
[HttpPost]
[Authorize(Policy = "ProjectManager")]
public async Task<ActionResult<Project>> CreateProject(CreateProjectDto projectDto)
{
    try
    {
        // Get current user ID from claims
        var userId = User.FindFirstValue("Id");
        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
        {
            return Unauthorized(new { message = "User not authenticated properly" });
        }

        // Create a new project entity from the DTO
        var project = new Project
        {
            Name = projectDto.Name,
            Description = projectDto.Description,
            Budget = projectDto.Budget,
            CreatedAt = DateTime.UtcNow,
            ManagerId = currentUserId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Project created successfully with ID {ProjectId} by user {UserId}", project.Id, currentUserId);

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating new project");
        return StatusCode(500, new { message = "Internal server error occurred. Please try again later." });
    }
}

        // PUT: api/projects/{id}
        [HttpPut("{id}")]
        [Authorize(Policy = "ProjectManager")]
        public async Task<IActionResult> UpdateProject(int id, Project project)
        {
            if (id != project.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            try
            {
                // Get current user ID from claims
                var userId = User.FindFirstValue("Id");
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
                {
                    return Unauthorized(new { message = "User not authenticated properly" });
                }

                // Check if the project exists and belongs to the current user
                var existingProject = await _context.Projects.FindAsync(id);
                
                if (existingProject == null)
                {
                    return NotFound(new { message = "Project not found" });
                }

                if (existingProject.ManagerId != currentUserId)
                {
                    return Forbid();
                }

                // Update only allowed fields
                existingProject.Name = project.Name;
                existingProject.Description = project.Description;
                existingProject.Budget = project.Budget;
                
                // Do not allow changing the manager or creation date
                // existingProject.ManagerId = existingProject.ManagerId;
                // existingProject.CreatedAt = existingProject.CreatedAt;

                _context.Entry(existingProject).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                {
                    return NotFound(new { message = "Project not found" });
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project with ID {ProjectId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // DELETE: api/projects/{id}
        [HttpDelete("{id}")]
        [Authorize(Policy = "ProjectManager")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            try
            {
                // Get current user ID from claims
                var userId = User.FindFirstValue("Id");
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
                {
                    return Unauthorized(new { message = "User not authenticated properly" });
                }

                var project = await _context.Projects.FindAsync(id);
                
                if (project == null)
                {
                    return NotFound(new { message = "Project not found" });
                }

                if (project.ManagerId != currentUserId)
                {
                    return Forbid();
                }

                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project with ID {ProjectId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }


        [HttpPost("{id}/programmers")]
[Authorize(Policy = "ProjectManager")]
public async Task<IActionResult> AllocateProgrammers(int id, [FromBody] List<int> programmerIds)
{
    try
    {
        // Get current user ID from claims
        var userId = User.FindFirstValue("Id");
        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
        {
            return Unauthorized(new { message = "User not authenticated properly" });
        }

        // Validate the project exists and belongs to this manager
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
        {
            return NotFound(new { message = "Project not found" });
        }

        if (project.ManagerId != currentUserId)
        {
            return Forbid();
        }

        // Validate all programmers exist and are of type 'Programmer' (type 2)
        var programmers = await _context.Users
            .Where(u => programmerIds.Contains(u.Id) && u.UserType == 2)
            .ToListAsync();

        if (programmers.Count != programmerIds.Count)
        {
            return BadRequest(new { message = "One or more selected users are not valid programmers" });
        }

        // Remove existing allocations
        var existingAllocations = await _context.ProjectProgrammers
            .Where(pp => pp.ProjectId == id)
            .ToListAsync();
            
        _context.ProjectProgrammers.RemoveRange(existingAllocations);

        // Add new allocations
        foreach (var programmerId in programmerIds)
        {
            _context.ProjectProgrammers.Add(new ProjectProgrammer
            {
                ProjectId = id,
                ProgrammerId = programmerId,
                AllocationDate = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Programmers allocated successfully" });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error allocating programmers to project with ID {ProjectId}", id);
        return StatusCode(500, new { message = "Internal server error" });
    }
}

// Also add a GET endpoint to view allocated programmers
[HttpGet("{id}/programmers")]
[Authorize]
public async Task<ActionResult<IEnumerable<User>>> GetProjectProgrammers(int id)
{
    try
    {
        // Get current user ID from claims
        var userId = User.FindFirstValue("Id");
        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int currentUserId))
        {
            return Unauthorized(new { message = "User not authenticated properly" });
        }

        // Check project exists
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
        {
            return NotFound(new { message = "Project not found" });
        }

        // Verify access rights (Project Manager or Programmer assigned to this project)
        var userType = User.FindFirstValue("UserType");
        if (string.IsNullOrEmpty(userType) || !int.TryParse(userType, out int userTypeId))
        {
            return Unauthorized(new { message = "User type not determined" });
        }

        if (userTypeId == 1 && project.ManagerId != currentUserId)
        {
            return Forbid();
        }
        else if (userTypeId == 2 && !await _context.Tasks.AnyAsync(t => t.ProjectId == id && t.AssigneeId == currentUserId))
        {
            return Forbid();
        }

        // Get programmers allocated to this project
        var programmers = await _context.Users
            .Join(_context.ProjectProgrammers,
                user => user.Id,
                pp => pp.ProgrammerId,
                (user, pp) => new { User = user, ProjectProgrammer = pp })
            .Where(x => x.ProjectProgrammer.ProjectId == id)
            .Select(x => new {
                Id = x.User.Id,
                FullName = x.User.FullName,
                Email = x.User.Email,
                UserType = x.User.UserType,
                UserTypeDescription = x.User.UserTypeDescription,
                AllocationDate = x.ProjectProgrammer.AllocationDate
            })
            .ToListAsync();

        return Ok(programmers);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving programmers for project with ID {ProjectId}", id);
        return StatusCode(500, new { message = "Internal server error" });
    }
}


        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.Id == id);
        }
    }
}