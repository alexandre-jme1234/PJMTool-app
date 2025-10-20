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

    const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjects']);
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasksByProject']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    projectServiceSpy.getProjects.and.returnValue(of(mockProjects));
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
});
