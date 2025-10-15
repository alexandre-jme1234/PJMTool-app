import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TaskOverlayComponent } from './task-overlay.component';
import { TaskService } from '../../services/task/task.service';
import { TaskModel } from '../../services/task/task.model';

describe('TaskOverlayComponent', () => {
  let component: TaskOverlayComponent;
  let fixture: ComponentFixture<TaskOverlayComponent>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  const mockTask: TaskModel = {
    id: 1,
    nom: 'Test Task',
    description: 'Test Description',
    etat: 'TODO',
    priorite: { id: 1, nom: 'HAUTE' },
    commanditaire: { 
      id: 1, 
      nom: 'User1',
      role_app: 'MEMBRE',
      email: 'user1@test.com',
      password: null,
      etat_connexion: false,
      tache_commanditaire: null,
      taches_destinataire: null,
      projets_utilisateur: null,
      projets: null,
      roles_projet: null
    },
    destinataire: { 
      id: 2, 
      nom: 'User2',
      role_app: 'MEMBRE',
      email: 'user2@test.com',
      password: null,
      etat_connexion: false,
      tache_commanditaire: null,
      taches_destinataire: null,
      projets_utilisateur: null,
      projets: null,
      roles_projet: null
    },
    est_termine: false,
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2025-01-31'),
    projet: null
  };

  const mockPermissions = {
    canAddMember: true,
    canCreateTask: true,
    canAssignTask: true,
    canUpdateTask: true,
    canViewTask: true,
    canViewDashboard: true,
    canBeNotified: true,
    canViewHistory: true
  };

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj('TaskService', ['createTask', 'updateTask']);
    mockTaskService.createTask.and.returnValue(of({ data: { id: 1 } }));
    mockTaskService.updateTask.and.returnValue(of(mockTask));

    await TestBed.configureTestingModule({
      imports: [TaskOverlayComponent, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: mockTaskService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskOverlayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable edit mode when task is opened', () => {
    component.task = mockTask;
    component.isOpen = true;
    
    component.ngOnChanges();
    
    expect(component.isEditMode).toBe(true);
    expect(component.editTask).toEqual(mockTask);
  });

  it('should disable edit mode when overlay is closed', () => {
    component.task = mockTask;
    component.isOpen = false;
    
    component.ngOnChanges();
    
    expect(component.isEditMode).toBe(false);
    expect(component.editTask).toBeUndefined();
  });

  it('should enable edit mode manually', () => {
    component.task = mockTask;
    component.isEditMode = false;
    
    component.enableEdit();
    
    expect(component.isEditMode).toBe(true);
    expect(component.editTask).toEqual(mockTask);
  });

  it('should create new task when enableEdit is called without task', () => {
    component.task = null;
    
    component.enableEdit();
    
    expect(component.isEditMode).toBe(true);
    expect(component.editTask).toBeDefined();
  });

  it('should update existing task on save', () => {
    component.editTask = { ...mockTask, nom: 'Updated Task' };
    spyOn(component.taskUpdated, 'emit');
    
    component.saveEdit();
    
    expect(mockTaskService.updateTask).toHaveBeenCalled();
    expect(component.taskUpdated.emit).toHaveBeenCalled();
  });

  it('should create new task when id is 0', () => {
    component.editTask = { ...mockTask, id: 0 };
    spyOn(component.taskUpdated, 'emit');
    
    component.saveEdit();
    
    expect(mockTaskService.createTask).toHaveBeenCalled();
    expect(component.taskUpdated.emit).toHaveBeenCalled();
  });

  it('should not save if editTask is undefined', () => {
    component.editTask = undefined;
    
    component.saveEdit();
    
    expect(mockTaskService.updateTask).not.toHaveBeenCalled();
    expect(mockTaskService.createTask).not.toHaveBeenCalled();
  });

  it('should emit close event on cancel', () => {
    spyOn(component.close, 'emit');
    
    component.cancelEdit();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should handle null values in task request', () => {
    component.editTask = {
      id: 1,
      nom: null,
      description: null,
      etat: 'TODO',
      priorite: null,
      commanditaire: null,
      destinataire: null,
      projet: null,
      date_debut: null,
      date_fin: null
    };
    
    component.saveEdit();
    
    expect(mockTaskService.updateTask).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nom: null,
        description: null,
        etat: 'TODO'
      })
    );
  });

  it('should convert dates to timestamps when emitting taskUpdated', () => {
    component.editTask = {
      ...mockTask,
      date_debut: '2025-01-01',
      date_fin: '2025-01-31'
    };
    spyOn(component.taskUpdated, 'emit');
    
    component.saveEdit();
    
    expect(component.taskUpdated.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        date_debut: jasmine.any(Number),
        date_fin: jasmine.any(Number)
      })
    );
  });

  it('should handle null dates when emitting taskUpdated', () => {
    component.editTask = {
      ...mockTask,
      date_debut: null,
      date_fin: null
    };
    spyOn(component.taskUpdated, 'emit');
    
    component.saveEdit();
    
    expect(component.taskUpdated.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        date_debut: null,
        date_fin: null
      })
    );
  });

  it('should use default values for missing commanditaire and destinataire', () => {
    component.editTask = {
      ...mockTask,
      commanditaire: null,
      destinataire: null
    };
    
    component.saveEdit();
    
    expect(mockTaskService.updateTask).toHaveBeenCalledWith(
      jasmine.objectContaining({
        commanditaire_id: 1,
        destinataire_id: 1
      })
    );
  });

  it('should respect user permissions', () => {
    component.userPermissions = mockPermissions;
    
    expect(component.userPermissions.canUpdateTask).toBe(true);
  });

  it('should handle task update error gracefully', () => {
    component.editTask = mockTask;
    mockTaskService.updateTask.and.returnValue(
      throwError(() => new Error('Update failed'))
    );
    
    // Should not throw
    expect(() => component.saveEdit()).not.toThrow();
  });
});
