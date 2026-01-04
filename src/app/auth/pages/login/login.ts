import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Easy access to form controls
  get f() { return this.loginForm.controls; }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Login successful!';

        // Store token and user info
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('user', JSON.stringify({
          userId: response.userId,
          email: response.email,
          role: response.role,
          firstName: response.firstName,
          lastName: response.lastName
        }));

        // Navigate based on role
        setTimeout(() => {
          const role = response.role.toUpperCase();
          switch (role) {
            case 'ADMIN':
              this.router.navigate(['/admin']);
              break;
            case 'MANAGER':
              this.router.navigate(['/manager']);
              break;
            case 'TECHNICIAN':
              this.router.navigate(['/technician']);
              break;
            case 'INVENTORY_MANAGER':
              this.router.navigate(['/inventory']);
              break;
            default:
              this.router.navigate(['/customer']);
          }
        }, 500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
