using Microsoft.EntityFrameworkCore;
using ChallengeServer.Models;

namespace ChallengeServer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserType> UserTypes { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> Tasks { get; set; }
        public DbSet<ProjectProgrammer> ProjectProgrammers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure unique constraint for email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
                
            // Configure unique constraint for user type name
            modelBuilder.Entity<UserType>()
                .HasIndex(ut => ut.Name)
                .IsUnique();
                
            // Configure relationships
            modelBuilder.Entity<User>()
                .HasMany(u => u.ManagedProjects)
                .WithOne(p => p.Manager)
                .HasForeignKey(p => p.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<User>()
                .HasMany(u => u.AssignedTasks)
                .WithOne(t => t.Assignee)
                .HasForeignKey(t => t.AssigneeId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Project>()
                .HasMany(p => p.Tasks)
                .WithOne(t => t.Project)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Fix for decimal precision warning
            modelBuilder.Entity<Project>()
                .Property(p => p.Budget)
                .HasColumnType("decimal(18,2)");

             modelBuilder.Entity<ProjectProgrammer>()
                .HasOne(pp => pp.Project)
                .WithMany()
                .HasForeignKey(pp => pp.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            
             modelBuilder.Entity<ProjectProgrammer>()
                .HasOne(pp => pp.Programmer)
                .WithMany()
                .HasForeignKey(pp => pp.ProgrammerId)
                .OnDelete(DeleteBehavior.Restrict);
                }
    }
}