import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth';
import { ServiceRequestService, ServiceRequestResponse, RequestStatus } from '../../../services/service-request';

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
    isLoading = true;

    // Filter
    selectedStatus = 'ALL';
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
        private serviceRequestService: ServiceRequestService
    ) { }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadServices();
    }

    loadServices(): void {
        const customerId = this.currentUser?.userId;
        if (!customerId) return;

        this.isLoading = true;
        this.serviceRequestService.getByCustomerId(customerId).subscribe({
            next: (res: { data?: ServiceRequestResponse[] }) => {
                this.allServices = res.data || [];
                this.applyFilter();
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    applyFilter(): void {
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
