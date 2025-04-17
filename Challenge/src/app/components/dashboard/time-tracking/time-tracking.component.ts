// src/app/components/dashboard/time-tracking/time-tracking.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../services/task.service';

interface TimeEntry {
  taskId: number;
  taskName: string;
  date: string;
  hours: number;
  notes: string;
}

@Component({
  selector: 'app-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TimeTrackingComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() timeLogged = new EventEmitter<TimeEntry>();
  
  newEntry: TimeEntry = {
    taskId: 0,
    taskName: '',
    date: this.getTodayDate(),
    hours: 1,
    notes: ''
  };

  isSubmitting = false;
  formError: string | null = null;
  
  // Time entries for the current task
  recentEntries: TimeEntry[] = [];
  totalHours = 0;

  ngOnInit(): void {
    if (this.task) {
      this.newEntry.taskId = this.task.id;
      this.newEntry.taskName = this.task.name;
      
      // In a real application, these entries would be loaded from a service
      this.loadRecentEntries();
    }
  }
  
  loadRecentEntries(): void {
    // This is mock data - in a real app, you would load this from a service
    if (this.task) {
      // Generate some sample data
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      this.recentEntries = [
        {
          taskId: this.task.id,
          taskName: this.task.name,
          date: this.formatDateForInput(yesterday),
          hours: 2.5,
          notes: 'Implemented core functionality'
        },
        {
          taskId: this.task.id,
          taskName: this.task.name,
          date: this.formatDateForInput(twoDaysAgo),
          hours: 1.5,
          notes: 'Initial setup and planning'
        }
      ];
      
      this.calculateTotalHours();
    }
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
    
    // In a real application, you would save this to a service/API
    // For this demo, we'll just add it to our local array
    setTimeout(() => {
      // Create a copy of the entry to avoid reference issues
      const entryToAdd = {...this.newEntry};
      
      // Add to recent entries
      this.recentEntries.unshift(entryToAdd);
      this.calculateTotalHours();
      
      // Emit the event
      this.timeLogged.emit(entryToAdd);
      
      // Reset form
      this.newEntry = {
        taskId: this.task ? this.task.id : 0,
        taskName: this.task ? this.task.name : '',
        date: this.getTodayDate(),
        hours: 1,
        notes: ''
      };
      
      this.isSubmitting = false;
    }, 500); // Simulate API call
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