import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth';
import { ServiceRequestService, ServiceRequestResponse, RequestStatus } from '../../../services/service-request';
import { VehicleService, VehicleResponse } from '../../../services/vehicle';

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [RouterLink, DatePipe, FormsModule],
    templateUrl: './services.html',
    styleUrl: './services.css'
})
export class ServicesPage implements OnInit {
    allServices: ServiceRequestResponse[] = [];
    services: ServiceRequestResponse[] = [];
    vehicles: VehicleResponse[] = [];
    isLoading = true;

    // Filters
    selectedStatus = 'ALL';
    selectedVehicleId: number | null = null;
    statuses: string[] = ['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED'];

    // Cancel Modal
    showCancelModal = false;
    serviceToCancel: ServiceRequestResponse | null = null;

    // Reschedule Modal
    showRescheduleModal = false;
    serviceToReschedule: ServiceRequestResponse | null = null;
    newDate = '';
    minDate = new Date().toISOString().split('T')[0];

    constructor(
        private authService: AuthService,
        private serviceRequestService: ServiceRequestService,
        private vehicleService: VehicleService
    ) { }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadVehicles();
        this.loadServices();
    }

    loadVehicles(): void {
        const customerId = this.currentUser?.userId;
        if (!customerId) return;

        this.vehicleService.getByCustomerId(customerId).subscribe({
            next: (res) => {
                this.vehicles = res.data || [];
            }
        });
    }

    loadServices(): void {
        const customerId = this.currentUser?.userId;
        if (!customerId) return;

        this.isLoading = true;

        // If a vehicle is selected, filter by vehicle
        if (this.selectedVehicleId) {
            this.serviceRequestService.getByVehicleId(this.selectedVehicleId).subscribe({
                next: (res: { data?: ServiceRequestResponse[] }) => {
                    this.allServices = res.data || [];
                    this.applyStatusFilter();
                    this.isLoading = false;
                },
                error: () => this.isLoading = false
            });
        } else {
            // Load all services for customer
            this.serviceRequestService.getByCustomerId(customerId).subscribe({
                next: (res: { data?: ServiceRequestResponse[] }) => {
                    this.allServices = res.data || [];
                    this.applyStatusFilter();
                    this.isLoading = false;
                },
                error: () => this.isLoading = false
            });
        }
    }

    onVehicleChange(): void {
        this.loadServices();
    }

    applyStatusFilter(): void {
        if (this.selectedStatus === 'ALL') {
            this.services = this.allServices;
        } else {
            this.services = this.allServices.filter(s => s.status === this.selectedStatus);
        }
    }

    getStatusClass(status: string): string {
        return status.toLowerCase().replace('_', '-');
    }

    // Check if can cancel (only PENDING or ASSIGNED status)
    canCancel(status: string): boolean {
        return status === 'PENDING' || status === 'ASSIGNED';
    }

    // Check if can reschedule
    canReschedule(status: string): boolean {
        return status === 'PENDING' || status === 'ASSIGNED';
    }

    // Cancel Modal
    openCancelModal(service: ServiceRequestResponse): void {
        this.serviceToCancel = service;
        this.showCancelModal = true;
    }

    closeCancelModal(): void {
        this.showCancelModal = false;
        this.serviceToCancel = null;
    }

    confirmCancel(): void {
        if (!this.serviceToCancel) return;

        this.serviceRequestService.cancel(this.serviceToCancel.id).subscribe({
            next: () => {
                this.loadServices();
                this.closeCancelModal();
            }
        });
    }

    // Reschedule Modal
    openRescheduleModal(service: ServiceRequestResponse): void {
        this.serviceToReschedule = service;
        this.newDate = '';
        this.showRescheduleModal = true;
    }

    closeRescheduleModal(): void {
        this.showRescheduleModal = false;
        this.serviceToReschedule = null;
        this.newDate = '';
    }

    confirmReschedule(): void {
        if (!this.serviceToReschedule || !this.newDate) return;

        this.serviceRequestService.reschedule(this.serviceToReschedule.id, this.newDate).subscribe({
            next: () => {
                this.loadServices();
                this.closeRescheduleModal();
            }
        });
    }
}
