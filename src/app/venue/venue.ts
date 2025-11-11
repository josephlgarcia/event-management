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
  
  editingVenueId: number | undefined;
  isEditMode: boolean = false;

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
        const errorMsg = this.formatError(error.error.message);
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

    const venueData = {
      name: this.name,
      address: this.address,
      capacity: this.capacity
    };

    if (this.isEditMode && this.editingVenueId) {
      // Update existing venue
      this.venueService.update(this.editingVenueId, venueData).subscribe({
        next: (updatedVenue) => {
          const index = this.venues.findIndex(v => v.id === this.editingVenueId);
          if (index !== -1) {
            this.venues[index] = updatedVenue;
          }
          this.toast?.success('Venue updated successfully');
          this.resetForm();
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      // Create new venue
      this.venueService.create(venueData).subscribe({
        next: (newVenue) => {
          this.venues.push(newVenue);
          this.toast?.success('Venue added successfully');
          this.resetForm();
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  deleteVenue(id: number | undefined) {
    if (id) {

      if (!confirm('Are you sure you want to delete this venue?')) {
        return;
      }

      this.venueService.delete(id).subscribe({
        next: () => {
          this.venues = this.venues.filter(v => v.id !== id);
          this.toast?.success('Venue deleted successfully');

          // If we were editing this venue, cancel edit mode
          if (this.editingVenueId === id) {
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

  editVenue(id: number | undefined) {
    if (id) {
      const venue = this.venues.find(v => v.id === id);
      if (venue) {
        this.name = venue.name;
        this.address = venue.address ?? '';
        this.capacity = venue.capacity;

        this.editingVenueId = venue.id;
        this.isEditMode = true;

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.name = '';
    this.address = '';
    this.capacity = undefined;
    this.editingVenueId = undefined;
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
