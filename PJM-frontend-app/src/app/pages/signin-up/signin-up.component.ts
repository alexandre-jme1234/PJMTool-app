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
import { switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserModel } from '../../services/user/user.model';


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
    MatButtonModule
  ],
  templateUrl: './signin-up.component.html',
  styleUrls: ['./signin-up.component.css']
})
export class SigninUpComponent implements OnInit {
  signUpForm!: FormGroup;

  constructor(
    private router: Router,
    private userService: UserService,
    private fb: NonNullableFormBuilder
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
    if (this.signUpForm.invalid) return;
  
    const { email, password } = this.signUpForm.value as {
      email?: string;
      password?: string;
    };
  
    if (!email || !password) return;
  
    this.userService
      .login(email, password)
      .pipe(tap((data) => this.userService.setUserLogged(data)))
      .subscribe({
        next: () => {
          this.router.navigate(['/'])
          
        },
        error: (err) => console.error("Erreur lors de la connexion :", err.error),
      });
  }
  
  addUserAtClick(user: { name?: string; email?: string; password?: string }) {
    if (!user.name || !user.email || !user.password) {
      console.error('Champs manquants');
      return;
    }
  
    this.userService
      .addUser({ email: user.email, password: user.password, nom: user.name })
      .pipe(switchMap(() => this.userService.login(user.email!, user.password!)))
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => console.error("Erreur lors de l'inscription :", err.error),
      });
  }
  
}
