import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService, Project } from '../../../services/project.service';
import { AuthService } from '../../../services/auth-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  error: string | null = null;
  
  // For new project form
  showNewProjectForm = false;
  newProject = {
    name: '',
    description: '',
    budget: null as number | null
  };
  
  isSubmitting = false;
  formError: string | null = null;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;
    
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load projects. Please try again.';
        this.loading = false;
        console.error('Error loading projects', err);
      }
    });
  }

  // Check if user is a project manager
  isProjectManager(): boolean {
    return this.authService.isProjectManager();
  }

  // Toggle new project form
  toggleNewProjectForm(): void {
    this.showNewProjectForm = !this.showNewProjectForm;
    if (!this.showNewProjectForm) {
      // Reset form when hiding
      this.resetForm();
    }
  }

  // Reset form fields
  resetForm(): void {
    this.newProject = {
      name: '',
      description: '',
      budget: null
    };
    this.formError = null;
  }

  // Submit new project
  submitNewProject(): void {
    // Validate form
    if (!this.newProject.name) {
      this.formError = 'Project name is required';
      return;
    }
  
    this.isSubmitting = true;
    this.formError = null;
    
    // Create a clean project object
    let projectToSubmit = {
      name: this.newProject.name.trim(),
      // Sanitize description - remove any HTML tags or replace < and > characters
      description: this.newProject.description ? 
                   this.newProject.description.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '',
      budget: null as number | null
    };
    
    // Convert budget to number if it's a string
    if (this.newProject.budget !== null) {
      if (typeof this.newProject.budget === 'string') {
        projectToSubmit.budget = parseFloat(this.newProject.budget as unknown as string) || null;
      } else {
        projectToSubmit.budget = this.newProject.budget;
      }
    }
  
    this.projectService.createProject(projectToSubmit).subscribe({
      next: () => {
        // Reset form and close it
        this.resetForm();
        this.showNewProjectForm = false;
        this.isSubmitting = false;
        
        // Reload projects to show the new one
        this.loadProjects();
      },
      error: (err) => {
        this.isSubmitting = false;
        // More detailed error handling
        if (err.error && err.error.message) {
          this.formError = err.error.message;
        } else if (err.status === 400) {
          this.formError = 'Invalid project data. Please check your inputs.';
        } else {
          this.formError = 'Failed to create project. Please try again.';
        }
        console.error('Error creating project', err);
      }
    });
  }

  // Delete a project
  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          // Remove from local array
          this.projects = this.projects.filter(p => p.id !== id);
        },
        error: (err) => {
          alert('Failed to delete project. Please try again.');
          console.error('Error deleting project', err);
        }
      });
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}