import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceRequestService, ServiceRequestResponse, ApiResponse } from '../../../services/service-request';

@Component({
    selector: 'app-service-progress',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './service-progress.html',
    styleUrl: './service-progress.css'
})
export class ServiceProgressPage implements OnInit {
    requests: ServiceRequestResponse[] = [];
    isLoading = true;

    constructor(private serviceRequestService: ServiceRequestService) { }

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests(): void {
        this.serviceRequestService.getAll().subscribe({
            next: (res: ApiResponse<ServiceRequestResponse[]>) => {
                this.requests = (res.data || []).filter(r => r.status === 'IN_PROGRESS');
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    markCompleted(id: number): void {
        this.serviceRequestService.updateStatus(id, { status: 'COMPLETED' }).subscribe({
            next: () => this.loadRequests()
        });
    }
}
