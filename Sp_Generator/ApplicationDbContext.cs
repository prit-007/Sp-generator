using Microsoft.EntityFrameworkCore;

namespace Sp_Generator
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    }
}
