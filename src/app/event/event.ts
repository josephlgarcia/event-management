import { Component, ViewChild } from '@angular/core';
import { ToastComponent } from '../shared/toast.component';
import { EventResponse, EventService } from '../service/event.service';
import { VenueResponse } from '../service/venue.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event',
  imports: [FormsModule, CommonModule, ToastComponent],
  templateUrl: './event.html',
  styleUrl: './event.css',
})
export class Event {
  @ViewChild(ToastComponent) toast!: ToastComponent;

  name: string = '';
  date: string = '';
  venueId: number | undefined;
  events: EventResponse[] = [];
  venues: VenueResponse[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // NEW: Track if we're editing an existing event
  editingEventId: number | undefined;
  isEditMode: boolean = false;

  fieldErrors: { [key: string]: string } = {};

  constructor(private readonly eventService: EventService) { 
    this.loadVenues();
    this.loadEvents();
  }

  loadVenues() {
    this.isLoading = true;
    this.errorMessage = '';
    this.eventService.getVenues().subscribe({
      next: (data) => {
        this.venues = data;
        this.isLoading = false;
        this.toast?.success('Venues loaded successfully');
      },
      error: (err) => {
        const errorMsg = this.formatError(err.error.message);
        this.errorMessage = errorMsg;
        this.toast?.error(errorMsg);
        this.isLoading = false;
      }
    });
  }

  loadEvents() {
    this.isLoading = true;
    this.errorMessage = '';
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
        this.toast?.success('Events loaded successfully');
      },
      error: (err) => {
        const errorMsg = this.formatError(err.error.message);
        this.errorMessage = errorMsg;
        this.toast?.error(errorMsg);
        this.isLoading = false;
      }
    });
  }

  addEvent() {
    this.fieldErrors = {};
    this.isLoading = true;
    this.errorMessage = '';

    const eventData = {
      name: this.name,
      date: this.date,
      venueId: this.venueId
    };

    // Check if we're in edit mode
    if (this.isEditMode && this.editingEventId) {
      // UPDATE existing event
      this.eventService.update(this.editingEventId, eventData).subscribe({
        next: (updatedEvent) => {
          // Replace the event in the array
          const index = this.events.findIndex(e => e.id === this.editingEventId);
          if (index !== -1) {
            this.events[index] = updatedEvent;
          }
          this.toast?.success('Event updated successfully');
          this.resetForm();
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      // CREATE new event
      this.eventService.create(eventData).subscribe({
        next: (data) => {
          this.events.push(data);
          this.toast?.success('Event created successfully');
          this.resetForm();
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  // MODIFIED: Set form to edit mode
  editEvent(id: number | undefined) {
    if (id) {
      const event = this.events.find(e => e.id === id);
      if (event) {
        this.name = event.name;
        this.date = event.date;
        this.venueId = event.venue?.id;
        
        this.editingEventId = id;
        this.isEditMode = true;
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  // NEW: Cancel edit mode
  cancelEdit() {
    this.resetForm();
  }

  deleteEvent(id: number | undefined) {
    if (id) {
      this.eventService.delete(id).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== id);
          this.toast?.success('Event deleted successfully');
          
          // If we were editing this event, cancel edit mode
          if (this.editingEventId === id) {
            this.resetForm();
          }
        },
        error: (err) => {
          const errorMsg = this.formatError(err.error.message);
          this.errorMessage = errorMsg;
          this.toast?.error(errorMsg);
        }
      });
    }
  }

  // NEW: Reset form to create mode
  private resetForm() {
    this.name = '';
    this.date = '';
    this.venueId = undefined;
    this.editingEventId = undefined;
    this.isEditMode = false;
    this.fieldErrors = {};
  }

  // NEW: Centralized error handling
  private handleError(err: any) {
    const errorMsg = this.formatError(err.error);
    this.errorMessage = errorMsg;
    this.toast?.error(errorMsg);

    if (err?.error?.errors && Array.isArray(err.error.errors)) {
      for (const e of err.error.errors) {
        this.fieldErrors[e.field] = e.message;
      }
    }
    this.isLoading = false;
  }

  private formatError(err: any): string {
    // RFC7807 style with validation errors array: { type, title, status, detail, errors: [{field, message, rejectedValue}] }
    if (err?.type) {
      let msg = `${err.title || 'Error'}: ${err.detail || ''}`;

      // If there are field-level validation errors, add them
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const fieldErrors = err.errors
          .map((e: any) => `• ${e.field}: ${e.message}`)
          .join('\n');
        msg = `${err.title || 'Validation Error'}\n${fieldErrors}`;
      }
      return msg;
    }
    // ApiResponse style: { status: 'error', message }
    if (err?.message) {
      return err.message;
    }
    // Generic fallback
    const msg = `HTTP ${err?.status ?? 'unknown'}: ${err?.statusText ?? err?.message ?? 'An error occurred'}`;
    return msg;
  }
}