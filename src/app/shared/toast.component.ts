import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
        @for (toast of toasts; track toast.id) {
            <div class="toast toast-{{ toast.type }}">
            <span>{{ toast.message }}</span>
            <button (click)="remove(toast.id)">&times;</button>
            </div>
        }
        </div>
    `,
    styles: [`
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
    }

    .toast {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        color: white;
        font-size: 14px;
    }

    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .toast-success {
        background: #28a745;
    }

    .toast-error {
        background: #dc3545;
    }

    .toast-warning {
        background: #ffc107;
        color: #212529;
    }

    .toast-info {
        background: #17a2b8;
    }

    .toast button {
        background: none;
        border: none;
        color: inherit;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        margin-left: 12px;
        line-height: 1;
        opacity: 0.7;
    }

    .toast button:hover {
        opacity: 1;
    }

    .toast span {
        flex: 1;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    `]
})
export class ToastComponent {
    toasts: Toast[] = [];
    private nextId = 1;

    show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) {
        const toast: Toast = {
            id: this.nextId++,
            message,
            type
        };

        this.toasts.push(toast);

        if (duration > 0) {
            setTimeout(() => this.remove(toast.id), duration);
        }
    }

    remove(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }

    success(message: string, duration = 5000) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration = 7000) {
        this.show(message, 'error', duration);
    }

    warning(message: string, duration = 5000) {
        this.show(message, 'warning', duration);
    }

    info(message: string, duration = 5000) {
        this.show(message, 'info', duration);
    }
}
