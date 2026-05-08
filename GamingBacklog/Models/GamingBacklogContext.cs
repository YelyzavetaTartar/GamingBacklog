using GamingBacklog.Models;
using Microsoft.EntityFrameworkCore;

namespace GamingBacklog.Models
{    
    public class GamingBacklogContext : DbContext
    {
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Game> Games { get; set; }
        public virtual DbSet<Genre> Genres { get; set; }
        public virtual DbSet<Platform> Platforms { get; set; }
        public virtual DbSet<Status> Statuses { get; set; }
        public virtual DbSet<UserBacklog> UserBacklogs { get; set; }

        public GamingBacklogContext(DbContextOptions<GamingBacklogContext> options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}