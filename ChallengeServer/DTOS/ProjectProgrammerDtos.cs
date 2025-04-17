using System.ComponentModel.DataAnnotations;

namespace ChallengeServer.DTOs
{
    public class ProjectProgrammerDto
    {
        public int Id { get; set; }
        public int ProgrammerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime AllocationDate { get; set; }
    }

    public class AllocateProgrammersDto
    {
        [Required]
        public List<int> ProgrammerIds { get; set; } = new List<int>();
    }
}