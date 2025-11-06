import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

export interface Venue {
  id: number;
  name: string;
  address?: string;
  capacity?: number;
}

export interface VenueRequest {
  name: string;
  address?: string;
  capacity?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  // Base API URL for venues backend
  private readonly apiUrl = 'http://localhost:8080/api/v1/venue';

  constructor(private readonly http: HttpClient) { }

  // Get all venues
  getAll(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.apiUrl);
  }

  // Get a single venue by ID
  getById(id: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.apiUrl}/${id}`);
  }

  // Create a new venue
  create(venue: VenueRequest): Observable<Venue> {
    return this.http.post<Venue>(this.apiUrl, venue);
  }

  // Update an existing venue
  update(id: number, venue: VenueRequest): Observable<Venue> {
    return this.http.put<Venue>(`${this.apiUrl}/${id}`, venue);
  }

  // Delete a venue
  delete(id: number): Observable<void> {
    return this.http.delete<unknown>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }

  ping(): Observable<{ ok: boolean; message?: string }> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map(() => ({
        ok: true,
        message: 'Backend reachable'
      })),
    );
  }
}