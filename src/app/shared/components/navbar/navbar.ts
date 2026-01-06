import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  showLogoutModal = false;
  showChangePasswordModal = false;
  showDeleteAccountModal = false;
  showDropdown = false;
  showMobileMenu = false;

  // Change Password form
  passwordForm: FormGroup;
  isChangingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  // Delete Account
  isDeleting = false;
  deleteError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.firstName : '';
  }

  get userRole(): string {
    const user = this.authService.getCurrentUser()
    return user?.role?.toUpperCase() || '';
  }

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  get isCustomer(): boolean {
    return this.userRole === 'CUSTOMER';
  }

  get isTechnician(): boolean {
    return this.userRole === 'TECHNICIAN';
  }

  get isManager(): boolean {
    return this.userRole === 'MANAGER';
  }

  // Show Home only for guests (not logged in)
  get showHomeLink(): boolean {
    return !this.isLoggedIn;
  }

  get dashboardLink(): string {
    switch (this.userRole) {
      case 'ADMIN': return '/admin';
      case 'MANAGER': return '/manager';
      case 'TECHNICIAN': return '/technician';
      case 'INVENTORY_MANAGER': return '/inventory';
      default: return '/customer';
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    this.showDropdown = false;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  closeMenus(): void {
    this.showDropdown = false;
    this.showMobileMenu = false;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  // Logout Modal
  openLogoutModal(): void {
    this.showDropdown = false;
    this.showMobileMenu = false;
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Change Password Modal
  openChangePasswordModal(): void {
    this.showDropdown = false;
    this.showMobileMenu = false;
    this.passwordForm.reset();
    this.passwordError = '';
    this.passwordSuccess = '';
    this.showChangePasswordModal = true;
  }

  submitChangePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    this.isChangingPassword = true;
    this.passwordError = '';

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSuccess = 'Password changed successfully!';
        setTimeout(() => {
          this.showChangePasswordModal = false;
        }, 1500);
      },
      error: (error) => {
        this.isChangingPassword = false;
        this.passwordError = error.error?.message || 'Failed to change password';
      }
    });
  }

  // Delete Account Modal
  openDeleteAccountModal(): void {
    this.showDropdown = false;
    this.showMobileMenu = false;
    this.deleteError = '';
    this.showDeleteAccountModal = true;
  }

  confirmDeleteAccount(): void {
    const userId = this.authService.getCurrentUser()?.userId;
    if (!userId) return;

    this.isDeleting = true;
    this.deleteError = '';

    this.authService.deleteCustomerAccount(userId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteAccountModal = false;
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isDeleting = false;
        this.deleteError = error.error?.message || 'Failed to delete account';
      }
    });
  }
}
