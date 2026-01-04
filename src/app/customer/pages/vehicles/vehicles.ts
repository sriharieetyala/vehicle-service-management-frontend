import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth';
import { VehicleService, VehicleResponse, VehicleCreateRequest, FuelType, VehicleType } from '../../../services/vehicle';

@Component({
    selector: 'app-vehicles',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './vehicles.html',
    styleUrl: './vehicles.css'
})
export class VehiclesPage implements OnInit {
    vehicles: VehicleResponse[] = [];
    isLoading = true;

    // Add Modal
    showAddModal = false;
    vehicleForm: FormGroup;
    isSubmitting = false;
    errorMessage = '';

    // Delete Modal
    showDeleteModal = false;
    vehicleToDelete: VehicleResponse | null = null;

    // Dropdown options
    fuelTypes: FuelType[] = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'];
    vehicleTypes: VehicleType[] = ['TWO_WHEELER', 'THREE_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE'];

    constructor(
        private authService: AuthService,
        private vehicleService: VehicleService,
        private fb: FormBuilder
    ) {
        this.vehicleForm = this.fb.group({
            brand: ['', [Validators.required, Validators.minLength(2)]],
            model: ['', [Validators.required, Validators.minLength(1)]],
            year: ['', [Validators.required, Validators.min(1990), Validators.max(2026)]],
            plateNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/)]],
            fuelType: ['', Validators.required],
            vehicleType: ['', Validators.required]
        });
    }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    // Form field getters for validation
    get f() { return this.vehicleForm.controls; }

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

    openAddModal(): void {
        this.vehicleForm.reset();
        this.errorMessage = '';
        this.showAddModal = true;
    }

    closeAddModal(): void {
        this.showAddModal = false;
    }

    formatEnum(value: string): string {
        return value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
    }

    submitVehicle(): void {
        if (this.vehicleForm.invalid) {
            this.vehicleForm.markAllAsTouched();
            return;
        }

        const customerId = this.currentUser?.userId;
        if (!customerId) return;

        const data: VehicleCreateRequest = {
            customerId,
            brand: this.vehicleForm.value.brand,
            model: this.vehicleForm.value.model,
            year: +this.vehicleForm.value.year,
            plateNumber: this.vehicleForm.value.plateNumber.toUpperCase(),
            fuelType: this.vehicleForm.value.fuelType,
            vehicleType: this.vehicleForm.value.vehicleType
        };

        this.isSubmitting = true;
        this.vehicleService.create(data).subscribe({
            next: () => {
                this.loadVehicles();
                this.showAddModal = false;
                this.isSubmitting = false;
            },
            error: (err: { error?: { message?: string } }) => {
                this.errorMessage = err.error?.message || 'Failed to add vehicle';
                this.isSubmitting = false;
            }
        });
    }

    // Delete with confirmation
    openDeleteModal(vehicle: VehicleResponse): void {
        this.vehicleToDelete = vehicle;
        this.showDeleteModal = true;
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.vehicleToDelete = null;
    }

    confirmDelete(): void {
        if (!this.vehicleToDelete) return;

        this.vehicleService.delete(this.vehicleToDelete.id).subscribe({
            next: () => {
                this.loadVehicles();
                this.closeDeleteModal();
            }
        });
    }
}
