import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../auth/services/auth';
import { ServiceRequestService, ServiceRequestResponse, ApiResponse } from '../../../services/service-request';

@Component({
    selector: 'app-invoices',
    standalone: true,
    imports: [RouterLink, DatePipe, DecimalPipe],
    templateUrl: './invoices.html',
    styleUrl: './invoices.css'
})
export class InvoicesPage implements OnInit {
    invoices: ServiceRequestResponse[] = [];
    isLoading = true;

    constructor(
        private authService: AuthService,
        private serviceRequestService: ServiceRequestService
    ) { }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadInvoices();
    }

    loadInvoices(): void {
        const customerId = this.currentUser?.userId;
        if (!customerId) return;

        this.serviceRequestService.getByCustomerId(customerId).subscribe({
            next: (res: ApiResponse<ServiceRequestResponse[]>) => {
                // Show completed/closed requests that have pricing set (check finalCost from backend)
                this.invoices = (res.data || []).filter(r =>
                    (r.status === 'COMPLETED' || r.status === 'CLOSED') &&
                    (r.laborCost || r.partsCost || r.totalCost || r.finalCost)
                );
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    get totalSpent(): number {
        return this.invoices.reduce((sum, inv) => sum + (inv.finalCost || inv.totalCost || 0), 0);
    }

    isPaid(status: string): boolean {
        return status === 'CLOSED';
    }

    payInvoice(invoice: ServiceRequestResponse): void {
        // Mark as CLOSED (paid)
        this.serviceRequestService.updateStatus(invoice.id, { status: 'CLOSED' }).subscribe({
            next: () => this.loadInvoices()
        });
    }
}
