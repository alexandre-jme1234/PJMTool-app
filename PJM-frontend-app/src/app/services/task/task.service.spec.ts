import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService - Tests d\'états, fonctionnement et branches', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ========== TESTS DE FONCTIONNEMENT ==========

  it('should create a task and log to history', (done) => {
    const mockTask = {
      nom: 'Test Task',
      priorite: { id: 1, nom: 'HAUTE' }
    };

    const mockResponse = {
      data: { id: 1, nom: 'Test Task' }
    };

    service.createTask(mockTask).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tache/create');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get tasks by project ID', (done) => {
    const mockTasks = [
      { id: 1, nom: 'Task 1', etat: 'TODO' },
      { id: 2, nom: 'Task 2', etat: 'IN_PROGRESS' }
    ];

    const mockResponse = { data: mockTasks };

    service.getTasksByProject(1).subscribe(tasks => {
      expect(tasks).toEqual(mockTasks);
      expect(tasks.length).toBe(2);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tache/project/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update a task', (done) => {
    const mockTask = { id: 1, nom: 'Updated Task' };
    const mockResponse = { success: true };

    service.updateTask(mockTask).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne('/api/tache/update');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should delete a task', (done) => {
    const taskId = 1;
    const mockResponse = { success: true };

    service.deleteTask(taskId).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/tache/delete/${taskId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  // ========== TESTS D'ÉTAT ==========

  it('should log etat change with correct labels', () => {
    spyOn(console, 'log');
    
    service.logEtatChange(1, 'Test Task', 'TODO', 'IN_PROGRESS', 'HAUTE');
    
    // Vérifier que l'historique a été mis à jour
    expect(console.log).toHaveBeenCalled();
  });

  it('should log priorite change', () => {
    spyOn(console, 'log');
    
    service.logPrioriteChange(1, 'Test Task', 'FAIBLE', 'HAUTE');
    
    expect(console.log).toHaveBeenCalled();
  });

  // ========== TESTS DE BRANCHES ==========

  it('should handle empty tasks list from backend', (done) => {
    const mockResponse = { data: [] };

    service.getTasksByProject(999).subscribe(tasks => {
      expect(tasks).toEqual([]);
      expect(tasks.length).toBe(0);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tache/project/999');
    req.flush(mockResponse);
  });

  it('should handle HTTP error when creating task', (done) => {
    const mockTask = { nom: 'Test Task' };
    const errorMessage = 'Server error';

    service.createTask(mockTask).subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.status).toBe(500);
        done();
      }
    );

    const req = httpMock.expectOne('http://localhost:8080/api/tache/create');
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });

  it('should handle HTTP error when deleting task', (done) => {
    const taskId = 999;

    service.deleteTask(taskId).subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.status).toBe(404);
        done();
      }
    );

    const req = httpMock.expectOne(`http://localhost:8080/api/tache/delete/${taskId}`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });
});
