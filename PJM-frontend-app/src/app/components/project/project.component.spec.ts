import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectComponent } from './project.component';
import { ProjectService } from '../../services/projects/project.service';
import { TaskService } from '../../services/task/task.service';
import { UserService } from '../../services/user/user.service';
import { RoleService } from '../../services/role/role.service';
import { PermissionService } from '../../services/permissions/permission.service';
import { ProjetModel } from '../../services/projects/projet.model';
import { TaskModel } from '../../services/task/task.model';
import { UserModel } from '../../services/user/user.model';
import { RoleModel } from '../../services/role/role.model';

describe('ProjectComponent', () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRoleService: jasmine.SpyObj<RoleService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockProject: any = {
    id: 1,
    nom: 'Test Project',
    createur: 'TestUser',
    description: 'Test Description',
    date_echeance: '2025-12-31',
    taches: [],
    utilisateurs_projet: []
  };

  const mockTask: any = {
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
    date_creation: new Date('2025-01-01'),
    projet_id: 1
  };

  const mockUser: UserModel = {
    id: 1,
    nom: 'TestUser',
    email: 'test@test.com',
    role_app: 'ADMINISTRATEUR',
    password: null,
    etat_connexion: true,
    tache_commanditaire: [],
    taches_destinataire: [],
    projets_utilisateur: [],
    projets: [],
    roles_projet: []
  };

  const mockRole: RoleModel = {
    id: 1,
    nom: 'ADMINISTRATEUR',
    ajouter_membre: true,
    creer_tache: true,
    assigne_tache: true,
    maj_tache: true,
    vue_tache: true,
    vue_tableau_de_bord: true,
    etre_notifie: true,
    vue_historique_modifications: true
  };

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjectById',
      'getUsersRoledByProjectId',
      'updateProject',
      'onDeleteProject'
    ]);
    mockTaskService = jasmine.createSpyObj('TaskService', [
      'updateTask',
      'getProjectHistory',
      'logEtatChange',
      'logPrioriteChange',
      'getTasksByProject'
    ]);
    mockUserService = jasmine.createSpyObj('UserService', [
      'getUsers',
      'getUserById',
      'addUserRoledToProject'
    ]);
    mockRoleService = jasmine.createSpyObj('RoleService', ['getRoles']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['getPermissionsByRole']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    // Setup default return values
    mockProjectService.getProjectById.and.returnValue(of({ data: mockProject }));
    mockProjectService.getUsersRoledByProjectId.and.returnValue(of({ data: [] }));
    mockTaskService.updateTask.and.returnValue(of(mockTask));
    mockTaskService.getTasksByProject.and.returnValue(of([]));
    mockTaskService.getProjectHistory.and.returnValue([]);
    mockUserService.getUsers.and.returnValue(of([mockUser]));
    mockRoleService.getRoles.and.returnValue([mockRole]);
    mockPermissionService.getPermissionsByRole.and.returnValue({
      canAddMember: true,
      canCreateTask: true,
      canAssignTask: true,
      canUpdateTask: true,
      canViewTask: true,
      canViewDashboard: true,
      canBeNotified: true,
      canViewHistory: true
    });

    await TestBed.configureTestingModule({
      imports: [ProjectComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: UserService, useValue: mockUserService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    // Mock sessionStorage
    spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({ id: 1, nom: 'TestUser' }));

    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project on init', () => {
    fixture.detectChanges();
    expect(mockProjectService.getProjectById).toHaveBeenCalledWith(1);
    expect(component.projet).toBeTruthy();
  });

  it('should handle project with utilisateurs_projet', () => {
    const projectWithUsers = {
      ...mockProject,
      utilisateurs_projet: [1, 2]
    };
    mockProjectService.getProjectById.and.returnValue(of({ data: projectWithUsers }));
    mockUserService.getUserById.and.returnValue(of(mockUser));
    
    fixture.detectChanges();
    
    expect(component.projet).toBeTruthy();
  });

  it('should handle project without data', () => {
    mockProjectService.getProjectById.and.returnValue(of({ data: null }));
    
    fixture.detectChanges();
    
    expect(component.projet).toBeNull();
  });

  it('should load task history', () => {
    component.projet = mockProject;
    component.projet.taches = [mockTask];
    
    component.loadTaskHistory();
    
    expect(mockTaskService.getProjectHistory).toHaveBeenCalledWith(1, [mockTask]);
  });

  it('should open task overlay on task click', () => {
    component.onTaskClick(mockTask);
    
    expect(component.selectedTask).toEqual(mockTask);
    expect(component.isOverlayOpen).toBe(true);
  });

  it('should close task overlay', () => {
    component.selectedTask = mockTask;
    component.isOverlayOpen = true;
    
    component.closeTaskDetails();
    
    expect(component.selectedTask).toBeNull();
    expect(component.isOverlayOpen).toBe(false);
  });

  it('should navigate to main page', () => {
    component.goMainPage();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  it('should get user by email', () => {
    const mockUser: any = { id: 1, nom: 'Test', email: 'test@test.com' };
    component.allUsers = [mockUser];
    
    const result = component.getUtilisateurByEmail('test@test.com');
    
    expect(result).toEqual(mockUser);
  });

  it('should get role by id', () => {
    const mockRole: any = { id: 1, nom: 'ADMIN' };
    component.rolesDisponibles = [mockRole];
    
    const result = component.getRoleById(1);
    
    expect(result).toEqual(mockRole);
  });

  it('should track task by id', () => {
    const result = component.trackByTaskId(0, mockTask);
    expect(result).toBe(1);
  });

  it('should track task by id when id is null', () => {
    const taskWithoutId: TaskModel = { ...mockTask, id: undefined };
    const result = component.trackByTaskId(0, taskWithoutId);
    expect(result).toBeNull();
  });

  it('should enable edit mode', () => {
    component.isEditMode = false;
    component.enableEdit();
    expect(component.isEditMode).toBe(true);
    
    component.enableEdit();
    expect(component.isEditMode).toBe(false);
  });

  it('should delete task', () => {
    component.projet = { ...mockProject, taches: [mockTask] };
    
    component.deleteTask(1);
    
    expect(component.projet.taches?.length).toBe(0);
  });

  it('should not delete task if no tasks exist', () => {
    component.projet = mockProject;
    component.projet.taches = undefined;
    
    component.deleteTask(1);
    
    expect(component.projet.taches).toBeUndefined();
  });

  it('should add user with role to project', () => {
    const mockUser: any = { id: 1, nom: 'TestUser', email: 'test@test.com' };
    component.allUsers = [mockUser];
    component.projet = mockProject;
    mockUserService.addUserRoledToProject.and.returnValue(of({ success: true }));
    
    component.addUserRoledToProject('test@test.com', 'ADMIN');
    
    expect(mockUserService.addUserRoledToProject).toHaveBeenCalledWith('TestUser', 'ADMIN', 1);
  });

  it('should load current user permissions for admin role', () => {
    mockProjectService.getUsersRoledByProjectId.and.returnValue(of({ 
      data: [{ utilisateur: 1, role: 1 }] 
    }));
    
    fixture.detectChanges();
    
    expect(component.currentUserRole).toBe('ADMINISTRATEUR');
    expect(component.userPermissions).toBeDefined();
  });

  it('should set OBSERVATEUR role when user not found in project', (done) => {
    mockProjectService.getUsersRoledByProjectId.and.returnValue(of({ data: [] }));
    
    fixture.detectChanges();
    
    // Attendre que les retries soient terminés
    setTimeout(() => {
      expect(component.currentUserRole).toBe('OBSERVATEUR');
      done();
    }, 3500);
  });

  it('should handle permission loading error', () => {
    mockProjectService.getUsersRoledByProjectId.and.returnValue(
      throwError(() => new Error('Permission error'))
    );
    
    fixture.detectChanges();
    
    expect(component.currentUserRole).toBe('OBSERVATEUR');
  });

  it('should handle task drop between containers', () => {
    const mockEvent: any = {
      previousContainer: { id: 'todoList', data: [mockTask] },
      container: { id: 'inProgressList', data: [] },
      previousIndex: 0,
      currentIndex: 0
    };

    component.projet = { ...mockProject, taches: [mockTask] };
    component.prioriteFaible = { id: 1, nom: 'FAIBLE' };
    
    component.onTaskDrop(mockEvent, 'IN_PROGRESS', component.prioriteFaible);
    
    expect(mockTaskService.updateTask).toHaveBeenCalled();
  });

  it('should get user role', () => {
    const mockRole: any = { id: 1, nom: 'ADMIN' };
    const mockUser: any = { 
      id: 1, 
      nom: 'Test', 
      email: 'test@test.com',
      roles_projet: [mockRole]
    };
    
    const result = component.getUserRole(mockUser);
    
    expect(result).toEqual(mockRole);
  });

  it('should return undefined for user without role', () => {
    const mockUser: any = { 
      id: 1, 
      nom: 'Test', 
      email: 'test@test.com',
      roles_projet: []
    };
    
    const result = component.getUserRole(mockUser);
    
    expect(result).toBeUndefined();
  });

  describe('Task filtering by state', () => {
    beforeEach(() => {
      component.projet = {
        ...mockProject,
        taches: [
          { ...mockTask, id: 1, etat: 'TODO' },
          { ...mockTask, id: 2, etat: 'IN_PROGRESS' },
          { ...mockTask, id: 3, etat: 'DONE' }
        ]
      };
    });

    it('should filter TODO tasks', () => {
      expect(component.tachesTodo.length).toBe(1);
      expect(component.tachesTodo[0].etat).toBe('TODO');
    });

    it('should filter IN_PROGRESS tasks', () => {
      expect(component.tachesInProgress.length).toBe(1);
      expect(component.tachesInProgress[0].etat).toBe('IN_PROGRESS');
    });

    it('should filter DONE tasks', () => {
      expect(component.tachesDone.length).toBe(1);
      expect(component.tachesDone[0].etat).toBe('DONE');
    });
  });

  describe('User management', () => {
    it('should get users roled by project', () => {
      const userRoleData = [
        { utilisateur: 1, role: 1 }
      ];
      component.allUsers = [mockUser];
      mockProjectService.getUsersRoledByProjectId.and.returnValue(of({ data: userRoleData }));
      
      component.getUserRoledByProject(1);
      
      expect(mockProjectService.getUsersRoledByProjectId).toHaveBeenCalledWith(1);
    });

    it('should modify user role', () => {
      const userWithRole = { ...mockUser, roles_projet: [mockRole] };
      component.rolesDisponibles = [mockRole];
      
      component.modifierRole(userWithRole);
      
      expect(component.roleSelectionne[1]).toBe(1);
    });

    it('should not modify role for user without id', () => {
      const userWithoutId = { ...mockUser, id: null };
      
      component.modifierRole(userWithoutId);
      
      expect(Object.keys(component.roleSelectionne).length).toBe(0);
    });
  });

  describe('Task history', () => {
    it('should load task history when project has tasks', () => {
      component.projet = { ...mockProject, id: 1, taches: [mockTask] };
      const mockHistory = [
        { taskId: 1, taskName: 'Test', eventType: 'CREATION', timestamp: new Date() }
      ];
      mockTaskService.getProjectHistory.and.returnValue(mockHistory as any);
      
      component.loadTaskHistory();
      
      expect(mockTaskService.getProjectHistory).toHaveBeenCalledWith(1, [mockTask]);
      expect(component.taskHistory).toEqual(mockHistory as any);
    });

    it('should not load history when project is null', () => {
      component.projet = null;
      
      component.loadTaskHistory();
      
      expect(mockTaskService.getProjectHistory).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle error when adding user to project', () => {
      component.allUsers = [mockUser];
      component.projet = mockProject;
      mockUserService.addUserRoledToProject.and.returnValue(
        throwError(() => new Error('Add user error'))
      );
      
      component.addUserRoledToProject('test@test.com', 'ADMIN');
      
      expect(mockUserService.addUserRoledToProject).toHaveBeenCalled();
    });

    it('should not add user if email not found', () => {
      component.allUsers = [mockUser];
      component.projet = mockProject;
      
      component.addUserRoledToProject('notfound@test.com', 'ADMIN');
      
      expect(mockUserService.addUserRoledToProject).not.toHaveBeenCalled();
    });

    it('should not add user if role is null', () => {
      component.allUsers = [mockUser];
      component.projet = mockProject;
      
      component.addUserRoledToProject('test@test.com', null);
      
      expect(mockUserService.addUserRoledToProject).not.toHaveBeenCalled();
    });
  });
});
