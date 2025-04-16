import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project } from '../../../services/project.service';
import { AuthService } from '../../../services/auth-service.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProjectDetailComponent implements OnInit {
  projectId!: number;
  project: Project | null = null;
  loading = true;
  error: string | null = null;
  
  // For editing project
  isEditing = false;
  editedProject = {
    name: '',
    description: '',
    budget: null as number | null
  };
  
  isSubmitting = false;
  formError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get project ID from route
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !isNaN(+idParam)) {
      this.projectId = +idParam;
      this.loadProject();
    } else {
      this.error = 'Invalid project ID';
      this.loading = false;
    }
  }

  loadProject(): void {
    this.loading = true;
    this.error = null;
    
    this.projectService.getProject(this.projectId).subscribe({
      next: (data) => {
        this.project = data;
        this.loading = false;
        
        // Initialize edit form with current values
        this.resetEditForm();
      },
      error: (err) => {
        this.error = 'Failed to load project details. Please try again.';
        this.loading = false;
        console.error('Error loading project', err);
      }
    });
  }

  // Check if user is a project manager
  isProjectManager(): boolean {
    return this.authService.isProjectManager();
  }

  // Toggle edit mode
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form when canceling edit
      this.resetEditForm();
    }
  }

  // Reset edit form to current project values
  resetEditForm(): void {
    if (this.project) {
      this.editedProject = {
        name: this.project.name,
        description: this.project.description || '',
        budget: this.project.budget
      };
    }
    this.formError = null;
  }

  // Submit edited project
  submitEditedProject(): void {
    // Validate form
    if (!this.editedProject.name) {
      this.formError = 'Project name is required';
      return;
    }

    this.isSubmitting = true;
    this.formError = null;
    
    // Convert budget to number if it's a string
    let projectToSubmit = {
      ...this.editedProject
    };
    
    if (typeof projectToSubmit.budget === 'string') {
      projectToSubmit.budget = projectToSubmit.budget ? parseFloat(projectToSubmit.budget as unknown as string) : null;
    }

    this.projectService.updateProject(this.projectId, projectToSubmit).subscribe({
      next: () => {
        // Exit edit mode and reload project
        this.isEditing = false;
        this.isSubmitting = false;
        this.loadProject();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.formError = err.error?.message || 'Failed to update project. Please try again.';
        console.error('Error updating project', err);
      }
    });
  }

  // Delete the current project
  deleteProject(): void {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      this.projectService.deleteProject(this.projectId).subscribe({
        next: () => {
          // Navigate back to projects list
          this.router.navigate(['/projectos']);
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

  // Go back to projects list
  goBack(): void {
    this.router.navigate(['/projectos']);
  }
}