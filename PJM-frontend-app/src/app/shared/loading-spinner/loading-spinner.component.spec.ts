import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { LoadingService } from '../../services/loading/loading.service';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

describe('LoadingSpinnerComponent - Tests d\'états, fonctionnement et branches', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let router: jasmine.SpyObj<Router>;
  let loadingSubject: BehaviorSubject<boolean>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    loadingSubject = new BehaviorSubject<boolean>(false);
    routerEventsSubject = new Subject<any>();

    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['loadingOn', 'loadingOff'], {
      loading$: loadingSubject.asObservable()
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loading$ from LoadingService', () => {
    expect(component.loading$).toBe(loadingService.loading$);
  });

  it('should have detectRouteTransitions default to false', () => {
    expect(component.detectRouteTransitions).toBe(false);
  });

  it('should call loadingOn when RouteConfigLoadStart is emitted', () => {
    component.detectRouteTransitions = true;
    component.ngOnInit();
    routerEventsSubject.next(new RouteConfigLoadStart({} as any));
    expect(loadingService.loadingOn).toHaveBeenCalledTimes(1);
  });

  it('should call loadingOff when RouteConfigLoadEnd is emitted', () => {
    component.detectRouteTransitions = true;
    component.ngOnInit();
    routerEventsSubject.next(new RouteConfigLoadEnd({} as any));
    expect(loadingService.loadingOff).toHaveBeenCalledTimes(1);
  });

  it('should NOT subscribe to router events when detectRouteTransitions is false', () => {
    component.detectRouteTransitions = false;
    component.ngOnInit();
    routerEventsSubject.next(new RouteConfigLoadStart({} as any));
    expect(loadingService.loadingOn).not.toHaveBeenCalled();
  });
});