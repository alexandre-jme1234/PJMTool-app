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
import { switchMap } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';


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
  imports: [],
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

  ngOnInit(): void {}

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  get name() {
    return this.signUpForm.get('name');
  }

  submit() {
    const { name, email, password } = this.signUpForm.value as { name?: string; email?: string; password?: string };

    if (!this.signUpForm.valid || !name || !password || !email) {
      return;
    }

    this.userService
      .addUser({ email, password, nom: name })
      .pipe(
        switchMap(() => this.userService.login(email!, password!))
      )
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => console.error('Erreur lors de l\'inscription/connexion:', err)
      });

  }

  
}
