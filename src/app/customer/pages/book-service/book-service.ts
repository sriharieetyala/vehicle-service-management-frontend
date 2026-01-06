import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth';
import { VehicleService, VehicleResponse } from '../../../services/vehicle';
import { ServiceRequestService, ServiceRequestCreate, ServiceType } from '../../../services/service-request';

@Component({
    selector: 'app-book-service',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './book-service.html',
    styleUrl: './book-service.css'
})
export class BookServicePage implements OnInit {
    vehicles: VehicleResponse[] = [];
    isLoading = true;

    serviceForm: FormGroup;
    isSubmitting = false;
    errorMessage = '';

    serviceTypes: ServiceType[] = ['REGULAR_SERVICE', 'REPAIR', 'ACCIDENT', 'OTHER'];

    // Minimum date = today
    minDate = new Date().toISOString().split('T')[0];

    constructor(
        private authService: AuthService,
        private vehicleService: VehicleService,
        private serviceRequestService: ServiceRequestService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.serviceForm = this.fb.group({
            vehicleId: ['', Validators.required],
            serviceType: ['', Validators.required],
            description: [''],
            priority: ['NORMAL', Validators.required],
            preferredDate: ['', Validators.required],
            pickupRequired: [false],
            pickupAddress: ['']
        });
    }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadVehicles();
    }

    loadVehicles(): void {
        const customerId = this.currentUser?.userId;
        if (!customerId) return;

        this.isLoading = true;
        this.vehicleService.getByCustomerId(customerId).subscribe({
            next: (res: { data?: VehicleResponse[] }) => {
                this.vehicles = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    formatServiceType(type: string): string {
        return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
    }

    submitService(): void {
        if (this.serviceForm.invalid) return;

        // Validate pickup address if pickup is required
        if (this.serviceForm.value.pickupRequired && !this.serviceForm.value.pickupAddress?.trim()) {
            this.errorMessage = 'Pickup address is required when pickup is selected';
            return;
        }

        const customerId = this.currentUser?.userId;
        if (!customerId) return;

        const data: ServiceRequestCreate = {
            customerId,
            vehicleId: +this.serviceForm.value.vehicleId,
            serviceType: this.serviceForm.value.serviceType,
            description: this.serviceForm.value.description,
            priority: this.serviceForm.value.priority || 'NORMAL',
            preferredDate: this.serviceForm.value.preferredDate,
            pickupRequired: this.serviceForm.value.pickupRequired || false,
            pickupAddress: this.serviceForm.value.pickupAddress
        };

        this.isSubmitting = true;
        this.serviceRequestService.create(data).subscribe({
            next: () => {
                this.router.navigate(['/customer/services']);
            },
            error: (err: { status?: number; error?: { message?: string } }) => {
                if (err.status === 503) {
                    this.errorMessage = 'Service temporarily unavailable. Please try again later.';
                } else if (err.status === 0) {
                    this.errorMessage = 'Unable to connect to server. Please check your connection.';
                } else {
                    this.errorMessage = err.error?.message || 'Failed to book service. Please try again.';
                }
                this.isSubmitting = false;
            }
        });
    }
}
