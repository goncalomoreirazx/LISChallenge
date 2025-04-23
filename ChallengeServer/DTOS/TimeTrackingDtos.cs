using System.ComponentModel.DataAnnotations;

namespace ChallengeServer.DTOs
{
    public class TimeEntryDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public string TaskName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Hours { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateTimeEntryDto
    {
        [Required]
        public int TaskId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        [Range(0.1, 24, ErrorMessage = "Hours must be between 0.1 and 24")]
        public decimal Hours { get; set; }
        
        public string? Notes { get; set; }
    }

    public class TimeEntrySummaryDto
    {
        public int TaskId { get; set; }
        public decimal TotalHours { get; set; }
        public int EntriesCount { get; set; }
        public DateTime? LastEntryDate { get; set; }
        public decimal? LastEntryHours { get; set; }
    }
}