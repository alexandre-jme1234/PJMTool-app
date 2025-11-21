import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService, ProjetRequest } from './project.service';
import { Project } from './project.model';
import { TaskModel } from '../task/task.model';
import { DOCUMENT } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService,
        {provide: DOCUMENT, useValue: document}
      ]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjects', () => {
    it('should return projects from API', () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 1, nom: 'Projet 1', createur: 'User1', date_echeance: '2025-12-31' },
          { id: 2, nom: 'Projet 2', createur: 'User2', date_echeance: '2025-12-31' }
        ]
      };

      service.getProjects().subscribe(projects => {
        expect(projects).toEqual(mockResponse.data);
        expect(projects.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/all');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getProjectById', () => {
    it('should return a single project by ID', () => {
      const mockProject = { id: 1, nom: 'Test Project', createur: 'TestUser' };

      service.getProjectById(1).subscribe(project => {
        expect(project).toEqual(mockProject);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/id/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockProject);
    });
  });

  describe('onCreateProject', () => {
    it('should create a new project', () => {
      const newProject = {
        nom: 'New Project',
        description: 'Test description',
        createur: 'TestUser'
      };
      const mockResponse = { success: true, data: { id: 3, ...newProject } };

      service.onCreateProject(newProject).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/create');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProject);
      req.flush(mockResponse);
    });
  });

  describe('onDeleteProject', () => {
    it('should delete a project', () => {
      const projectToDelete: any = { id: 1, nom: 'To Delete', createur: 'User' };
      const mockResponse = { success: true, message: 'Project deleted' };

      service.onDeleteProject(projectToDelete).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/delete/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getUsersRoledByProjectId', () => {
    it('should return users with roles for a project', () => {
      const mockUsers = [
        { nom: 'User1', role_app: 'ADMIN' },
        { nom: 'User2', role_app: 'MEMBER' }
      ];

      service.getUsersRoledByProjectId(1).subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/users-roled/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('updateProject', () => {
    it('should update a project locally', (done) => {
      const updatedProject: Partial<Project> = {
        id: 1,
        nom: 'Updated Project Name'
      };

      service.updateProject(updatedProject).subscribe(projects => {
        const updated = projects.find(p => p.id === 1);
        expect(updated?.nom).toBe('Updated Project Name');
        done();
      });
    });

    it('should return current projects if project not found', (done) => {
      const nonExistentProject: Partial<Project> = {
        id: 999,
        nom: 'Non-existent'
      };

      service.updateProject(nonExistentProject).subscribe(projects => {
        expect(projects).toBeDefined();
        done();
      });
    });

    it('should return current projects if project id is undefined', (done) => {
      const projectWithoutId: Partial<Project> = {
        nom: 'No ID Project'
      };

      service.updateProject(projectWithoutId).subscribe(projects => {
        expect(projects).toBeDefined();
        const unchanged = projects.find(p => p.id === 1);
        expect(unchanged?.nom).toBe('Projet A');
        done();
      });
    });
  });

  describe('addTaskToProject', () => {
    it('should add a task to a project', () => {
      const task: any = {
        id: 1,
        nom: 'Test Task',
        description: 'Test Description'
      };

      service.addTaskToProject(1, task);

      service.projects$.subscribe(projects => {
        const project = projects.find(p => p.id === 1);
        expect(project?.taches).toBeDefined();
        expect(project?.taches?.length).toBeGreaterThan(0);
      });
    });

    it('should not add task if project does not exist', () => {
      const task: any = {
        id: 1,
        nom: 'Test Task',
        description: 'Test Description'
      };
      const initialProjects = service.projectsSubject.value;

      service.addTaskToProject(999, task);

      service.projects$.subscribe(projects => {
        expect(projects).toEqual(initialProjects);
      });
    });

    it('should initialize taches array if it does not exist', () => {
      const task: any = {
        id: 1,
        nom: 'Test Task',
        description: 'Test Description'
      };

      // S'assurer que le projet n'a pas de taches
      const projects = service.projectsSubject.value;
      const project = projects.find(p => p.id === 1);
      if (project) {
        delete project.taches;
      }

      service.addTaskToProject(1, task);

      service.projects$.subscribe(updatedProjects => {
        const updatedProject = updatedProjects.find(p => p.id === 1);
        expect(updatedProject?.taches).toBeDefined();
        expect(Array.isArray(updatedProject?.taches)).toBe(true);
        expect(updatedProject?.taches?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('BehaviorSubjects', () => {
    it('should emit projects through projects$ observable', (done) => {
      service.projects$.subscribe(projects => {
        expect(projects).toBeDefined();
        expect(Array.isArray(projects)).toBe(true);
        done();
      });
    });

    it('should add user to usersRoleProjets', (done) => {
      const newUser = { nom: 'NewUser', role: 'MEMBER' };

      service.addUser(newUser);

      service.usersRoleProjets$.subscribe(users => {
        const found = users.find(u => u.nom === 'NewUser');
        if (found) {
          expect(found.nom).toBe('NewUser');
          done();
        }
      });
    });

    it('should set users with setUsersRoleProjets', (done) => {
      const users = [
        { nom: 'User1', role: 'ADMIN' },
        { nom: 'User2', role: 'MEMBER' }
      ];

      service.setUsersRoleProjets(users);

      service.usersRoleProjets$.subscribe(result => {
        expect(result.length).toBe(2);
        expect(result[0].nom).toBe('User1');
        done();
      });
    });
  });

  describe('postProject', () => {
    it('should post a project with ProjetRequest interface', () => {
      const projetRequest: ProjetRequest = {
        nom: 'API Project',
        description: 'Description',
        createur: 'Creator',
        date_echeance: new Date()
      };
      const mockResponse = { success: true, data: { id: 5, ...projetRequest } };

      service.postProject(projetRequest).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.nom).toBe('API Project');
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/create');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should post a project without optional fields', () => {
      const projetRequest: ProjetRequest = {
        nom: 'Minimal Project',
        createur: 'Creator'
      };
      const mockResponse = { success: true, data: { id: 6, ...projetRequest } };

      service.postProject(projetRequest).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.nom).toBe('Minimal Project');
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/create');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('createProjectWithUserLog', () => {
    let userService: any;
    let consoleErrorSpy: jasmine.Spy;
    let consoleLogSpy: jasmine.Spy;

    beforeEach(() => {
      userService = jasmine.createSpyObj('UserService', ['getUserByNom']);
      consoleErrorSpy = spyOn(console, 'error');
      consoleLogSpy = spyOn(console, 'log');
    });

    it('should create project successfully when user is found and backend succeeds', (done) => {
      // Arrange
      const mockUser = { nom: 'TestUser', email: 'test@test.com' };
      const projet = { nom: 'New Project', description: 'Test Description' };
      const mockResponse = { success: true, data: { id: 1, ...projet, createur: 'TestUser' } };

      userService.getUserByNom.and.returnValue(of(mockUser));

      // Act
      service.createProjectWithUserLog('TestUser', projet, userService);

      // Assert
      setTimeout(() => {
        const req = httpMock.expectOne('http://localhost:8080/api/projet/create');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
          nom: 'New Project',
          description: 'Test Description',
          createur: 'TestUser'
        });
        req.flush(mockResponse);

        setTimeout(() => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            '[Info] Payload envoyé pour création de projet:',
            jasmine.objectContaining({
              nom: 'New Project',
              createur: 'TestUser'
            })
          );
          expect(consoleLogSpy).toHaveBeenCalledWith(
            '[Succès] Projet créé:',
            mockResponse.data
          );
          done();
        }, 50);
      }, 50);
    });

    it('should log error when user is null', (done) => {
      // Arrange
      const projet = { nom: 'New Project', description: 'Test' };
      userService.getUserByNom.and.returnValue(of(null));

      // Act
      service.createProjectWithUserLog('UnknownUser', projet, userService);

      // Assert
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[Erreur] Utilisateur non trouvé ou nom manquant',
          null
        );
        expect(userService.getUserByNom).toHaveBeenCalledWith('UnknownUser');
        done();
      }, 100);
    });

    it('should log error when user has no nom property', (done) => {
      // Arrange
      const mockUser = { email: 'test@test.com' } as any;
      const projet = { nom: 'New Project', description: 'Test' };
      userService.getUserByNom.and.returnValue(of(mockUser));

      // Act
      service.createProjectWithUserLog('TestUser', projet, userService);

      // Assert
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[Erreur] Utilisateur non trouvé ou nom manquant',
          mockUser
        );
        done();
      }, 100);
    });

    it('should log error when backend returns unsuccessful response', (done) => {
      // Arrange
      const mockUser = { nom: 'TestUser', email: 'test@test.com' };
      const projet = { nom: 'New Project', description: 'Test' };
      const mockResponse = { success: false, error: 'Validation failed' };

      userService.getUserByNom.and.returnValue(of(mockUser));

      // Act
      service.createProjectWithUserLog('TestUser', projet, userService);

      // Assert
      setTimeout(() => {
        const req = httpMock.expectOne('http://localhost:8080/api/projet/create');
        req.flush(mockResponse);

        setTimeout(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[Erreur backend]',
            mockResponse
          );
          done();
        }, 50);
      }, 50);
    });

    it('should log error when HTTP request for project creation fails', (done) => {
      // Arrange
      const mockUser = { nom: 'TestUser', email: 'test@test.com' };
      const projet = { nom: 'New Project', description: 'Test' };
      const mockError = { status: 500, statusText: 'Internal Server Error' };

      userService.getUserByNom.and.returnValue(of(mockUser));

      // Act
      service.createProjectWithUserLog('TestUser', projet, userService);

      // Assert
      setTimeout(() => {
        const req = httpMock.expectOne('http://localhost:8080/api/projet/create');
        req.flush('Server error', mockError);

        setTimeout(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[Erreur HTTP lors de la création du projet]',
            jasmine.anything()
          );
          done();
        }, 50);
      }, 50);
    });

    it('should log error when getUserByNom HTTP request fails', (done) => {
      // Arrange
      const projet = { nom: 'New Project', description: 'Test' };
      const mockError = new Error('Network error');

      userService.getUserByNom.and.returnValue(throwError(() => mockError));

      // Act
      service.createProjectWithUserLog('TestUser', projet, userService);

      // Assert
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "[Erreur HTTP lors de la récupération de l'utilisateur]",
          mockError
        );
        done();
      }, 100);
    });

    it('should handle backend response without success property', (done) => {
      // Arrange
      const mockUser = { nom: 'TestUser', email: 'test@test.com' };
      const projet = { nom: 'New Project', description: 'Test' };
      const mockResponse = { data: { id: 1 } } as any; // Pas de propriété success

      userService.getUserByNom.and.returnValue(of(mockUser));

      // Act
      service.createProjectWithUserLog('TestUser', projet, userService);

      // Assert
      setTimeout(() => {
        const req = httpMock.expectOne('http://localhost:8080/api/projet/create');
        req.flush(mockResponse);

        setTimeout(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[Erreur backend]',
            mockResponse
          );
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle multiple tasks added to same project', () => {
      // Arrange
      const task1: any = { id: 1, nom: 'Task 1', description: 'Desc 1' };
      const task2: any = { id: 2, nom: 'Task 2', description: 'Desc 2' };

      // Act
      service.addTaskToProject(1, task1);
      service.addTaskToProject(1, task2);

      // Assert
      service.projects$.subscribe(projects => {
        const project = projects.find(p => p.id === 1);
        expect(project?.taches?.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should maintain project state after failed update', (done) => {
      // Arrange
      const initialProjects = service.projectsSubject.value;
      const invalidUpdate: Partial<Project> = {
        id: 999,
        nom: 'Should Not Update'
      };

      // Act
      service.updateProject(invalidUpdate).subscribe(projects => {
        // Assert
        expect(projects).toEqual(initialProjects);
        expect(projects.find(p => p.nom === 'Should Not Update')).toBeUndefined();
        done();
      });
    });

    it('should handle partial project updates', (done) => {
      // Arrange
      const partialUpdate: Partial<Project> = {
        id: 1,
        description: 'Updated description only'
      };

      // Act
      service.updateProject(partialUpdate).subscribe(projects => {
        // Assert
        const updated = projects.find(p => p.id === 1);
        expect(updated?.description).toBe('Updated description only');
        expect(updated?.nom).toBe('Projet A'); // Nom inchangé
        done();
      });
    });

    it('should emit updated projects through BehaviorSubject after task addition', (done) => {
      // Arrange
      const task: any = { id: 10, nom: 'Observable Test Task' };
      let emissionCount = 0;

      // Act
      const subscription = service.projects$.subscribe(projects => {
        emissionCount++;
        if (emissionCount === 2) { // Première émission = valeur initiale, deuxième = après ajout
          const project = projects.find(p => p.id === 1);
          expect(project?.taches?.some(t => t.nom === 'Observable Test Task')).toBe(true);
          subscription.unsubscribe();
          done();
        }
      });

      service.addTaskToProject(1, task);
    });

    it('should handle getProjects with empty data array', () => {
      // Arrange
      const mockResponse = { success: true, data: [] };

      // Act
      service.getProjects().subscribe(projects => {
        // Assert
        expect(projects).toEqual([]);
        expect(projects.length).toBe(0);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/all');
      req.flush(mockResponse);
    });

    it('should handle getUsersRoledByProjectId with empty array', () => {
      // Arrange
      const mockUsers: any[] = [];

      // Act
      service.getUsersRoledByProjectId(1).subscribe(users => {
        // Assert
        expect(users).toEqual([]);
        expect(users.length).toBe(0);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/projet/users-roled/1');
      req.flush(mockUsers);
    });
  });
});
