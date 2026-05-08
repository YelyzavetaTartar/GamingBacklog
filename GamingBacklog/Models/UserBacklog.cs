using GamingBacklog.Models;
using System.ComponentModel.DataAnnotations;

namespace GamingBacklog.Models
{
    public class UserBacklog
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public int GameId { get; set; }
        public int GenreId { get; set; }
        public int PlatformId { get; set; }
        public int StatusId { get; set; }

        [Display(Name = "Рейтинг цікавості")]
        [Range(1, 5)]
        public int InterestLevel { get; set; }

        [Display(Name = "Оцінка")]
        [Range(1, 10)]
        public int? FinalScore { get; set; } 

        public virtual User User { get; set; }
        public virtual Game Game { get; set; }
        public virtual Genre Genre { get; set; }
        public virtual Platform Platform { get; set; }
        public virtual Status Status { get; set; }
    }
}