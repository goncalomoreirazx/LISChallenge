using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeServer.Models
{
    // Named ProjectTask to avoid conflict with System.Threading.Tasks.Task
    [Table("Tarefas")]
    public class ProjectTask
    {
        [Key]
        [Column("ID_Tarefa")]
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        [Column("Nome")]
        public string Name { get; set; } = string.Empty;
        
        [Column("Descricao")]
        public string? Description { get; set; }
        
        [Required]
        [Column("DataCriacao")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        [Column("DataLimite")]
        public DateTime Deadline { get; set; }
        
        [Required]
        [StringLength(50)]
        [Column("Estado")]
        public string Status { get; set; } = "Pendente";
        
        [Column("DataConclusao")]
        public DateTime? CompletedAt { get; set; }
        
        [Required]
        [Column("ID_Projecto")]
        public int ProjectId { get; set; }
        
        [Required]
        [Column("ID_Responsavel")]
        public int AssigneeId { get; set; }
        
        // Navigation properties
        [ForeignKey("ProjectId")]
        public Project Project { get; set; } = null!;
        
        [ForeignKey("AssigneeId")]
        public User Assignee { get; set; } = null!;
    }
}