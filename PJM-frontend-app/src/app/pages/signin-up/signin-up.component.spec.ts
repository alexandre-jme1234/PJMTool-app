import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SigninUpComponent, passwordsMatchValidator } from './signin-up.component';
import { UserService } from '../../services/user/user.service';
import { LoadingService } from '../../services/loading/loading.service';
import { FormControl, FormGroup } from '@angular/forms';

describe('SigninUpComponent - Tests de couverture complète', () => {
  let component: SigninUpComponent;
  let fixture: ComponentFixture<SigninUpComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['login', 'addUser', 'setUserLogged']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['loadingOn', 'loadingOff']);

    await TestBed.configureTestingModule({
      imports: [SigninUpComponent, HttpClientTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    
    fixture = TestBed.createComponent(SigninUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ========== TESTS DE CRÉATION ==========

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize signUpForm in ngOnInit', () => {
    expect(component.signUpForm).toBeDefined();
    expect(component.signUpForm.get('name')).toBeDefined();
    expect(component.signUpForm.get('email')).toBeDefined();
    expect(component.signUpForm.get('password')).toBeDefined();
  });

  it('should set submitted to false initially', () => {
    expect(component.submitted).toBe(false);
  });

  // ========== TESTS DES GETTERS ==========

  describe('Getters', () => {
    it('should return email FormControl', () => {
      const emailControl = component.email;
      expect(emailControl).toBe(component.signUpForm.get('email'));
    });

    it('should return password FormControl', () => {
      const passwordControl = component.password;
      expect(passwordControl).toBe(component.signUpForm.get('password'));
    });

    it('should return name FormControl', () => {
      const nameControl = component.name;
      expect(nameControl).toBe(component.signUpForm.get('name'));
    });
  });

  // ========== TESTS DE LA FONCTION passwordsMatchValidator ==========

  describe('passwordsMatchValidator', () => {
    it('should return null when passwords match', () => {
      const formGroup = new FormGroup({
        password: new FormControl('password123'),
        confirmPassword: new FormControl('password123')
      });
      
      const validator = passwordsMatchValidator();
      const result = validator(formGroup);
      
      expect(result).toBeNull();
    });

    it('should return error when passwords do not match', () => {
      const formGroup = new FormGroup({
        password: new FormControl('password123'),
        confirmPassword: new FormControl('different')
      });
      
      const validator = passwordsMatchValidator();
      const result = validator(formGroup);
      
      expect(result).toEqual({ passwordsDontMatch: true });
    });

    it('should return null when password is empty', () => {
      const formGroup = new FormGroup({
        password: new FormControl(''),
        confirmPassword: new FormControl('test')
      });
      
      const validator = passwordsMatchValidator();
      const result = validator(formGroup);
      
      expect(result).toBeNull();
    });

    it('should return null when confirmPassword is empty', () => {
      const formGroup = new FormGroup({
        password: new FormControl('test'),
        confirmPassword: new FormControl('')
      });
      
      const validator = passwordsMatchValidator();
      const result = validator(formGroup);
      
      expect(result).toBeNull();
    });
  });

  // ========== TESTS DE LA MÉTHODE submit() ==========

  describe('submit()', () => {
    it('should set submitted to true', () => {
      component.submit();
      expect(component.submitted).toBe(true);
    });

    it('should return early if form is invalid', () => {
      component.signUpForm.patchValue({ email: '', password: '' });
      component.submit();
      
      expect(userService.login).not.toHaveBeenCalled();
    });

    it('should return early if email is missing', () => {
      component.signUpForm.patchValue({ 
        name: 'Test',
        email: '', 
        password: 'password123' 
      });
      component.signUpForm.get('email')?.clearValidators();
      component.signUpForm.get('email')?.updateValueAndValidity();
      
      component.submit();
      
      expect(userService.login).not.toHaveBeenCalled();
    });

    it('should return early if password is missing', () => {
      component.signUpForm.patchValue({ 
        name: 'Test',
        email: 'test@test.com', 
        password: '' 
      });
      component.signUpForm.get('password')?.clearValidators();
      component.signUpForm.get('password')?.updateValueAndValidity();
      
      component.submit();
      
      expect(userService.login).not.toHaveBeenCalled();
    });

    it('should call loadingOn when form is valid', () => {
      component.signUpForm.patchValue({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
      
      userService.login.and.returnValue(of({ id: 1, email: 'test@test.com' } as any));
      
      component.submit();
      
      expect(loadingService.loadingOn).toHaveBeenCalled();
    });

    it('should call userService.login with correct credentials', () => {
      const email = 'test@test.com';
      const password = 'password123';
      
      component.signUpForm.patchValue({
        name: 'Test User',
        email,
        password
      });
      
      userService.login.and.returnValue(of({ id: 1, email } as any));
      
      component.submit();
      
      expect(userService.login).toHaveBeenCalledWith(email, password);
    });

    it('should call setUserLogged on successful login', () => {
      const mockUser = { id: 1, email: 'test@test.com' };
      
      component.signUpForm.patchValue({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
      
      userService.login.and.returnValue(of(mockUser as any));
      
      component.submit();
      
      expect(userService.setUserLogged).toHaveBeenCalledWith(mockUser);
    });

    it('should navigate to home on successful login', () => {
      component.signUpForm.patchValue({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
      
      userService.login.and.returnValue(of({ id: 1 } as any));
      
      component.submit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call loadingOff on successful login', () => {
      component.signUpForm.patchValue({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
      
      userService.login.and.returnValue(of({ id: 1 } as any));
      
      component.submit();
      
      expect(loadingService.loadingOff).toHaveBeenCalled();
    });

    it('should handle errors in try-catch block', () => {
      spyOn(console, 'error');
      component.signUpForm.patchValue({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
      
      userService.login.and.throwError('Login error');
      
      component.submit();
      
      expect(console.error).toHaveBeenCalled();
      expect(loadingService.loadingOff).toHaveBeenCalled();
    });
  });

  // ========== TESTS DE LA MÉTHODE addUserAtClick() ==========

  describe('addUserAtClick()', () => {
    it('should set submitted to true', () => {
      const user = { name: 'Test', email: 'test@test.com', password: 'pass123' };
      userService.addUser.and.returnValue(of({} as any));
      userService.login.and.returnValue(of({} as any));
      
      component.addUserAtClick(user);
      
      expect(component.submitted).toBe(true);
    });

    it('should return early if name is missing', () => {
      spyOn(console, 'error');
      const user = { email: 'test@test.com', password: 'pass123' };
      
      component.addUserAtClick(user);
      
      expect(console.error).toHaveBeenCalledWith('Champs manquants', typeof user);
      expect(userService.addUser).not.toHaveBeenCalled();
    });

    it('should return early if email is missing', () => {
      spyOn(console, 'error');
      const user = { name: 'Test', password: 'pass123' };
      
      component.addUserAtClick(user);
      
      expect(console.error).toHaveBeenCalledWith('Champs manquants', typeof user);
      expect(userService.addUser).not.toHaveBeenCalled();
    });

    it('should return early if password is missing', () => {
      spyOn(console, 'error');
      const user = { name: 'Test', email: 'test@test.com' };
      
      component.addUserAtClick(user);
      
      expect(console.error).toHaveBeenCalledWith('Champs manquants', typeof user);
      expect(userService.addUser).not.toHaveBeenCalled();
    });

    it('should call loadingOn when all fields are present', () => {
      const user = { name: 'Test', email: 'test@test.com', password: 'pass123' };
      userService.addUser.and.returnValue(of({} as any));
      userService.login.and.returnValue(of({} as any));
      
      component.addUserAtClick(user);
      
      expect(loadingService.loadingOn).toHaveBeenCalled();
    });

    it('should call addUser with correct parameters', () => {
      const user = { name: 'Test User', email: 'test@test.com', password: 'pass123' };
      userService.addUser.and.returnValue(of({} as any));
      userService.login.and.returnValue(of({} as any));
      
      component.addUserAtClick(user);
      
      expect(userService.addUser).toHaveBeenCalledWith({
        email: user.email,
        password: user.password,
        nom: user.name
      });
    });

    it('should call login after successful addUser', (done) => {
      const user = { name: 'Test', email: 'test@test.com', password: 'pass123' };
      userService.addUser.and.returnValue(of({} as any));
      userService.login.and.returnValue(of({ id: 1 } as any));
      
      component.addUserAtClick(user);
      
      setTimeout(() => {
        expect(userService.login).toHaveBeenCalledWith(user.email, user.password);
        done();
      }, 100);
    });

    it('should call setUserLogged after successful login', (done) => {
      const user = { name: 'Test', email: 'test@test.com', password: 'pass123' };
      const mockBackendUser = { id: 1, email: user.email };
      
      userService.addUser.and.returnValue(of({} as any));
      userService.login.and.returnValue(of(mockBackendUser as any));
      
      component.addUserAtClick(user);
      
      setTimeout(() => {
        expect(userService.setUserLogged).toHaveBeenCalledWith(mockBackendUser);
        done();
      }, 100);
    });

    it('should navigate to home on success', (done) => {
      const user = { name: 'Test', email: 'test@test.com', password: 'pass123' };
      userService.addUser.and.returnValue(of({} as any));
      userService.login.and.returnValue(of({ id: 1 } as any));
      
      component.addUserAtClick(user);
      
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/']);
        done();
      }, 100);
    });

    it('should call loadingOff in finalize', (done) => {
      const user = { name: 'Test', email: 'test@test.com', password: 'pass123' };
      userService.addUser.and.returnValue(of({} as any));
      userService.login.and.returnValue(of({ id: 1 } as any));
      
      component.addUserAtClick(user);
      
      setTimeout(() => {
        expect(loadingService.loadingOff).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle errors and log them', (done) => {
      spyOn(console, 'error');
      const user = { name: 'Test', email: 'test@test.com', password: 'pass123' };
      const error = new Error('Registration failed');
      
      userService.addUser.and.returnValue(throwError(() => error));
      
      component.addUserAtClick(user);
      
      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('Erreur lors de l\'inscription:', error);
        expect(loadingService.loadingOff).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  // ========== TESTS DE VALIDATION DU FORMULAIRE ==========

  describe('Form Validation', () => {
    it('should invalidate form when name is empty', () => {
      component.signUpForm.patchValue({
        name: '',
        email: 'test@test.com',
        password: 'pass123'
      });
      
      expect(component.signUpForm.invalid).toBe(true);
    });

    it('should invalidate form when email is empty', () => {
      component.signUpForm.patchValue({
        name: 'Test',
        email: '',
        password: 'pass123'
      });
      
      expect(component.signUpForm.invalid).toBe(true);
    });

    it('should invalidate form when email is invalid format', () => {
      component.signUpForm.patchValue({
        name: 'Test',
        email: 'invalid-email',
        password: 'pass123'
      });
      
      expect(component.signUpForm.get('email')?.hasError('email')).toBe(true);
    });

    it('should invalidate form when password is empty', () => {
      component.signUpForm.patchValue({
        name: 'Test',
        email: 'test@test.com',
        password: ''
      });
      
      expect(component.signUpForm.invalid).toBe(true);
    });

    it('should validate form when all fields are correct', () => {
      component.signUpForm.patchValue({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
      
      expect(component.signUpForm.valid).toBe(true);
    });
  });
});
