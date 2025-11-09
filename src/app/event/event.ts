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
        const errorMsg = this.formatError(err);
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
        const errorMsg = this.formatError(err);
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
    this.eventService.create({
      name: this.name,
      date: this.date,
      venueId: this.venueId
    }).subscribe({
      next: (data) => {
        this.events.push(data);
        this.toast?.success('Event created successfully');
        this.name = '';
        this.date = '';
        this.venueId = undefined;
        this.fieldErrors = {};
        this.isLoading = false;
      },
      error: (err) => {
        const errorMsg = this.formatError(err);
        this.errorMessage = errorMsg;
        this.toast?.error(errorMsg);

        if (err?.error?.errors && Array.isArray(err.error.errors)) {
          for (const e of err.error.errors) {
            this.fieldErrors[e.field] = e.message;
          }
        }
        this.isLoading = false;
      }
    });
  }

  deleteEvent(id: number | undefined) {
    if (id) {
      this.eventService.delete(id).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== id);
          this.toast?.success('Event deleted successfully');
        },
        error: (err) => {
          const errorMsg = this.formatError(err);
          this.errorMessage = errorMsg;
          this.toast?.error(errorMsg);
        }
      });
    }
  }

  private formatError(err: any): string {

    // RFC7807 style with validation errors array: { type, title, status, detail, errors: [{field, message, rejectedValue}] }
    if (err?.error?.type) {
      let msg = `${err.error.title || 'Error'}: ${err.error.detail || ''}`;

      // If there are field-level validation errors, add them
      if (err.error.errors && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
        const fieldErrors = err.error.errors
          .map((e: any) => `• ${e.field}: ${e.message}`)
          .join('\n');
        msg = `${err.error.title || 'Validation Error'}\n${fieldErrors}`;
      }
      return msg;
    }
    // ApiResponse style: { status: 'error', message }
    if (err?.error?.message) {
      return err.error.message;
    }
    // Generic fallback
    const msg = `HTTP ${err?.status ?? 'unknown'}: ${err?.statusText ?? err?.message ?? 'An error occurred'}`;
    return msg;
  }
}
