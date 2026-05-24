using System.ComponentModel.DataAnnotations;

namespace GamingBacklog.Models
{
    public class Game
    {
        public Game()
        {
            BacklogEntries = new List<UserBacklog>();
        }

        public int Id { get; set; }

        [Required]
        [Display(Name = "Назва гри")]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public virtual ICollection<UserBacklog>? BacklogEntries { get; set; }
    }
}