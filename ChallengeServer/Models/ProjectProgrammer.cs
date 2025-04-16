using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeServer.Models
{
public class ProjectProgrammer
{
    [Key]
    public int Id { get; set; }
    
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    
    public int ProgrammerId { get; set; }
    public User Programmer { get; set; } = null!;
    
    public DateTime AllocationDate { get; set; } = DateTime.UtcNow;
}
}