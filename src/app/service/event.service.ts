import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Venue, VenueService } from './venue.service';

// Event model matching backend EventResponse
export interface Event {
  id?: number;
  name: string;
  date: string; // ISO date string
  venue?: {
    id?: number;
    name?: string;
    address?: string;
    capacity?: number;
  };
}

// Event creation/update request
export interface EventRequest {
  name: string;
  location: string;
  date: string;
  venueId?: number;
}


@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Base API URL for events backend
  private readonly apiUrl = 'http://localhost:8080/api/v1/event';

  constructor(private readonly http: HttpClient) { }

  // Get all events
  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }


  // Get a single event by ID
  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  // Create a new event
  create(event: EventRequest): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  // Update an existing event
  update(id: number, event: EventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  // Delete an event
  delete(id: number): Observable<void> {
    // backend may return an ApiResponse; ignore payload and expose void
    return this.http.delete<unknown>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }

  // Get all venues
  getVenues(): Observable<Venue[]> {
    return new VenueService(this.http).getAll();
  }

  // Simple ping to check backend availability using /api/events
  ping(): Observable<{ ok: boolean; message?: string }> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((events) => ({
        ok: true,
        message: `Received ${events.length} event(s)`
      })),
      catchError((err) => {
        console.error('Ping failed', err);
        return of({ ok: false, message: err.message || 'Backend unreachable' });
      })
    );
  }
}