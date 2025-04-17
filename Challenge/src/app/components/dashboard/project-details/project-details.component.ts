import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project } from '../../../services/project.service';
import { AuthService, User } from '../../../services/auth-service.service';
import { UserService } from '../../../services/user.service';
import { TaskListComponent } from '../../dashboard/task-list/task-list.component';

declare var bootstrap: any; // For Bootstrap modal

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TaskListComponent]
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
  
  // For programmers allocation
  projectProgrammers: any[] = [];
  availableProgrammers: User[] = [];
  selectedProgrammerIds: number[] = [];
  loadingProgrammers = false;
  loadingAvailableProgrammers = false;
  allocationError: string | null = null;
  isAllocating = false;
  private programmerModal: any;
  
  isSubmitting = false;
  formError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
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
    
    // Initialize Bootstrap modal
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const modalEl = document.getElementById('programmerModal');
        if (modalEl) {
          this.programmerModal = new bootstrap.Modal(modalEl);
        }
      }, 0);
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
        
        // Load project programmers
        this.loadProjectProgrammers();
      },
      error: (err) => {
        this.error = 'Failed to load project details. Please try again.';
        this.loading = false;
        console.error('Error loading project', err);
      }
    });
  }
  
  loadProjectProgrammers(): void {
    if (!this.projectId) return;
    
    this.loadingProgrammers = true;
    this.projectService.getProjectProgrammers(this.projectId).subscribe({
      next: (programmers) => {
        this.projectProgrammers = programmers;
        this.loadingProgrammers = false;
      },
      error: (err) => {
        console.error('Error loading project programmers', err);
        this.loadingProgrammers = false;
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
    
    // Create a clean object with only the fields to update
    const projectToUpdate = {
      name: this.editedProject.name.trim(),
      description: this.editedProject.description,
      budget: this.editedProject.budget
    };
  
    this.projectService.updateProject(this.projectId, projectToUpdate).subscribe({
      next: () => {
        // Exit edit mode and reload project
        this.isEditing = false;
        this.isSubmitting = false;
        this.loadProject();
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.error?.message) {
          this.formError = err.error.message;
        } else if (err.error?.errors) {
          // Handle validation errors
          const firstError = err.error.errors[0];
          this.formError = `${firstError.field}: ${firstError.errors[0]}`;
        } else {
          this.formError = 'Failed to update project. Please try again.';
        }
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
  
  // Programmer allocation methods
  showProgrammerModal(): void {
    // Reset state
    this.selectedProgrammerIds = this.projectProgrammers.map(p => p.id);
    this.allocationError = null;
    this.isAllocating = false;
    
    // Load available programmers
    this.loadAvailableProgrammers();
    
    // Show the modal
    if (this.programmerModal) {
      this.programmerModal.show();
    }
  }

  loadAvailableProgrammers(): void {
    this.loadingAvailableProgrammers = true;
    this.userService.getProgrammers().subscribe({
      next: (programmers) => {
        this.availableProgrammers = programmers;
        this.loadingAvailableProgrammers = false;
      },
      error: (err) => {
        console.error('Error loading available programmers', err);
        this.loadingAvailableProgrammers = false;
      }
    });
  }

  isProgrammerSelected(programmerId: number): boolean {
    return this.selectedProgrammerIds.includes(programmerId);
  }

  toggleProgrammerSelection(programmerId: number): void {
    if (this.isProgrammerSelected(programmerId)) {
      this.selectedProgrammerIds = this.selectedProgrammerIds.filter(id => id !== programmerId);
    } else {
      this.selectedProgrammerIds.push(programmerId);
    }
  }

  allocateProgrammers(): void {
    if (!this.projectId) return;
    
    this.isAllocating = true;
    this.allocationError = null;
    
    this.projectService.allocateProgrammers(this.projectId, this.selectedProgrammerIds).subscribe({
      next: () => {
        this.isAllocating = false;
        
        // Close the modal
        if (this.programmerModal) {
          this.programmerModal.hide();
        }
        
        // Reload programmers
        this.loadProjectProgrammers();
      },
      error: (err) => {
        this.isAllocating = false;
        this.allocationError = err.error?.message || 'Failed to allocate programmers. Please try again.';
        console.error('Error allocating programmers', err);
      }
    });
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