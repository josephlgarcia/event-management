import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { EventService } from '../service/event.service';


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class Home {
    backendStatus: string | null = null;

    constructor(private readonly eventService: EventService) { }

    async checkBackend() {
        this.backendStatus = 'Checking...';
        this.eventService.ping().subscribe({
            next: (res) => {
                this.backendStatus = res.ok ? 'Backend reachable' : `Backend: ${res.message || 'unknown'}`;
            },
            error: (err) => {
                console.error('Backend ping failed', err);
                this.backendStatus = `Error: ${err.status || 'unknown'} ${err.statusText || ''}`;
            }
        });
    }
}
