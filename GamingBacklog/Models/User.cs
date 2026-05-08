using System.ComponentModel.DataAnnotations;

namespace GamingBacklog.Models
{
    public class User
    {
        public User()
        {
            BacklogEntries = new List<UserBacklog>();
        }

        public int Id { get; set; }

        [Required(ErrorMessage = "Введіть ім'я користувача")]
        [Display(Name = "Ім'я")]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public virtual ICollection<UserBacklog> BacklogEntries { get; set; }
    }
}