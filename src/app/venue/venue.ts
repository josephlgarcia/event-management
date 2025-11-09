import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from '../shared/toast.component';
import { VenueResponse, VenueService } from '../service/venue.service';

@Component({
  selector: 'app-venue',
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './venue.html',
  styleUrl: './venue.css',
})
export class Venue {
  @ViewChild(ToastComponent) toast!: ToastComponent;

  name: string = '';
  address: string = '';
  capacity: number | undefined;
  venues: VenueResponse[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  fieldErrors: { [key: string]: string } = {};

  constructor(private readonly venueService: VenueService) {
    this.loadVenues();
  }

  private loadVenues() {
    this.isLoading = true;
    this.errorMessage = '';
    this.venueService.getAll().subscribe({
      next: (venues) => {
        this.venues = venues;
        this.isLoading = false;
        this.toast?.success('Venues loaded successfully');
      },
      error: (error) => {
        const errorMsg = this.formatError(error);
        this.errorMessage = errorMsg;
        this.isLoading = false;
        this.toast?.error(this.errorMessage);
      }
    });
  }

  addVenue() {
    this.fieldErrors = {};
    this.isLoading = true;
    this.errorMessage = '';
    this.venueService.create({
      name: this.name,
      address: this.address,
      capacity: this.capacity
    }).subscribe({
      next: (venue) => {
        this.venues.push(venue);
        this.toast?.success('Venue created successfully');
        this.name = '';
        this.address = '';
        this.capacity = undefined;
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

  deleteVenue(id: number | undefined) {
    if (id) {
      this.venueService.delete(id).subscribe({
        next: () => {
          this.venues = this.venues.filter(v => v.id !== id);
          this.toast?.success('Venue deleted successfully');
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
