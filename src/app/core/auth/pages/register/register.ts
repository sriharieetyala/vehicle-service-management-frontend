import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

// Custom password validator
function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const hasMinLength = value.length >= 8;

  const valid = hasUpperCase && hasLowerCase && hasSpecialChar && hasMinLength;

  if (!valid) {
    return {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasSpecialChar,
        hasMinLength
      }
    };
  }
  return null;
}

// Custom name validator - only letters and spaces, no empty/whitespace-only
function nameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim();
  if (!value || value.length === 0) return { required: true };

  const valid = /^[a-zA-Z\s]+$/.test(value);
  return valid ? null : { invalidName: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, nameValidator]],
      lastName: ['', [Validators.required, nameValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, passwordValidator]],
      address: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });
  }

  get f() { return this.registerForm.controls; }

  get passwordErrors() {
    const errors = this.f['password'].errors?.['passwordStrength'];
    return errors || { hasUpperCase: true, hasLowerCase: true, hasSpecialChar: true, hasMinLength: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
