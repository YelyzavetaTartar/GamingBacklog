namespace GamingBacklog.Models
{
    public class Platform
    {
    public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<UserBacklog> BacklogEntries { get; set; }
    }
}