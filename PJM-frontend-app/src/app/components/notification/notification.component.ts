import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      <div *ngFor="let notification of notifications$ | async"
           class="p-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in"
           [ngClass]="{
             'bg-green-50 border-l-4 border-green-500': notification.type === 'success',
             'bg-red-50 border-l-4 border-red-500': notification.type === 'error',
             'bg-yellow-50 border-l-4 border-yellow-500': notification.type === 'warning',
             'bg-blue-50 border-l-4 border-blue-500': notification.type === 'info'
           }">
        <span class="text-2xl">
          {{ notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : notification.type === 'warning' ? '⚠️' : 'ℹ️' }}
        </span>
        <div class="flex-1">
          <p class="font-medium"
             [ngClass]="{
               'text-green-800': notification.type === 'success',
               'text-red-800': notification.type === 'error',
               'text-yellow-800': notification.type === 'warning',
               'text-blue-800': notification.type === 'info'
             }">
            {{ notification.message }}
          </p>
        </div>
        <button (click)="remove(notification.id)"
                class="text-gray-400 hover:text-gray-600 font-bold text-xl">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class NotificationComponent {
  notifications$;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications;
  }

  remove(id: number) {
    this.notificationService.remove(id);
  }
}
