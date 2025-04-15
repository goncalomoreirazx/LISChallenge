using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeServer.Models
{
    [Table("TiposUtilizador")]
    public class UserType
    {
        [Key]
        [Column("ID_TipoUtilizador")]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        [Column("Nome")]
        public string Name { get; set; } = string.Empty;
        
        // Navigation property for users of this type
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}