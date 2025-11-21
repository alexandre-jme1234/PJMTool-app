import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService, ProjetRequest } from './project.service';
import { Project } from './project.model';
import { TaskModel } from '../task/task.model';
import { DOCUMENT } from '@angular/common';

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
  });
});
