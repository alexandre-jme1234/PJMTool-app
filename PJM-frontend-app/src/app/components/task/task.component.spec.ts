import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { TaskComponent } from './task.component';
import { TaskService } from '../../services/task/task.service';
import { TaskModel } from '../../services/task/task.model';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockActivatedRoute: any;

  const mockTask: TaskModel = {
    id: 1,
    nom: 'Test Task',
    description: 'Test Description',
    etat: 'TODO',
    priorite: { id: 1, nom: 'HAUTE' },
    commanditaire: { id: 1, nom: 'User1' },
    destinataire: { id: 2, nom: 'User2' },
    est_termine: false,
    date_debut: '2025-01-01',
    date_fin: '2025-01-31',
    date_creation: '2025-01-01',
    projet_id: 1
  };

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj('TaskService', ['getTasksByProject']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    mockTaskService.getTasksByProject.and.returnValue(of([mockTask]));

    await TestBed.configureTestingModule({
      imports: [TaskComponent, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: Location, useValue: mockLocation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display task in card mode by default', () => {
    component.task = mockTask;
    component.mode = 'card';
    fixture.detectChanges();
    
    expect(component.mode).toBe('card');
    expect(component.task).toEqual(mockTask);
  });

  it('should display task in detail mode', () => {
    component.task = mockTask;
    component.mode = 'detail';
    fixture.detectChanges();
    
    expect(component.mode).toBe('detail');
  });

  it('should load task in detail mode when task is not provided', () => {
    component.task = undefined;
    component.mode = 'detail';
    component.projectId = 1;
    
    component.ngOnInit();
    
    expect(mockTaskService.getTasksByProject).toHaveBeenCalledWith(1);
  });

  it('should not load task if already provided', () => {
    component.task = mockTask;
    component.mode = 'detail';
    
    component.ngOnInit();
    
    expect(mockTaskService.getTasksByProject).not.toHaveBeenCalled();
  });

  it('should not load task in card mode', () => {
    component.task = undefined;
    component.mode = 'card';
    component.projectId = 1;
    
    component.ngOnInit();
    
    expect(mockTaskService.getTasksByProject).not.toHaveBeenCalled();
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('should find correct task by id when loading', () => {
    const tasks = [
      { ...mockTask, id: 1, nom: 'Task 1' },
      { ...mockTask, id: 2, nom: 'Task 2' }
    ];
    mockTaskService.getTasksByProject.and.returnValue(of(tasks));
    component.task = undefined;
    component.mode = 'detail';
    component.projectId = 1;
    
    component.ngOnInit();
    
    expect(component.task?.id).toBe(1);
  });

  it('should handle task not found scenario', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('999');
    mockTaskService.getTasksByProject.and.returnValue(of([mockTask]));
    component.task = undefined;
    component.mode = 'detail';
    component.projectId = 1;
    
    component.ngOnInit();
    
    expect(component.task).toBeUndefined();
  });
});
