import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserModel } from '../../services/user/user.model';
import { AuthService } from '../../auth/auth.service';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";
import { LoadingService } from "../../services/loading/loading.service";


export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsDontMatch: true };
    } else {
      return null;
    }
  };
}

@Component({
  selector: 'app-signin-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingSpinnerComponent
],
  templateUrl: './signin-up.component.html',
  styleUrls: ['./signin-up.component.css']
})
export class SigninUpComponent implements OnInit {
  signUpForm!: FormGroup;
  submitted = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private fb: NonNullableFormBuilder,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group(
      {
        name: this.fb.control<string>('', { validators: [Validators.required] }),
        email: this.fb.control<string>('', { validators: [Validators.required, Validators.email] }),
        password: this.fb.control<string>('', { validators: [Validators.required] }),
      },
      { validators: passwordsMatchValidator() }
    );
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }


  get name() {
    return this.signUpForm.get('name');
  }

  submit() {
    try {
    this.submitted = true;
    if (this.signUpForm.invalid) return;
  
    const { email, password } = this.signUpForm.value as {
      email?: string;
      password?: string;
    };
  
    if (!email || !password) return;

    this.loadingService.loadingOn();

    console.log("loading", this.loadingService.loading$);

    console.log('email, password', email, password);

    this.userService
      .login(email, password)
      .pipe(tap((data) => this.userService.setUserLogged(data)))
      .subscribe({
        next: () => {
          this.loadingService.loadingOff();
          this.router.navigate(['/'])
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.loadingService.loadingOff();
    }
  }
  
  addUserAtClick(user: { name?: string; email?: string; password?: string }) {
    this.submitted = true;
    if (!user.name || !user.email || !user.password   ) {
      console.error('Champs manquants', typeof user);
      return;
    }
    this.loadingService.loadingOn();


    this.userService 
      .addUser({ email: user.email, password: user.password, nom: user.name })
      .pipe(
        switchMap(() => this.userService.login(user.email!, user.password!)),
        tap((backendUser) => this.userService.setUserLogged(backendUser)),
        finalize(() => this.loadingService.loadingOff())
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Erreur lors de l\'inscription:', err);
        }
      });
  }
}

