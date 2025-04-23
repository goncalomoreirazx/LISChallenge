import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../services/task.service';
import { TimeTrackingService, TimeEntry, CreateTimeEntry } from '../../../services/time-tracking.service';

@Component({
  selector: 'app-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TimeTrackingComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() timeLogged = new EventEmitter<any>(); // Using 'any' to avoid interface conflicts
  
  newEntry: CreateTimeEntry = {
    taskId: 0,
    date: this.getTodayDate(),
    hours: 1,
    notes: ''
  };

  isSubmitting = false;
  formError: string | null = null;
  
  // Time entries for the current task
  recentEntries: TimeEntry[] = [];
  totalHours = 0;
  loadingEntries = false;
  entriesError: string | null = null;

  constructor(private timeTrackingService: TimeTrackingService) {}

  ngOnInit(): void {
    if (this.task) {
      this.newEntry.taskId = this.task.id;
      this.loadTimeEntries();
    }
  }
  
  ngOnChanges(): void {
    // Reload entries when the task changes
    if (this.task) {
      this.newEntry.taskId = this.task.id;
      this.loadTimeEntries();
    }
  }
  
  loadTimeEntries(): void {
    if (!this.task) return;
    
    this.loadingEntries = true;
    this.entriesError = null;
    
    this.timeTrackingService.getTimeEntriesForTask(this.task.id).subscribe({
      next: (entries) => {
        this.recentEntries = entries;
        this.calculateTotalHours();
        this.loadingEntries = false;
      },
      error: (error) => {
        console.error('Error loading time entries:', error);
        this.entriesError = 'Failed to load time entries. Please try again.';
        this.loadingEntries = false;
      }
    });
  }
  
  calculateTotalHours(): void {
    this.totalHours = this.recentEntries.reduce((sum, entry) => sum + entry.hours, 0);
  }

  submitTimeEntry(): void {
    if (!this.task) {
      this.formError = 'No task selected';
      return;
    }
    
    if (this.newEntry.hours <= 0) {
      this.formError = 'Hours must be greater than 0';
      return;
    }
    
    this.isSubmitting = true;
    this.formError = null;
    
    // Prepare entry for submission
    const entryToSubmit: CreateTimeEntry = {
      taskId: this.task.id,
      date: this.newEntry.date,
      hours: this.newEntry.hours,
      notes: this.newEntry.notes || undefined
    };
    
    this.timeTrackingService.createTimeEntry(entryToSubmit).subscribe({
      next: (response) => {
        // Add the new entry to the list
        this.recentEntries.unshift(response);
        this.calculateTotalHours();
        
        // Emit the event
        this.timeLogged.emit(response);
        
        // Reset form
        this.newEntry = {
          taskId: this.task ? this.task.id : 0,
          date: this.getTodayDate(),
          hours: 1,
          notes: ''
        };
        
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.error && error.error.message) {
          this.formError = error.error.message;
        } else {
          this.formError = 'Failed to log time. Please try again.';
        }
        console.error('Error logging time:', error);
      }
    });
  }
  
  getTodayDate(): string {
    return this.formatDateForInput(new Date());
  }
  
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}