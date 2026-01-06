import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService, CustomerResponse } from '../../../core/auth/services/auth';
import { TechnicianService, TechnicianResponse } from '../../../services/technician';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, DatePipe],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})
export class Profile implements OnInit {
    profileForm: FormGroup;
    techForm: FormGroup;
    isEditing = false;
    isLoading = true;
    isSaving = false;
    errorMessage = '';
    successMessage = '';
    customer: CustomerResponse | null = null;

    // For technician
    technician: TechnicianResponse | null = null;

    // For other users (manager, admin)
    userInfo: any = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private technicianService: TechnicianService,
        private router: Router
    ) {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
            address: [''],
            city: [''],
            state: [''],
            zipCode: ['']
        });
        this.techForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
        });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    get userRole(): string {
        return this.currentUser?.role?.toUpperCase() || '';
    }

    get isCustomer(): boolean {
        return this.userRole === 'CUSTOMER';
    }

    get isTechnician(): boolean {
        return this.userRole === 'TECHNICIAN';
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

    loadProfile(): void {
        const userId = this.currentUser?.userId;
        if (!userId) {
            this.router.navigate(['/auth/login']);
            return;
        }

        this.isLoading = true;

        if (this.isCustomer) {
            // Customer - load full profile from API
            this.authService.getCustomerProfile(userId).subscribe({
                next: (response) => {
                    this.customer = response.data;
                    this.profileForm.patchValue({
                        firstName: this.customer.firstName,
                        lastName: this.customer.lastName,
                        phone: this.customer.phone,
                        address: this.customer.address || '',
                        city: this.customer.city || '',
                        state: this.customer.state || '',
                        zipCode: this.customer.zipCode || ''
                    });
                    this.isLoading = false;
                },
                error: (error) => {
                    this.errorMessage = error.error?.message || 'Failed to load profile';
                    this.isLoading = false;
                }
            });
        } else if (this.isTechnician) {
            // Technician - load from technician API
            this.technicianService.getById(userId).subscribe({
                next: (response) => {
                    this.technician = response.data;
                    this.techForm.patchValue({
                        firstName: this.technician.firstName,
                        lastName: this.technician.lastName,
                        phone: this.technician.phone || ''
                    });
                    this.isLoading = false;
                },
                error: (error) => {
                    this.errorMessage = error.error?.message || 'Failed to load profile';
                    this.isLoading = false;
                }
            });
        } else {
            // Manager, Admin, etc - show basic info from token
            this.userInfo = {
                firstName: this.currentUser?.firstName || '',
                lastName: this.currentUser?.lastName || '',
                email: this.currentUser?.email || '',
                role: this.userRole
            };
            this.isLoading = false;
        }
    }

    toggleEdit(): void {
        this.isEditing = !this.isEditing;
        this.errorMessage = '';
        this.successMessage = '';
    }

    cancelEdit(): void {
        this.isEditing = false;
        this.loadProfile();
    }

    saveProfile(): void {
        if (this.profileForm.invalid) return;

        const userId = this.currentUser?.userId;
        if (!userId) return;

        this.isSaving = true;
        this.errorMessage = '';

        this.authService.updateCustomerProfile(userId, this.profileForm.value).subscribe({
            next: (response) => {
                this.customer = response.data;
                this.authService.updateLocalUser(this.customer.firstName, this.customer.lastName);
                this.successMessage = 'Profile updated successfully!';
                this.isEditing = false;
                this.isSaving = false;
            },
            error: (error) => {
                this.errorMessage = error.error?.message || 'Failed to update profile';
                this.isSaving = false;
            }
        });
    }

    // For technicians - just show success since no PUT endpoint exists yet
    saveTechProfile(): void {
        // Note: Backend doesn't have PUT /technicians/{id} for profile update yet
        this.successMessage = 'Profile update requires backend endpoint';
        this.isEditing = false;
    }
}
