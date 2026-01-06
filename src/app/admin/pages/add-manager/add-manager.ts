import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth';

// Custom password validator
function passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(value);
    const hasMinLength = value.length >= 8;

    const valid = hasUpperCase && hasLowerCase && hasSpecialChar && hasMinLength;
    if (!valid) {
        return { passwordStrength: { hasUpperCase, hasLowerCase, hasSpecialChar, hasMinLength } };
    }
    return null;
}

// Custom name validator - only letters and spaces
function nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.trim();
    if (!value || value.length === 0) return { required: true };
    const valid = /^[a-zA-Z\s]+$/.test(value);
    return valid ? null : { invalidName: true };
}

@Component({
    selector: 'app-add-manager',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './add-manager.html',
    styleUrl: './add-manager.css'
})
export class AddManagerPage {
    managerForm: FormGroup;
    isSubmitting = false;
    errorMessage = '';
    successMessage = '';
    showPassword = false;

    // Department options for dropdown
    departments = [
        { value: 'SERVICE_BAY', label: 'Service Bay Manager' },
        { value: 'INVENTORY', label: 'Inventory Manager' }
    ];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.managerForm = this.fb.group({
            firstName: ['', [Validators.required, nameValidator]],
            lastName: ['', [Validators.required, nameValidator]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            password: ['', [Validators.required, passwordValidator]],
            employeeId: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{4,10}$/)]],
            department: ['SERVICE_BAY', Validators.required]
        });
    }

    get f() { return this.managerForm.controls; }

    get passwordErrors() {
        const errors = this.f['password'].errors?.['passwordStrength'];
        return {
            hasMinLength: errors?.hasMinLength ?? false,
            hasUpperCase: errors?.hasUpperCase ?? false,
            hasLowerCase: errors?.hasLowerCase ?? false,
            hasSpecialChar: errors?.hasSpecialChar ?? false
        };
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.managerForm.invalid) {
            this.managerForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';
        this.successMessage = '';

        const formData = this.managerForm.value;
        const isInventory = formData.department === 'INVENTORY';

        this.authService.registerManager({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            employeeId: formData.employeeId.toUpperCase(),
            department: formData.department
        }).subscribe({
            next: () => {
                this.successMessage = isInventory
                    ? 'Inventory Manager created successfully!'
                    : 'Manager created successfully!';
                this.isSubmitting = false;
                setTimeout(() => this.router.navigate(['/admin']), 1500);
            },
            error: (err: { error?: { message?: string } }) => {
                this.errorMessage = err.error?.message || 'Failed to create manager';
                this.isSubmitting = false;
            }
        });
    }
}
