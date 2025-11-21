import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { AuthService } from '../../auth/auth.service';
import { UserModel } from './user.model';
import { RoleModel } from '../role/role.model';

describe('UserService - Tests de couverture complète', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let sessionStorageSpy: jasmine.Spy;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      isLoggedIn: false
    });

    // Mock sessionStorage
    let store: { [key: string]: string } = {};
    sessionStorageSpy = spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(sessionStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });
    spyOn(sessionStorage, 'clear').and.callFake(() => {
      store = {};
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ========== TESTS DE CRÉATION ==========

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize users as empty array', () => {
    expect(service.users).toEqual([]);
  });

  it('should initialize loggedUser as null', () => {
    expect(service.loggedUser).toBeNull();
  });

  // ========== TESTS DE getUsers() ==========

  describe('getUsers()', () => {
    it('should fetch users from API', (done) => {
      const mockUsers: UserModel[] = [
        { id: 1, nom: 'User 1', email: 'user1@test.com', role_app: 'MEMBRE', password: null, etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: null },
        { id: 2, nom: 'User 2', email: 'user2@test.com', role_app: 'ADMIN', password: null, etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: null }
      ];

      service.getUsers().subscribe(users => {
        expect(users.length).toBe(2);
        expect(users).toEqual(mockUsers);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  // ========== TESTS DE setUserLogged() ==========

  describe('setUserLogged()', () => {
    it('should set user in sessionStorage when no user is stored', () => {
      const mockUser: any = { id: 1, email: 'test@test.com', nom: 'Test User' };
      
      service.setUserLogged(mockUser);
      
      expect(authService.isLoggedIn).toBe(true);
      expect(mockUser.isLoggedIn).toBe(true);
      expect(sessionStorageSpy).toHaveBeenCalledWith('loggedUser', JSON.stringify(mockUser));
    });

    it('should clear and set user in sessionStorage when user already exists', () => {
      const existingUser = { id: 1, email: 'old@test.com' };
      const newUser: any = { id: 2, email: 'new@test.com', nom: 'New User' };
      
      // Simuler un utilisateur existant
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify(existingUser));
      
      service.setUserLogged(newUser);
      
      expect(authService.isLoggedIn).toBe(true);
      expect(newUser.isLoggedIn).toBe(true);
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(sessionStorageSpy).toHaveBeenCalledWith('loggedUser', JSON.stringify(newUser));
    });

    it('should log user information to console', () => {
      spyOn(console, 'log');
      const mockUser = { id: 1, email: 'test@test.com' };
      
      service.setUserLogged(mockUser);
      
      expect(console.log).toHaveBeenCalledWith('setUserLogged', mockUser);
      expect(console.log).toHaveBeenCalledWith('setUserLogged Stored', null);
    });
  });

  // ========== TESTS DE getUserById() ==========

  describe('getUserById()', () => {
    it('should fetch user by ID', (done) => {
      const userId = '123';
      const mockResponse = { id: 123, nom: 'Test User', email: 'test@test.com' };

      service.getUserById(userId).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/utilisateur/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  // ========== TESTS DE addUser() ==========

  describe('addUser()', () => {
    it('should create user with all fields provided', (done) => {
      const user = {
        email: 'new@test.com',
        nom: 'New User',
        password: 'password123',
        role_app: 'ADMIN'
      };

      const expectedPayload = {
        email: 'new@test.com',
        etat_connexion: 1,
        nom: 'New User',
        password: 'password123',
        role_app: 'ADMIN'
      };

      service.addUser(user).subscribe(response => {
        expect(response).toBeDefined();
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/create');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedPayload);
      req.flush({ id: 1, ...expectedPayload });
    });

    it('should use displayName when nom is not provided', (done) => {
      const user = {
        email: 'new@test.com',
        displayName: 'Display Name',
        password: 'password123'
      };

      service.addUser(user).subscribe(() => done());

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/create');
      expect(req.request.body.nom).toBe('Display Name');
      req.flush({});
    });

    it('should default to empty string when neither nom nor displayName provided', (done) => {
      const user = {
        email: 'new@test.com',
        password: 'password123'
      };

      service.addUser(user).subscribe(() => done());

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/create');
      expect(req.request.body.nom).toBe('');
      req.flush({});
    });

    it('should default to empty password when not provided', (done) => {
      const user = {
        email: 'new@test.com',
        nom: 'Test User'
      };

      service.addUser(user).subscribe(() => done());

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/create');
      expect(req.request.body.password).toBe('');
      req.flush({});
    });

    it('should default to MEMBRE role when not provided', (done) => {
      const user = {
        email: 'new@test.com',
        nom: 'Test User',
        password: 'pass123'
      };

      service.addUser(user).subscribe(() => done());

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/create');
      expect(req.request.body.role_app).toBe('MEMBRE');
      req.flush({});
    });
  });

  // ========== TESTS DE login() ==========

  describe('login()', () => {
    it('should send login request with email and password', (done) => {
      const email = 'test@test.com';
      const password = 'password123';
      const mockResponse = { id: 1, email, nom: 'Test User' };

      service.login(email, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/login');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);
    });
  });

  // ========== TESTS DE logout() ==========

  describe('logout()', () => {
    it('should call authService.logout()', (done) => {
      const email = 'test@test.com';

      service.logout(email).subscribe(() => {
        expect(authService.logout).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/logout');
      req.flush({});
    });

    it('should remove loggedUser from sessionStorage', (done) => {
      const email = 'test@test.com';

      service.logout(email).subscribe(() => {
        expect(sessionStorage.removeItem).toHaveBeenCalledWith('loggedUser');
        done();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/logout');
      req.flush({});
    });

    it('should send logout request with email', (done) => {
      const email = 'test@test.com';

      service.logout(email).subscribe(() => done());

      const req = httpMock.expectOne('http://localhost:8080/api/utilisateur/logout');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ email });
      req.flush({});
    });
  });

  // ========== TESTS DE addUserToProject() ==========

  describe('addUserToProject()', () => {
    it('should add user to project with correct parameters', (done) => {
      const user = { nom: 'Test User', email: 'test@test.com' };
      const projectId = 5;

      service.addUserToProject(user, projectId).subscribe(() => done());

      const req = httpMock.expectOne(`http://localhost:8080/api/utilisateur/add-user-to-project?id=${projectId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(user);
      req.flush({});
    });
  });

  // ========== TESTS DE removeUser() ==========

  describe('removeUser()', () => {
    it('should remove user from users array', () => {
      service.users = [
        { id: 1, nom: 'User 1', email: 'user1@test.com', role_app: 'MEMBRE', password: null, etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: null },
        { id: 2, nom: 'User 2', email: 'user2@test.com', role_app: 'ADMIN', password: null, etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: null },
        { id: 3, nom: 'User 3', email: 'user3@test.com', role_app: 'MEMBRE', password: null, etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: null }
      ];

      service.removeUser(2);

      expect(service.users.length).toBe(2);
      expect(service.users.find(u => u.id === 2)).toBeUndefined();
      expect(service.users.find(u => u.id === 1)).toBeDefined();
      expect(service.users.find(u => u.id === 3)).toBeDefined();
    });

    it('should not modify array if user ID does not exist', () => {
      service.users = [
        { id: 1, nom: 'User 1', email: 'user1@test.com', role_app: 'MEMBRE', password: null, etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: null }
      ];

      service.removeUser(999);

      expect(service.users.length).toBe(1);
    });
  });

  // ========== TESTS DE updateUserRole() ==========

  describe('updateUserRole()', () => {
    it('should update user role when user exists', () => {
      const mockRole: RoleModel = { id: 1, nom: 'ADMIN' } as RoleModel;
      service.users = [
        { id: 1, nom: 'User 1', email: 'user1@test.com', role_app: 'MEMBRE', password: null, etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: [] }
      ];

      service.updateUserRole(1, mockRole);

      expect(service.users[0].roles_projet).toEqual([mockRole]);
    });

    it('should not throw error when user does not exist', () => {
      const mockRole: RoleModel = { id: 1, nom: 'ADMIN' } as RoleModel;
      service.users = [
        { id: 1, nom: 'User 1', email: 'user1@test.com', role_app: 'MEMBRE', password: null, etat_connexion: false, tache_commanditaire: null, taches_destinataire: null, projets_utilisateur: null, projets: null, roles_projet: [] }
      ];

      expect(() => service.updateUserRole(999, mockRole)).not.toThrow();
    });
  });

  // ========== TESTS DE addUserRoledToProject() ==========

  describe('addUserRoledToProject()', () => {
    it('should add user with role to project', (done) => {
      spyOn(console, 'log');
      const nom = 'Test User';
      const roleId = 'ADMIN';
      const projectId = 10;

      service.addUserRoledToProject(nom, roleId, projectId).subscribe(() => {
        expect(console.log).toHaveBeenCalledWith('Adding user to project', nom, roleId, projectId);
        done();
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/utilisateur/add-user-to-project?id=${projectId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ nom, role_app: roleId });
      req.flush({});
    });

    it('should handle null roleId', (done) => {
      const nom = 'Test User';
      const roleId = null;
      const projectId = 10;

      service.addUserRoledToProject(nom, roleId, projectId).subscribe(() => done());

      const req = httpMock.expectOne(`http://localhost:8080/api/utilisateur/add-user-to-project?id=${projectId}`);
      expect(req.request.body).toEqual({ nom, role_app: null });
      req.flush({});
    });
  });

  // ========== TESTS DE getUserByNom() ==========

  describe('getUserByNom()', () => {
    it('should fetch user by name', (done) => {
      const nom = 'Test User';
      const mockUser: UserModel = {
        id: 1,
        nom,
        email: 'test@test.com',
        role_app: 'MEMBRE',
        password: null,
        etat_connexion: false,
        tache_commanditaire: null,
        taches_destinataire: null,
        projets_utilisateur: null,
        projets: null,
        roles_projet: null
      };

      service.getUserByNom(nom).subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/utilisateur/nom?nom=${encodeURIComponent(nom)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should encode special characters in name', (done) => {
      const nom = 'Test User & Co.';

      service.getUserByNom(nom).subscribe(() => done());

      const req = httpMock.expectOne(`http://localhost:8080/api/utilisateur/nom?nom=${encodeURIComponent(nom)}`);
      expect(req.request.url).toContain(encodeURIComponent(nom));
      req.flush({});
    });
  });
});
