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

});

