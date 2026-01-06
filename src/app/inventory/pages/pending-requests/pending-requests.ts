import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/auth/services/auth';
import { InventoryService, PartRequestResponse } from '../../../services/inventory';

@Component({
    selector: 'app-pending-requests',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './pending-requests.html',
    styleUrl: './pending-requests.css'
})
export class PendingRequestsPage implements OnInit {
    requests: PartRequestResponse[] = [];
    isLoading = true;

    // Reject Modal
    showRejectModal = false;
    requestToReject: PartRequestResponse | null = null;

    constructor(
        private authService: AuthService,
        private inventoryService: InventoryService
    ) { }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests(): void {
        this.isLoading = true;
        this.inventoryService.getPendingRequests().subscribe({
            next: (res: { data?: PartRequestResponse[] }) => {
                this.requests = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    approve(id: number): void {
        const userId = this.currentUser?.userId;
        this.inventoryService.approveRequest(id, userId).subscribe({
            next: () => this.loadRequests()
        });
    }

    // Open reject modal
    openRejectModal(request: PartRequestResponse): void {
        this.requestToReject = request;
        this.showRejectModal = true;
    }

    closeRejectModal(): void {
        this.showRejectModal = false;
        this.requestToReject = null;
    }

    confirmReject(): void {
        if (!this.requestToReject) return;
        const userId = this.currentUser?.userId;
        this.inventoryService.rejectRequest(this.requestToReject.id, userId, 'Rejected by manager').subscribe({
            next: () => {
                this.loadRequests();
                this.closeRejectModal();
            }
        });
    }
}
