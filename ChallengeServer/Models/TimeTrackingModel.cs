using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeServer.Models
{
    [Table("TimeTracking")]
    public class TimeTracking
    {
        [Key]
        [Column("ID_TimeEntry")]
        public int Id { get; set; }
        
        [Required]
        [Column("ID_Tarefa")]
        public int TaskId { get; set; }
        
        [Required]
        [Column("ID_Utilizador")]
        public int UserId { get; set; }
        
        [Required]
        [Column("Data")]
        public DateTime Date { get; set; }
        
        [Required]
        [Column("Horas")]
        public decimal Hours { get; set; }
        
        [Column("Observacoes")]
        public string? Notes { get; set; }
        
        [Required]
        [Column("DataRegisto")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("TaskId")]
        public ProjectTask Task { get; set; } = null!;
        
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}