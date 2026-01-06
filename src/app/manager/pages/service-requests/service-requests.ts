import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ServiceRequestService, ServiceRequestResponse, RequestStatus, AssignTechnicianDTO, CompleteWorkDTO } from '../../../services/service-request';
import { TechnicianService, TechnicianResponse } from '../../../services/technician';

@Component({
    selector: 'app-service-requests',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, DecimalPipe],
    templateUrl: './service-requests.html',
    styleUrl: './service-requests.css'
})
export class ServiceRequestsPage implements OnInit {
    requests: ServiceRequestResponse[] = [];
    isLoading = true;
    statusFilter: RequestStatus | '' = '';
    paymentFilter: '' | 'paid' | 'unpaid' = '';
    allRequests: ServiceRequestResponse[] = [];

    // Assign modal
    showAssignModal = false;
    selectedRequest: ServiceRequestResponse | null = null;
    availableTechnicians: TechnicianResponse[] = [];
    availableBays: number[] = [];
    assignForm: FormGroup;
    isSubmitting = false;

    // Invoice modal
    showInvoiceModal = false;
    invoiceRequest: ServiceRequestResponse | null = null;
    invoiceForm: FormGroup;
    partsCost = 0;
    isGeneratingInvoice = false;

    constructor(
        private serviceRequestService: ServiceRequestService,
        private technicianService: TechnicianService,
        private fb: FormBuilder
    ) {
        this.assignForm = this.fb.group({
            technicianId: ['', Validators.required],
            bayNumber: ['', Validators.required],
            priority: ['NORMAL', Validators.required]
        });
        this.invoiceForm = this.fb.group({
            laborCost: [0, [Validators.required, Validators.min(0)]],
            notes: ['']
        });
    }

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests(): void {
        this.isLoading = true;
        const obs = this.statusFilter
            ? this.serviceRequestService.getAll(this.statusFilter as RequestStatus)
            : this.serviceRequestService.getAll();

        obs.subscribe({
            next: (res: { data?: ServiceRequestResponse[] }) => {
                this.allRequests = res.data || [];
                this.applyPaymentFilter();
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    applyPaymentFilter(): void {
        if (this.paymentFilter === 'paid') {
            this.requests = this.allRequests.filter(r => r.status === 'CLOSED');
        } else if (this.paymentFilter === 'unpaid') {
            this.requests = this.allRequests.filter(r => r.status === 'COMPLETED' && r.finalCost);
        } else {
            this.requests = this.allRequests;
        }
    }

    filterByStatus(status: RequestStatus | ''): void {
        this.statusFilter = status;
        this.paymentFilter = '';
        this.loadRequests();
    }

    filterByPayment(filter: '' | 'paid' | 'unpaid'): void {
        this.paymentFilter = filter;
        this.statusFilter = '';
        this.loadRequests();
    }

    openAssignModal(request: ServiceRequestResponse): void {
        this.selectedRequest = request;
        this.showAssignModal = true;
        this.assignForm.reset({ priority: 'NORMAL' }); // Reset form with default priority
        this.loadTechnicians();
        this.loadBays();
    }

    loadTechnicians(): void {
        this.technicianService.getAvailable().subscribe({
            next: (res: { data?: TechnicianResponse[] }) => this.availableTechnicians = res.data || []
        });
    }

    loadBays(): void {
        this.serviceRequestService.getAvailableBays().subscribe({
            next: (res: { data?: number[] }) => this.availableBays = res.data || []
        });
    }

    closeModal(): void {
        this.showAssignModal = false;
        this.selectedRequest = null;
        this.assignForm.reset({ priority: 'NORMAL' });
    }

    submitAssign(): void {
        if (!this.selectedRequest || this.assignForm.invalid) return;

        const data: AssignTechnicianDTO = {
            technicianId: +this.assignForm.value.technicianId,
            bayNumber: +this.assignForm.value.bayNumber
        };

        this.isSubmitting = true;
        this.serviceRequestService.assign(this.selectedRequest.id, data).subscribe({
            next: () => {
                this.loadRequests();
                this.closeModal();
                this.isSubmitting = false;
            },
            error: () => this.isSubmitting = false
        });
    }

    getStatusClass(status: string): string {
        return status.toLowerCase().replace('_', '-');
    }

    // Invoice Modal Methods
    openInvoiceModal(request: ServiceRequestResponse): void {
        this.invoiceRequest = request;
        this.showInvoiceModal = true;
        this.invoiceForm.reset({ laborCost: 0, notes: '' });
        this.partsCost = 0;

        // Fetch parts cost from approved part requests
        this.serviceRequestService.getPartsCost(request.id).subscribe({
            next: (res: { data?: number }) => this.partsCost = res.data || 0
        });
    }

    closeInvoiceModal(): void {
        this.showInvoiceModal = false;
        this.invoiceRequest = null;
        this.invoiceForm.reset();
    }

    // Flag for decimal validation error
    decimalError = false;

    // Validate and show error for more than 2 decimal places
    validateDecimalInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        // Check if value has more than 2 decimal places
        const parts = value.split('.');
        if (parts.length === 2 && parts[1].length > 2) {
            this.decimalError = true;
            // Truncate to 2 decimal places
            input.value = parts[0] + '.' + parts[1].substring(0, 2);
            this.invoiceForm.patchValue({ laborCost: parseFloat(input.value) });
        } else {
            this.decimalError = false;
        }
    }

    get totalInvoice(): number {
        return this.partsCost + (this.invoiceForm.value.laborCost || 0);
    }

    generateInvoice(): void {
        if (!this.invoiceRequest || this.invoiceForm.invalid) return;

        const data: CompleteWorkDTO = {
            laborCost: Math.round((+this.invoiceForm.value.laborCost) * 100) / 100,
            partsCost: Math.round(this.partsCost * 100) / 100,
            notes: this.invoiceForm.value.notes
        };

        this.isGeneratingInvoice = true;
        this.serviceRequestService.setPricing(this.invoiceRequest.id, data).subscribe({
            next: () => {
                this.loadRequests();
                this.closeInvoiceModal();
                this.isGeneratingInvoice = false;
            },
            error: (err) => {
                alert('Error: ' + (err.error?.message || 'Could not generate invoice'));
                this.isGeneratingInvoice = false;
            }
        });
    }

    closeRequest(id: number): void {
        this.serviceRequestService.updateStatus(id, { status: 'CLOSED' }).subscribe({
            next: () => this.loadRequests()
        });
    }
}
