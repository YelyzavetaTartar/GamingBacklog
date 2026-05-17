using System.Text.Json.Serialization;
namespace GamingBacklog.Models
{
    public class Status
    {
        public Status()
        {
            BacklogEntries = new List<UserBacklog>();
        }

        public int Id { get; set; }
        public string? Name { get; set; }
        public virtual ICollection<UserBacklog>? BacklogEntries { get; set; }
    }
}
