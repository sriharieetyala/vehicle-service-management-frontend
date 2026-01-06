import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/auth/services/auth';
import { InventoryService, PartRequestResponse, PartRequestCreateDTO, PartResponse } from '../../../services/inventory';
import { ServiceRequestService, ServiceRequestResponse } from '../../../services/service-request';

@Component({
    selector: 'app-part-requests',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, DatePipe],
    templateUrl: './part-requests.html',
    styleUrl: './part-requests.css'
})
export class PartRequestsPage implements OnInit {
    requests: PartRequestResponse[] = [];
    isLoading = true;

    // Status filter
    statusFilter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';

    get filteredRequests(): PartRequestResponse[] {
        if (this.statusFilter === 'ALL') return this.requests;
        return this.requests.filter(r => r.status === this.statusFilter);
    }

    setStatusFilter(status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'): void {
        this.statusFilter = status;
    }

    // Dropdown options
    availableParts: PartResponse[] = [];
    assignedServices: ServiceRequestResponse[] = [];

    // Request Modal
    showRequestModal = false;
    requestForm: FormGroup;
    isSubmitting = false;

    constructor(
        private authService: AuthService,
        private inventoryService: InventoryService,
        private serviceRequestService: ServiceRequestService,
        private fb: FormBuilder
    ) {
        this.requestForm = this.fb.group({
            partId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            serviceRequestId: ['', Validators.required]
        });
    }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadRequests();
        this.loadParts();
        this.loadAssignedServices();
    }

    loadRequests(): void {
        const techId = this.currentUser?.userId;
        if (!techId) return;

        this.isLoading = true;
        this.inventoryService.getRequestsByTechnician(techId).subscribe({
            next: (res: { data?: PartRequestResponse[] }) => {
                this.requests = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    loadParts(): void {
        this.inventoryService.getAllParts().subscribe({
            next: (res: { data?: PartResponse[] }) => {
                this.availableParts = res.data || [];
            }
        });
    }

    loadAssignedServices(): void {
        const techId = this.currentUser?.userId;
        if (!techId) return;

        // Get only IN_PROGRESS and ASSIGNED services for this technician
        this.serviceRequestService.getByTechnicianId(techId).subscribe({
            next: (res: { data?: ServiceRequestResponse[] }) => {
                this.assignedServices = (res.data || []).filter(
                    s => s.status === 'ASSIGNED' || s.status === 'IN_PROGRESS'
                );
            }
        });
    }

    getStatusClass(status: string): string {
        return status.toLowerCase();
    }

    openRequestModal(): void {
        this.requestForm.reset({ quantity: 1 });
        this.showRequestModal = true;
    }

    closeModal(): void {
        this.showRequestModal = false;
    }

    submitRequest(): void {
        if (this.requestForm.invalid) return;

        const techId = this.currentUser?.userId;
        if (!techId) return;

        const data: PartRequestCreateDTO = {
            technicianId: techId,
            partId: +this.requestForm.value.partId,
            requestedQuantity: +this.requestForm.value.quantity,
            serviceRequestId: +this.requestForm.value.serviceRequestId
        };

        this.isSubmitting = true;
        this.inventoryService.createRequest(data).subscribe({
            next: () => {
                this.loadRequests();
                this.closeModal();
                this.isSubmitting = false;
            },
            error: () => this.isSubmitting = false
        });
    }
}
