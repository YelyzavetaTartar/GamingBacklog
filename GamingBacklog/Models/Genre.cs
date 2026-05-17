using System.Text.Json.Serialization;
namespace GamingBacklog.Models
{
    public class Genre
    {
        public Genre()
        {
            BacklogEntries = new List<UserBacklog>();
        }

    public int Id { get; set; }
        public string? Name { get; set; }

        [JsonIgnore]
        public virtual ICollection<UserBacklog>? BacklogEntries { get; set; }
    }
}