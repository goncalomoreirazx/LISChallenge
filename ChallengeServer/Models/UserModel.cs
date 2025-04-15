using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeServer.Models
{
    [Table("Utilizadores")]
    public class User
    {
        [Key]
        [Column("ID_Utilizador")]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        [Column("Nome")]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(255)]
        [Column("Email")]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [Column("PasswordHash")]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        [Column("ID_TipoUtilizador")]
        public int UserType { get; set; }
        
        // Navigation property for user type (still calculate description for backward compatibility)
        [NotMapped]
        public string UserTypeDescription => UserType == 1 ? "Project Manager" : "Programmer";
        
        [Column("DataCriacao")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Column("DataUltimoLogin")]
        public DateTime? LastLoginAt { get; set; }
        
        // Navigation property for UserType
        [ForeignKey("UserType")]
        public UserType Type { get; set; } = null!;
        
        // Navigation properties for relationships
        public ICollection<Project> ManagedProjects { get; set; } = new List<Project>();
        public ICollection<ProjectTask> AssignedTasks { get; set; } = new List<ProjectTask>();
    }
}