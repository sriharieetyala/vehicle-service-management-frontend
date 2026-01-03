import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.email, this.password).subscribe({
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
          if (role === 'ADMIN') {
            this.router.navigate(['/dashboard/admin']);
          } else if (role === 'MANAGER') {
            this.router.navigate(['/dashboard/manager']);
          } else {
            this.router.navigate(['/dashboard/customer']);
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
