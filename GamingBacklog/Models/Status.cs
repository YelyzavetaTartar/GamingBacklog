namespace GamingBacklog.Models
{
    public class Status
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<UserBacklog> BacklogEntries { get; set; }
    }
}
