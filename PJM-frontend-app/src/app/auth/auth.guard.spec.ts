import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;
  
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
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
    
    spyOn(sessionStorage, 'clear').and.callFake(() => {
      store = {};
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: {
            parseUrl: jasmine.createSpy('parseUrl').and.returnValue('/login')
          }
        }
      ]
    });
    
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  describe('Utilisateur connecté via AuthService', () => {
    it('devrait autoriser l\'accès si isLoggedIn est true', () => {
      authService.isLoggedIn = true;
      
      const result = TestBed.runInInjectionContext(() => 
        authGuard({} as any, {} as any)
      );
      
      expect(result).toBe(true);
    });
  });

  describe('Utilisateur connecté via sessionStorage', () => {
    it('devrait autoriser l\'accès si loggedUser existe dans sessionStorage', () => {
      authService.isLoggedIn = false;
      sessionStorage.setItem('loggedUser', JSON.stringify({ id: '1', email: 'test@test.com' }));
      
      const result = TestBed.runInInjectionContext(() => 
        authGuard({} as any, {} as any)
      );
      
      expect(result).toBe(true);
      expect(authService.isLoggedIn).toBe(true); // Devrait restaurer l'état
    });

    it('devrait restaurer isLoggedIn dans AuthService', () => {
      authService.isLoggedIn = false;
      sessionStorage.setItem('loggedUser', JSON.stringify({ id: '2', email: 'user@test.com' }));
      
      TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      
      expect(authService.isLoggedIn).toBe(true);
    });
  });

  describe('Utilisateur non connecté', () => {
    it('devrait rediriger vers /login si non connecté', () => {
      authService.isLoggedIn = false;
      sessionStorage.clear();
      
      const result = TestBed.runInInjectionContext(() => 
        authGuard({} as any, {} as any)
      );
      
      expect(router.parseUrl).toHaveBeenCalledWith('/login');
    });

    it('ne devrait pas modifier isLoggedIn si non connecté', () => {
      authService.isLoggedIn = false;
      sessionStorage.clear();
      
      TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      
      expect(authService.isLoggedIn).toBe(false);
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer sessionStorage vide', () => {
      authService.isLoggedIn = false;
      sessionStorage.setItem('loggedUser', '');
      
      const result = TestBed.runInInjectionContext(() => 
        authGuard({} as any, {} as any)
      );
      
      expect(router.parseUrl).toHaveBeenCalledWith('/login');
    });

    it('devrait gérer sessionStorage null', () => {
      authService.isLoggedIn = false;
      sessionStorage.removeItem('loggedUser');
      
      const result = TestBed.runInInjectionContext(() => 
        authGuard({} as any, {} as any)
      );
      
      expect(router.parseUrl).toHaveBeenCalledWith('/login');
    });
  });
});
