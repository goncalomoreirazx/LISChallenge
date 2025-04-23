using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeServer.Models
{
    [Table("ProjectosProgramadores")]
    public class ProjectProgrammer
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }
        
        [Required]
        [Column("ID_Projecto")]
        public int ProjectId { get; set; }
        
        [Required]
        [Column("ID_Programador")]
        public int ProgrammerId { get; set; }
        
        [Column("DataAtribuicao")]
        public DateTime AllocationDate { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("ProjectId")]
        public Project Project { get; set; } = null!;
        
        [ForeignKey("ProgrammerId")]
        public User Programmer { get; set; } = null!;
    }
}