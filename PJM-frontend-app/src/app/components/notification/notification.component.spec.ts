import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService } from '../../services/notification/notification.service';
import { BehaviorSubject } from 'rxjs';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let notificationsSubject: BehaviorSubject<any[]>;

  beforeEach(async () => {
    notificationsSubject = new BehaviorSubject<any[]>([]);
    
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['remove']);
    Object.defineProperty(mockNotificationService, 'notifications', {
      get: () => notificationsSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [NotificationComponent],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to notifications on init', (done) => {
    component.notifications$.subscribe(notifications => {
      expect(notifications).toEqual([]);
      done();
    });
  });

  it('should display success notification', (done) => {
    const successNotification = {
      id: 1,
      type: 'success',
      message: 'Operation successful'
    };

    notificationsSubject.next([successNotification]);

    component.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].message).toBe('Operation successful');
      done();
    });
  });

  it('should display error notification', (done) => {
    const errorNotification = {
      id: 2,
      type: 'error',
      message: 'An error occurred'
    };

    notificationsSubject.next([errorNotification]);

    component.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('error');
      done();
    });
  });

  it('should display warning notification', (done) => {
    const warningNotification = {
      id: 3,
      type: 'warning',
      message: 'Warning message'
    };

    notificationsSubject.next([warningNotification]);

    component.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('warning');
      done();
    });
  });

  it('should display info notification', (done) => {
    const infoNotification = {
      id: 4,
      type: 'info',
      message: 'Information message'
    };

    notificationsSubject.next([infoNotification]);

    component.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('info');
      done();
    });
  });

  it('should display multiple notifications', (done) => {
    const notifications = [
      { id: 1, type: 'success', message: 'Success 1' },
      { id: 2, type: 'error', message: 'Error 1' },
      { id: 3, type: 'warning', message: 'Warning 1' }
    ];

    notificationsSubject.next(notifications);

    component.notifications$.subscribe(notifs => {
      expect(notifs.length).toBe(3);
      done();
    });
  });

  it('should call remove method when notification is dismissed', () => {
    component.remove(1);
    
    expect(mockNotificationService.remove).toHaveBeenCalledWith(1);
  });

  it('should handle empty notifications array', (done) => {
    notificationsSubject.next([]);

    component.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(0);
      done();
    });
  });

  it('should update when new notification is added', (done) => {
    notificationsSubject.next([{ id: 1, type: 'success', message: 'First' }]);

    setTimeout(() => {
      notificationsSubject.next([
        { id: 1, type: 'success', message: 'First' },
        { id: 2, type: 'info', message: 'Second' }
      ]);

      component.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(2);
        done();
      });
    }, 100);
  });

  it('should update when notification is removed', (done) => {
    notificationsSubject.next([
      { id: 1, type: 'success', message: 'First' },
      { id: 2, type: 'info', message: 'Second' }
    ]);

    setTimeout(() => {
      notificationsSubject.next([{ id: 2, type: 'info', message: 'Second' }]);

      component.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].id).toBe(2);
        done();
      });
    }, 100);
  });
});
