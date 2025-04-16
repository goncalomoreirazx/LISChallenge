using System.ComponentModel.DataAnnotations;

namespace ChallengeServer.DTOs
{
    public class CreateProjectDto
    {
        [Required]
        [StringLength(150, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(4000)] // Limit the description length
        public string? Description { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Budget must be a positive number")]
        public decimal? Budget { get; set; }
    }

    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? Budget { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ManagerId { get; set; }
        public string ManagerName { get; set; } = string.Empty; // Optionally include manager info
    }
}