using System.ComponentModel.DataAnnotations;

namespace ChallengeServer.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime Deadline { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? CompletedAt { get; set; }
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int AssigneeId { get; set; }
        public string AssigneeName { get; set; } = string.Empty;
    }

    public class CreateTaskDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(4000)]
        public string? Description { get; set; }
        
        [Required]
        public DateTime Deadline { get; set; }
        
        public string? Status { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        public int AssigneeId { get; set; }
    }

    public class UpdateTaskDto
    {
        [StringLength(200, MinimumLength = 2)]
        public string? Name { get; set; }
        
        [StringLength(4000)]
        public string? Description { get; set; }
        
        public DateTime? Deadline { get; set; }
        
        public string? Status { get; set; }
        
        public int? AssigneeId { get; set; }
    }

    public class UpdateTaskStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}