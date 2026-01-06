import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    selector: 'app-register-technician',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './register-technician.html',
    styleUrl: './register-technician.css'
})
export class RegisterTechnician {
    registerForm: FormGroup;
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    showPassword = false;
    submitted = false;

    private apiUrl = 'http://localhost:8080/api';

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            firstName: ['', [Validators.required, nameValidator]],
            lastName: ['', [Validators.required, nameValidator]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
            password: ['', [Validators.required, passwordValidator]],
            specialization: ['', [Validators.required]]
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

        this.http.post(`${this.apiUrl}/technicians`, this.registerForm.value).subscribe({
            next: () => {
                this.isLoading = false;
                this.successMessage = 'Registration submitted! Your request is pending admin approval. You will receive an email once approved.';
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
            }
        });
    }
}
