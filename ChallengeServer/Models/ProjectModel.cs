using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeServer.Models
{
    [Table("Projectos")]
    public class Project
    {
        [Key]
        [Column("ID_Projecto")]
        public int Id { get; set; }
        
        [Required]
        [StringLength(150)]
        [Column("Nome")]
        public string Name { get; set; } = string.Empty;
        
        [Column("Descricao")]
        public string? Description { get; set; }
        
        [Column("Orcamento")]
        public decimal? Budget { get; set; }
        
        [Required]
        [Column("DataCriacao")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        [Column("ID_Gestor")]
        public int ManagerId { get; set; }
        
        // Navigation property for the manager (Project Manager)
        [ForeignKey("ManagerId")]
        public User Manager { get; set; } = null!;

        // In the Project model:
        [NotMapped]
        public ICollection<User> AssignedProgrammers { get; set; } = new List<User>();
        
        // Navigation property for tasks related to this project
        public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    }
}