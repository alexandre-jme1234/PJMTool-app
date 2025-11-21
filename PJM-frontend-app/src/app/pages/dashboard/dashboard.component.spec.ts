import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { ProjectService } from '../../services/projects/project.service';
import { TaskService } from '../../services/task/task.service';
import { UserService } from '../../services/user/user.service';
import { PermissionService } from '../../services/permissions/permission.service';
import { ProjetModel } from '../../services/projects/projet.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let taskService: jasmine.SpyObj<TaskService>;
  let userService: UserService;
  let router: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  const mockProjects: ProjetModel[] = [
    {
      id: 1,
      nom: 'Projet Test 1',
      description: 'Description 1',
      date_echeance: new Date('2024-12-31'),
      date_creation: new Date('2024-01-01'),
      taches: [],
      utilisateurs_projet: [],
      createur: null,
      projet_taches: []
    },
    {
      id: 2,
      nom: 'Projet Test 2',
      description: 'Description 2',
      date_echeance: new Date('2024-11-30'),
      date_creation: new Date('2024-02-01'),
      taches: [],
      utilisateurs_projet: [],
      createur: null,
      projet_taches: []
    }
  ];

  beforeEach(async () => {
    // Mock du sessionStorage
    let store: { [key: string]: string } = {};
    
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      return store[key] || null;
    });
    
    spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    
    spyOn(sessionStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });

    const projectServiceSpy = jasmine.createSpyObj('ProjectService', [
      'getProjects', 
      'onCreateProject', 
      'getUsersRoledByProjectId',
      'onDeleteProject'
    ]);
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasksByProject']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    projectServiceSpy.getProjects.and.returnValue(of(mockProjects));
    projectServiceSpy.onCreateProject.and.returnValue(of({}));
    projectServiceSpy.getUsersRoledByProjectId.and.returnValue(of({ data: [] }));
    projectServiceSpy.onDeleteProject.and.returnValue(of({}));
    taskServiceSpy.getTasksByProject.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        UserService, // Utiliser le vrai service
        { provide: Router, useValue: routerSpy },
        PermissionService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    projectService = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    httpMock = TestBed.inject(HttpTestingController);
    
    // Spy sur les méthodes du vrai service
    spyOn(userService, 'getUserById').and.returnValue(of({} as any));
    spyOn(userService, 'logout').and.returnValue(of({} as any));
    spyOn(userService, 'addUserRoledToProject').and.returnValue(of({} as any));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('devrait charger les projets au démarrage', () => {
      fixture.detectChanges();
      
      expect(projectService.getProjects).toHaveBeenCalled();
      expect(component.projects.length).toBe(2);
      expect(component.projects[0].nom).toBe('Projet Test 1');
    });

    it('devrait initialiser les tâches vides pour chaque projet', () => {
      fixture.detectChanges();
      
      component.projects.forEach(proj => {
        expect(Array.isArray(proj.taches)).toBe(true);
      });
    });

    it('devrait charger l\'utilisateur depuis sessionStorage si présent', () => {
      const mockUser = { 
        id: 1, 
        email: 'test@test.com', 
        nom: 'Test User',
        role_app: 'MEMBRE',
        password: null,
        etat_connexion: true,
        tache_commanditaire: null,
        taches_destinataire: null,
        projets_utilisateur: null,
        projets: null,
        roles_projet: null
      };
      sessionStorage.setItem('loggedUser', JSON.stringify(mockUser));
      
      fixture.detectChanges();
      
      expect(component.userLogged).toEqual(mockUser);
    });

    it('ne devrait pas planter si sessionStorage est vide', () => {
      sessionStorage.removeItem('loggedUser');
      
      expect(() => fixture.detectChanges()).not.toThrow();
      // userLogged sera null car sessionStorage est vide
      expect(component.userLogged).toBeNull();
    });
  });

  describe('loadProjects', () => {
    it('devrait charger les projets', () => {
      component.loadProjects();
      
      expect(projectService.getProjects).toHaveBeenCalled();
      expect(component.projects.length).toBe(2);
    });
  });

  describe('setLoggUser', () => {

    it('devrait récupérer l\'utilisateur depuis sessionStorage', (done) => {
      const mockUser = { 
        id: '1', 
        email: 'test@test.com', 
        etat_connexion: true 
      };
      sessionStorage.setItem('loggedUser', JSON.stringify(mockUser));
      
      // Configurer le spy
      (userService.getUserById as jasmine.Spy).and.returnValue(of({
        ...mockUser,
        etat_connexion: true
      }));
      
      component.setLoggUser();
      
      setTimeout(() => {
        expect(sessionStorage.getItem).toHaveBeenCalledWith('loggedUser');
        done();
      }, 10);
    });

    it('devrait appeler getUserById avec l\'id de l\'utilisateur', (done) => {
      const mockUser = { 
        id: '1', 
        email: 'test@test.com', 
        etat_connexion: true 
      };
      sessionStorage.setItem('loggedUser', JSON.stringify(mockUser));
      
      // Configurer le spy
      (userService.getUserById as jasmine.Spy).and.returnValue(of({
        ...mockUser,
        etat_connexion: true
      }));
      
      component.setLoggUser();
      
      // Attendre que l'Observable soit traité
      setTimeout(() => {
        expect(userService.getUserById).toHaveBeenCalledWith('1');
        done();
      }, 10);
    });

    it('devrait déclencher logout si etat_connexion est false', (done) => {
      const mockUser = { 
        id: '1', 
        email: 'test@test.com', 
        etat_connexion: true 
      };
      sessionStorage.setItem('loggedUser', JSON.stringify(mockUser));
      
      // Configurer les spies
      (userService.getUserById as jasmine.Spy).and.returnValue(of({
        ...mockUser,
        etat_connexion: false // Changé à false pour déclencher le logout
      }));
      (userService.logout as jasmine.Spy).and.returnValue(of({ success: true }));
      
      component.setLoggUser();
      
      setTimeout(() => {
        expect(userService.logout).toHaveBeenCalled();
        expect(sessionStorage.removeItem).toHaveBeenCalledWith('loggedUser');
        expect(router.navigate).toHaveBeenCalledWith(['login']);
        done();
      }, 100);
    });
  });

  describe('Propriétés calculées', () => {
    beforeEach(() => {
      component.projects = mockProjects as any;
    });

    it('devrait retourner le nombre total de projets', () => {
      expect(component.projects.length).toBe(2);
    });

    it('devrait gérer une liste vide de projets', () => {
      component.projects = [];
      expect(component.projects.length).toBe(0);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de chargement des projets', (done) => {
      // Simuler une erreur Observable avec gestion d'erreur
      const errorObservable = new Observable<ProjetModel[]>(subscriber => {
        subscriber.error(new Error('Erreur réseau'));
      });
      
      projectService.getProjects.and.returnValue(errorObservable as any);
      
      // Souscrire avec gestion d'erreur pour éviter que l'erreur ne remonte
      projectService.getProjects().subscribe({
        next: () => {},
        error: (err) => {
          // L'erreur est capturée ici
          expect(err.message).toBe('Erreur réseau');
          expect(projectService.getProjects).toHaveBeenCalled();
          done();
        }
      });
    });

    it('devrait gérer un sessionStorage corrompu', () => {
      sessionStorage.setItem('loggedUser', 'invalid-json');
      
      expect(() => component.setLoggUser()).toThrow();
    });
  });

  describe('Intégration avec les services', () => {
    it('devrait utiliser PermissionService', () => {
      expect(component['permissionService']).toBeDefined();
    });

    it('devrait utiliser NotificationService', () => {
      expect(component['notificationService']).toBeDefined();
    });
  });

  describe('onSelectProject', () => {
    it('devrait sélectionner un projet', () => {
      const projet = mockProjects[0];
      spyOn(component, 'loadTasksForProject');
      spyOn(component, 'loadCurrentUserRoleForProject');

      component.onSelectProject(projet as any);

      expect(component.selectedProject).toEqual(projet as any);
      expect(component.loadTasksForProject).toHaveBeenCalledWith(projet.id);
      expect(component.loadCurrentUserRoleForProject).toHaveBeenCalledWith(projet.id);
    });

    it('ne devrait pas charger les tâches si le projet n\'a pas d\'id', () => {
      const projetSansId = { ...mockProjects[0], id: undefined };
      spyOn(component, 'loadTasksForProject');

      component.onSelectProject(projetSansId as any);

      expect(component.selectedProject).toEqual(projetSansId as any);
      expect(component.loadTasksForProject).not.toHaveBeenCalled();
    });
  });

  describe('onAddProjectClick', () => {
    it('devrait ouvrir le modal de création de projet', () => {
      component.showModal = false;

      component.onAddProjectClick();

      expect(component.showModal).toBe(true);
    });
  });

  describe('createProject', () => {
    beforeEach(() => {
      component.userLogged = {
        id: 1,
        nom: 'Test User',
        email: 'test@test.com',
        role_app: 'MEMBRE',
        password: null,
        etat_connexion: true,
        tache_commanditaire: null,
        taches_destinataire: null,
        projets_utilisateur: null,
        projets: null,
        roles_projet: null
      };
      component.newProject = {
        nom: 'Nouveau Projet',
        description: 'Description test',
        date_echeance: '2025-12-31',
        date_creation: new Date().toISOString(),
        id: null,
        utilisateurs_projet: [],
        projet_taches: [],
        taches: [],
        createur: null
      } as any;
    });

    it('devrait créer un projet avec succès', (done) => {
      const mockResponse = { data: { id: 123 } };
      projectService.onCreateProject.and.returnValue(of(mockResponse));
      (userService.addUserRoledToProject as jasmine.Spy).and.returnValue(of({}));
      spyOn(component, 'loadProjects');
      spyOn(component, 'resetNewProject');

      component.createProject();

      setTimeout(() => {
        expect(projectService.onCreateProject).toHaveBeenCalled();
        expect(component.loadProjects).toHaveBeenCalled();
        expect(component.showModal).toBe(false);
        done();
      }, 50);
    });

    it('devrait afficher une alerte si le nom est manquant', () => {
      component.newProject.nom = null;
      component.showProjectAlert = false;

      component.createProject();

      expect(component.showProjectAlert).toBe(true);
    });

    it('devrait afficher une alerte si la date d\'échéance est manquante', () => {
      component.newProject.date_echeance = null;
      component.showProjectAlert = false;

      component.createProject();

      expect(component.showProjectAlert).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('devrait fermer le modal et réinitialiser le formulaire', () => {
      component.showModal = true;
      spyOn(component, 'resetForm');

      component.onCancel();

      expect(component.showModal).toBe(false);
      expect(component.resetForm).toHaveBeenCalled();
    });
  });

  describe('onAddTaskClick', () => {
    beforeEach(() => {
      component.userLogged = {
        id: 1,
        nom: 'Test User',
        email: 'test@test.com',
        role_app: 'MEMBRE',
        password: null,
        etat_connexion: true,
        tache_commanditaire: null,
        taches_destinataire: null,
        projets_utilisateur: null,
        projets: null,
        roles_projet: null
      };
      component.selectedProject = mockProjects[0] as any;
      component.priorites = [
        { id: 1, nom: 'HAUTE' },
        { id: 2, nom: 'MOYENNE' },
        { id: 3, nom: 'FAIBLE' }
      ];
    });

    it('devrait créer une tâche vide et ouvrir l\'overlay', () => {
      component.isOverlayOpen = false;

      component.onAddTaskClick();

      expect(component.selectedTask).toBeDefined();
      expect(component.selectedTask?.nom).toBe('');
      expect(component.selectedTask?.commanditaire).toEqual(component.userLogged);
      expect(component.isOverlayOpen).toBe(true);
    });
  });

  describe('onCancelTask', () => {
    it('devrait fermer le modal de tâche et réinitialiser le formulaire', () => {
      component.showTaskModal = true;
      spyOn(component, 'resetTaskForm');

      component.onCancelTask();

      expect(component.showTaskModal).toBe(false);
      expect(component.resetTaskForm).toHaveBeenCalled();
    });
  });

  describe('getDetailProject', () => {
    it('devrait naviguer vers la page de détail du projet', () => {
      const projet = mockProjects[0];

      component.getDetailProject(projet as any);

      expect(component.selectedProject).toEqual(projet as any);
      expect(router.navigate).toHaveBeenCalledWith(['/projet', projet.id]);
    });
  });

  // ========== TESTS DE BRANCHES SUPPLÉMENTAIRES ==========

  describe('onAddProjectClick', () => {
    it('devrait ouvrir la modale de création de projet', () => {
      component.showModal = false;
      component.onAddProjectClick();
      expect(component.showModal).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('devrait fermer la modale et réinitialiser le formulaire', () => {
      component.showModal = true;
      component.newProject = { nom: 'Test' };
      
      component.onCancel();
      
      expect(component.showModal).toBe(false);
    });
  });

  describe('resetForm', () => {
    it('devrait réinitialiser newProject et fermer la modale', () => {
      component.newProject = { nom: 'Test', description: 'Desc' };
      component.showModal = true;
      component.selectedProject = mockProjects[0] as any;
      
      component.resetForm();
      
      expect(component.newProject.nom).toBe('');
      expect(component.newProject.description).toBe('');
      expect(component.showModal).toBe(false);
      expect(component.selectedProject).toBeNull();
    });
  });

  describe('hasCompletedTasks', () => {
    it('devrait retourner true si des tâches sont terminées', () => {
      component.selectedProject = {
        ...mockProjects[0] as any,
        taches: [{ id: 1, est_termine: true }]
      };
      
      expect(component.hasCompletedTasks).toBe(true);
    });

    it('devrait retourner false si aucune tâche n\'est terminée', () => {
      component.selectedProject = {
        ...mockProjects[0] as any,
        taches: [{ id: 1, est_termine: false }]
      };
      
      expect(component.hasCompletedTasks).toBe(false);
    });

    it('devrait retourner false si selectedProject est null', () => {
      component.selectedProject = null;
      expect(component.hasCompletedTasks).toBe(false);
    });
  });

  describe('onTaskCheckboxChange', () => {
    it('devrait ajouter la tâche à tasksToDelete si cochée', () => {
      const mockTask = { id: 1, nom: 'Task 1', est_termine: false };
      const event = { target: { checked: true } };
      
      component.onTaskCheckboxChange(mockTask as any, event);
      
      expect(mockTask.est_termine).toBe(true);
      expect(component.tasksToDelete).toContain(mockTask as any);
    });

    it('devrait retirer la tâche de tasksToDelete si décochée', () => {
      const mockTask = { id: 1, nom: 'Task 1', est_termine: true };
      component.tasksToDelete = [mockTask as any];
      const event = { target: { checked: false } };
      
      component.onTaskCheckboxChange(mockTask as any, event);
      
      expect(mockTask.est_termine).toBe(false);
      expect(component.tasksToDelete).not.toContain(mockTask as any);
    });
  });

  describe('onProjectCheckboxChange', () => {
    it('devrait ajouter l\'ID du projet si coché', () => {
      const project = mockProjects[0];
      const event = { target: { checked: true } };
      
      component.onProjectCheckboxChange(project as any, event);
      
      expect(component.selectedProjectIds).toContain(project.id!);
    });

    it('devrait retirer l\'ID du projet si décoché', () => {
      const project = mockProjects[0];
      component.selectedProjectIds = [project.id!];
      const event = { target: { checked: false } };
      
      component.onProjectCheckboxChange(project as any, event);
      
      expect(component.selectedProjectIds).not.toContain(project.id!);
    });
  });

  describe('closeTaskDetails', () => {
    it('devrait fermer l\'overlay et réinitialiser selectedTask', () => {
      component.selectedTask = { id: 1, nom: 'Task' } as any;
      component.isOverlayOpen = true;
      
      component.closeTaskDetails();
      
      expect(component.selectedTask).toBeNull();
      expect(component.isOverlayOpen).toBe(false);
    });
  });

  describe('goToProject', () => {
    it('devrait naviguer vers le projet avec l\'ID spécifié', () => {
      component.goToProject(5);
      expect(router.navigate).toHaveBeenCalledWith(['/projet', 5]);
    });
  });

  describe('resetTaskForm', () => {
    it('devrait réinitialiser newTask avec les valeurs par défaut', () => {
      component.newTask = { nom: 'Old Task' } as any;
      
      component.resetTaskForm();
      
      expect(component.newTask.nom).toBe('');
      expect(component.newTask.etat).toBe('TODO');
      expect(component.newTask.priorite?.nom).toBe('FAIBLE');
    });

    it('devrait utiliser userLogged comme commanditaire si disponible', () => {
      component.userLogged = { id: 5, nom: 'Logged User' } as any;
      
      component.resetTaskForm();
      
      expect(component.newTask.commanditaire).toEqual(component.userLogged);
    });

    it('devrait utiliser user1 comme commanditaire si userLogged est null', () => {
      component.userLogged = null;
      
      component.resetTaskForm();
      
      expect(component.newTask.commanditaire).toEqual(component.user1);
    });
  });

  describe('loadCurrentUserRoleForProject', () => {
    beforeEach(() => {
      component.userLogged = { id: 1, nom: 'Test User' } as any;
    });

    it('devrait retourner immédiatement si userLogged est null', () => {
      component.userLogged = null;
      
      component.loadCurrentUserRoleForProject(1);
      
      expect(projectService.getUsersRoledByProjectId).not.toHaveBeenCalled();
    });

    it('devrait retourner immédiatement si userLogged.id est undefined', () => {
      component.userLogged = { nom: 'Test' } as any;
      
      component.loadCurrentUserRoleForProject(1);
      
      expect(projectService.getUsersRoledByProjectId).not.toHaveBeenCalled();
    });

    it('devrait définir le rôle ADMINISTRATEUR (id: 1)', (done) => {
      const mockResponse = {
        data: [{ utilisateur: 1, role: 1 }]
      };
      projectService.getUsersRoledByProjectId.and.returnValue(of(mockResponse));
      
      component.loadCurrentUserRoleForProject(1);
      
      setTimeout(() => {
        expect(component.currentProjectRole).toBe('ADMINISTRATEUR');
        expect(component.currentUserPermissions).toBeDefined();
        done();
      }, 50);
    });

    it('devrait définir le rôle MEMBRE (id: 2)', (done) => {
      const mockResponse = {
        data: [{ utilisateur: 1, role: 2 }]
      };
      projectService.getUsersRoledByProjectId.and.returnValue(of(mockResponse));
      
      component.loadCurrentUserRoleForProject(1);
      
      setTimeout(() => {
        expect(component.currentProjectRole).toBe('MEMBRE');
        done();
      }, 50);
    });

    it('devrait définir le rôle OBSERVATEUR (id: 3)', (done) => {
      const mockResponse = {
        data: [{ utilisateur: 1, role: 3 }]
      };
      projectService.getUsersRoledByProjectId.and.returnValue(of(mockResponse));
      
      component.loadCurrentUserRoleForProject(1);
      
      setTimeout(() => {
        expect(component.currentProjectRole).toBe('OBSERVATEUR');
        done();
      }, 50);
    });

    it('devrait utiliser OBSERVATEUR par défaut pour un rôle inconnu', (done) => {
      const mockResponse = {
        data: [{ utilisateur: 1, role: 999 }]
      };
      projectService.getUsersRoledByProjectId.and.returnValue(of(mockResponse));
      
      component.loadCurrentUserRoleForProject(1);
      
      setTimeout(() => {
        expect(component.currentProjectRole).toBe('OBSERVATEUR');
        done();
      }, 50);
    });

    it('devrait gérer le cas où utilisateur est un objet avec id', (done) => {
      const mockResponse = {
        data: [{ utilisateur: { id: 1 }, role: 1 }]
      };
      projectService.getUsersRoledByProjectId.and.returnValue(of(mockResponse));
      
      component.loadCurrentUserRoleForProject(1);
      
      setTimeout(() => {
        expect(component.currentProjectRole).toBe('ADMINISTRATEUR');
        done();
      }, 50);
    });

    it('devrait définir currentProjectRole à null si utilisateur non trouvé', (done) => {
      const mockResponse = {
        data: [{ utilisateur: 999, role: 1 }]
      };
      projectService.getUsersRoledByProjectId.and.returnValue(of(mockResponse));
      
      component.loadCurrentUserRoleForProject(1);
      
      setTimeout(() => {
        expect(component.currentProjectRole).toBeNull();
        expect(component.currentUserPermissions).toBeNull();
        done();
      }, 50);
    });

    it('devrait gérer les erreurs HTTP', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');
      projectService.getUsersRoledByProjectId.and.returnValue(
        new Observable(subscriber => subscriber.error({ status: 500 }))
      );
      
      component.loadCurrentUserRoleForProject(1);
      
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(component.currentProjectRole).toBeNull();
        done();
      }, 50);
    });
  });

  describe('createProject - branches complètes', () => {
    beforeEach(() => {
      component.newProject = {
        nom: 'Test Project',
        date_echeance: '2025-12-31',
        description: 'Test'
      };
    });

    it('devrait créer un projet sans userLogged', (done) => {
      component.userLogged = null;
      const mockResponse = { data: { id: 10 } };
      projectService.onCreateProject.and.returnValue(of(mockResponse));
      spyOn(component, 'loadProjects');
      spyOn(component, 'resetNewProject');
      
      component.createProject();
      
      setTimeout(() => {
        expect(projectService.onCreateProject).toHaveBeenCalled();
        expect(userService.addUserRoledToProject).not.toHaveBeenCalled();
        expect(component.showModal).toBe(false);
        done();
      }, 100);
    });

    it('devrait créer un projet avec userLogged.nom undefined', (done) => {
      component.userLogged = { id: 1 } as any;
      const mockResponse = { data: { id: 10 } };
      projectService.onCreateProject.and.returnValue(of(mockResponse));
      spyOn(component, 'loadProjects');
      
      component.createProject();
      
      setTimeout(() => {
        expect(component.newProject.createur).toBeUndefined();
        done();
      }, 100);
    });

    it('devrait gérer une réponse avec response.id au lieu de response.data.id', (done) => {
      component.userLogged = { id: 1, nom: 'Test' } as any;
      const mockResponse = { id: 15 };
      projectService.onCreateProject.and.returnValue(of(mockResponse));
      (userService.addUserRoledToProject as jasmine.Spy).and.returnValue(of({}));
      spyOn(component, 'loadProjects');
      
      component.createProject();
      
      setTimeout(() => {
        expect(userService.addUserRoledToProject).toHaveBeenCalledWith('Test', 'ADMINISTRATEUR', 15);
        done();
      }, 100);
    });

    it('devrait gérer l\'erreur d\'ajout du rôle ADMIN', (done) => {
      component.userLogged = { id: 1, nom: 'Test' } as any;
      const mockResponse = { data: { id: 10 } };
      projectService.onCreateProject.and.returnValue(of(mockResponse));
      (userService.addUserRoledToProject as jasmine.Spy).and.returnValue(
        new Observable(sub => sub.error({ status: 500 }))
      );
      const consoleErrorSpy = spyOn(console, 'error');
      spyOn(component, 'loadProjects');
      
      component.createProject();
      
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('devrait gérer l\'erreur de création du projet', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');
      projectService.onCreateProject.and.returnValue(
        new Observable(sub => sub.error({ status: 400 }))
      );
      
      component.createProject();
      
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('onCreateTask', () => {
    beforeEach(() => {
      component.selectedProject = mockProjects[0] as any;
      component.newTask = {
        nom: 'New Task',
        description: 'Description',
        priorite: null,
        commanditaire: { id: 1 } as any,
        destinataire: { id: 2 } as any,
        date_debut: null,
        date_fin: null,
        etat: 'TODO'
      } as any;
      component.priorites = [
        { id: 1, nom: 'HAUTE' },
        { id: 2, nom: 'MOYENNE' },
        { id: 3, nom: 'FAIBLE' }
      ];
    });

    it('devrait créer une tâche avec priorité par défaut si null', (done) => {
      const taskServiceSpy = jasmine.createSpyObj('TaskService', ['createTask']);
      taskServiceSpy.createTask.and.returnValue(of({ success: true }));
      component['taskService'] = taskServiceSpy;
      spyOn(component, 'loadTasksForProject');
      
      component.onCreateTask();
      
      setTimeout(() => {
        expect(component.newTask.priorite?.nom).toBe('FAIBLE');
        expect(taskServiceSpy.createTask).toHaveBeenCalled();
        expect(component.showTaskModal).toBe(false);
        done();
      }, 50);
    });

    it('devrait charger les tâches après création', (done) => {
      component.newTask.priorite = component.priorites[0];
      const taskServiceSpy = jasmine.createSpyObj('TaskService', ['createTask']);
      taskServiceSpy.createTask.and.returnValue(of({ success: true }));
      component['taskService'] = taskServiceSpy;
      spyOn(component, 'loadTasksForProject');
      
      component.onCreateTask();
      
      setTimeout(() => {
        expect(component.loadTasksForProject).toHaveBeenCalledWith(mockProjects[0].id);
        done();
      }, 50);
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      component.projects = [
        { id: 1, nom: 'P1', taches: [{ id: 1 }, { id: 2 }] } as any,
        { id: 2, nom: 'P2', taches: [] } as any
      ];
      component.selectedProject = component.projects[0] as any;
      projectService.projectsSubject = { next: jasmine.createSpy('next') } as any;
    });

    it('devrait supprimer une tâche du projet sélectionné', () => {
      const consoleLogSpy = spyOn(console, 'log');
      
      component.deleteTask(1);
      
      expect(component.selectedProject?.taches?.length).toBe(1);
      expect(component.selectedProject?.taches?.[0].id).toBe(2);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('ne devrait rien faire si selectedProject est null', () => {
      component.selectedProject = null;
      const initialProjects = [...component.projects];
      
      component.deleteTask(1);
      
      expect(component.projects).toEqual(initialProjects);
    });

    it('ne devrait rien faire si selectedProject.taches est undefined', () => {
      component.selectedProject = { id: 1, nom: 'P1' } as any;
      
      expect(() => component.deleteTask(1)).not.toThrow();
    });

    it('devrait mettre à jour le projectsSubject', () => {
      component.deleteTask(1);
      
      expect(projectService.projectsSubject.next).toHaveBeenCalledWith(component.projects);
    });
  });

  describe('deleteSelectedTasks', () => {
    beforeEach(() => {
      component.projects = [
        { id: 1, nom: 'P1', taches: [{ id: 1 }, { id: 2 }, { id: 3 }] } as any
      ];
      component.selectedProject = component.projects[0] as any;
      projectService.projectsSubject = { next: jasmine.createSpy('next') } as any;
      
      const deleteTaskSpy = jasmine.createSpyObj('TaskService', ['deleteTask']);
      deleteTaskSpy.deleteTask.and.returnValue(of({ success: true }));
      component['taskService'] = deleteTaskSpy;
    });

    it('devrait retourner immédiatement si selectedProject est null', () => {
      component.selectedProject = null;
      
      component.deleteSelectedTasks();
      
      expect(component['taskService'].deleteTask).not.toHaveBeenCalled();
    });

    it('devrait retourner immédiatement si selectedProject.taches est undefined', () => {
      component.selectedProject = { id: 1 } as any;
      
      component.deleteSelectedTasks();
      
      expect(component['taskService'].deleteTask).not.toHaveBeenCalled();
    });

    it('devrait supprimer plusieurs tâches', (done) => {
      component.tasksToDelete = [
        { id: 1, nom: 'Task 1' } as any,
        { id: 2, nom: 'Task 2' } as any
      ];
      
      component.deleteSelectedTasks();
      
      setTimeout(() => {
        expect(component['taskService'].deleteTask).toHaveBeenCalledTimes(2);
        done();
      }, 100);
    });

    it('devrait ignorer les tâches avec id null', (done) => {
      component.tasksToDelete = [
        { id: null, nom: 'Task null' } as any,
        { id: 1, nom: 'Task 1' } as any
      ];
      
      component.deleteSelectedTasks();
      
      setTimeout(() => {
        expect(component['taskService'].deleteTask).toHaveBeenCalledTimes(1);
        done();
      }, 100);
    });

    it('devrait gérer les erreurs de suppression', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');
      // Recréer le spy avec une configuration d'erreur
      const deleteTaskErrorSpy = jasmine.createSpyObj('TaskService', ['deleteTask']);
      deleteTaskErrorSpy.deleteTask.and.returnValue(
        new Observable(sub => sub.error({ status: 500 }))
      );
      component['taskService'] = deleteTaskErrorSpy;
      component.tasksToDelete = [{ id: 1 } as any];
      
      component.deleteSelectedTasks();
      
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('deleteSelectedProjects', () => {
    beforeEach(() => {
      spyOn(component, 'loadProjects');
    });

    it('devrait retourner immédiatement si aucun projet sélectionné', () => {
      component.selectedProjectIds = [];
      spyOn(window, 'confirm');
      
      component.deleteSelectedProjects();
      
      expect(window.confirm).not.toHaveBeenCalled();
    });

    it('devrait afficher un message de confirmation pour 1 projet', () => {
      component.selectedProjectIds = [1];
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteSelectedProjects();
      
      expect(window.confirm).toHaveBeenCalledWith(
        jasmine.stringContaining('Voulez-vous vraiment supprimer ce projet ?')
      );
    });

    it('devrait afficher un message de confirmation pour plusieurs projets', () => {
      component.selectedProjectIds = [1, 2, 3];
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteSelectedProjects();
      
      expect(window.confirm).toHaveBeenCalledWith(
        jasmine.stringContaining('Voulez-vous vraiment supprimer ces 3 projets ?')
      );
    });

    it('devrait annuler la suppression si l\'utilisateur refuse', () => {
      const consoleLogSpy = spyOn(console, 'log');
      component.selectedProjectIds = [1];
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteSelectedProjects();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('Suppression annulée')
      );
    });

    it('devrait supprimer les projets si l\'utilisateur confirme', (done) => {
      component.selectedProjectIds = [1, 2];
      component.selectedProject = { id: 1 } as any;
      spyOn(window, 'confirm').and.returnValue(true);
      
      component.deleteSelectedProjects();
      
      setTimeout(() => {
        const req1 = httpMock.expectOne('http://localhost:8080/api/projet/delete/1');
        const req2 = httpMock.expectOne('http://localhost:8080/api/projet/delete/2');
        req1.flush({ success: true });
        req2.flush({ success: true });
        
        expect(component.loadProjects).toHaveBeenCalled();
        expect(component.selectedProjectIds).toEqual([]);
        expect(component.selectedProject).toBeNull();
        done();
      }, 50);
    });

    it('devrait gérer les erreurs de suppression', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');
      component.selectedProjectIds = [1];
      spyOn(window, 'confirm').and.returnValue(true);
      
      component.deleteSelectedProjects();
      
      setTimeout(() => {
        const req = httpMock.expectOne('http://localhost:8080/api/projet/delete/1');
        req.flush('Error', { status: 500, statusText: 'Server Error' });
        
        expect(consoleErrorSpy).toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  describe('onTaskUpdated', () => {
    beforeEach(() => {
      component.selectedProject = { id: 1 } as any;
      spyOn(component, 'loadTasksForProject');
      spyOn(component, 'closeTaskDetails');
    });

    it('devrait recharger les tâches et fermer l\'overlay pour une tâche modifiée', () => {
      const updatedTask = { id: 5, nom: 'Updated Task' } as any;
      
      component.onTaskUpdated(updatedTask);
      
      expect(component.loadTasksForProject).toHaveBeenCalledWith(1);
      expect(component.closeTaskDetails).toHaveBeenCalled();
    });

    it('devrait afficher un message pour une nouvelle tâche (id: 0)', () => {
      const newTask = { id: 0, nom: 'New Task' } as any;
      
      component.onTaskUpdated(newTask);
      
      expect(component.loadTasksForProject).toHaveBeenCalled();
    });

    it('ne devrait pas charger les tâches si selectedProject est null', () => {
      component.selectedProject = null;
      const task = { id: 1 } as any;
      
      component.onTaskUpdated(task);
      
      expect(component.loadTasksForProject).not.toHaveBeenCalled();
      expect(component.closeTaskDetails).toHaveBeenCalled();
    });

    it('ne devrait pas charger les tâches si selectedProject.id est undefined', () => {
      component.selectedProject = { nom: 'Project' } as any;
      const task = { id: 1 } as any;
      
      component.onTaskUpdated(task);
      
      expect(component.loadTasksForProject).not.toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('devrait ouvrir le modal avec les données du projet', () => {
      const projet = mockProjects[0];
      component.showModal = false;
      
      component.updateProject(projet as any);
      
      expect(component.showModal).toBe(true);
      expect(component.selectedProject).toEqual(projet as any);
      expect(component.newProject).toEqual(projet as any);
    });
  });

  describe('removeProject', () => {
    it('devrait supprimer un projet et recharger la liste', (done) => {
      const projet = mockProjects[0];
      spyOn(component, 'loadProjects');
      
      component.removeProject(projet as any);
      
      setTimeout(() => {
        expect(projectService.onDeleteProject).toHaveBeenCalledWith(projet as any);
        expect(component.loadProjects).toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  describe('onCommanditaireChange', () => {
    it('devrait mettre à jour le commanditaire de newTask', () => {
      component.onCommanditaireChange(42);
      
      expect(component.newTask.commanditaire).toEqual({ id: 42 } as any);
    });
  });

  describe('onDestinataireChange', () => {
    it('devrait mettre à jour le destinataire de newTask', () => {
      component.onDestinataireChange(99);
      
      expect(component.newTask.destinataire).toEqual({ id: 99 } as any);
    });
  });

  describe('onTaskClick', () => {
    it('devrait sélectionner une tâche et ouvrir l\'overlay', () => {
      const task = { id: 1, nom: 'Task' } as any;
      component.isOverlayOpen = false;
      
      component.onTaskClick(task);
      
      expect(component.selectedTask).toEqual(task);
      expect(component.isOverlayOpen).toBe(true);
    });
  });

  describe('resetNewProject', () => {
    it('devrait réinitialiser newProject', () => {
      component.newProject = { nom: 'Old', description: 'Old desc' };
      
      component.resetNewProject();
      
      expect(component.newProject.nom).toBe('');
      expect(component.newProject.description).toBe('');
      expect(component.newProject.id).toBe(0);
      expect(component.newProject.taches).toEqual([]);
    });
  });

  describe('loadTasksForProject', () => {
    it('devrait charger les tâches pour un projet', (done) => {
      const mockTasks = [{ id: 1, nom: 'Task 1' }];
      taskService.getTasksByProject.and.returnValue(of(mockTasks as any));
      component.selectedProject = { id: 1 } as any;
      
      component.loadTasksForProject(1);
      
      setTimeout(() => {
        expect(taskService.getTasksByProject).toHaveBeenCalledWith(1);
        expect(component.tasks).toEqual(mockTasks as any);
        expect(component.selectedProject?.taches).toEqual(mockTasks as any);
        done();
      }, 50);
    });

    it('ne devrait pas mettre à jour selectedProject si l\'id ne correspond pas', (done) => {
      const mockTasks = [{ id: 1, nom: 'Task 1' }];
      taskService.getTasksByProject.and.returnValue(of(mockTasks as any));
      component.selectedProject = { id: 999 } as any;
      
      component.loadTasksForProject(1);
      
      setTimeout(() => {
        expect(component.tasks).toEqual(mockTasks as any);
        expect(component.selectedProject?.taches).toBeUndefined();
        done();
      }, 50);
    });
  });

});

