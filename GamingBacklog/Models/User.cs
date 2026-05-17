using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GamingBacklog.Models
{
    public class User
    {
        public User()
        {
            BacklogEntries = new List<UserBacklog>();
        }

        public int Id { get; set; }

        [Display(Name = "Ім'я користувача")]
        public string? Username { get; set; }

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        public string? PasswordHash { get; set; }

        public virtual ICollection<UserBacklog>? BacklogEntries { get; set; }
    }
}