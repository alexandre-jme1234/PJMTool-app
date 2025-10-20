import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('État initial', () => {
    it('devrait avoir isLoggedIn à false par défaut', () => {
      expect(service.isLoggedIn).toBe(false);
    });

    it('devrait avoir redirectUrl à null par défaut', () => {
      expect(service.redirectUrl).toBeNull();
    });
  });

  describe('login()', () => {
    it('devrait retourner un Observable<boolean>', (done) => {
      service.login().subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });

    it('devrait mettre isLoggedIn à true après login', (done) => {
      service.login().subscribe(() => {
        expect(service.isLoggedIn).toBe(true);
        done();
      });
    });

    it('devrait avoir un délai de 1 seconde', (done) => {
      const startTime = Date.now();
      service.login().subscribe(() => {
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(1000);
        expect(elapsed).toBeLessThan(1100); // Marge de 100ms
        done();
      });
    });
  });

  describe('logout()', () => {
    it('devrait mettre isLoggedIn à false', () => {
      service.isLoggedIn = true;
      service.logout();
      expect(service.isLoggedIn).toBe(false);
    });

    it('devrait fonctionner même si déjà déconnecté', () => {
      service.isLoggedIn = false;
      service.logout();
      expect(service.isLoggedIn).toBe(false);
    });
  });

  describe('redirectUrl', () => {
    it('devrait pouvoir stocker une URL de redirection', () => {
      service.redirectUrl = '/dashboard';
      expect(service.redirectUrl).toBe('/dashboard');
    });

    it('devrait pouvoir être réinitialisé à null', () => {
      service.redirectUrl = '/projet/123';
      service.redirectUrl = null;
      expect(service.redirectUrl).toBeNull();
    });
  });
});
