import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ServiceRequestService, ServiceRequestResponse, ApiResponse } from '../../../../services/service-request';

@Component({
    selector: 'app-service-report',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './service-report.html',
    styleUrl: './service-report.css'
})
export class ServiceReportPage implements OnInit {
    requests: ServiceRequestResponse[] = [];
    isLoading = true;

    constructor(private serviceRequestService: ServiceRequestService) { }

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests(): void {
        this.serviceRequestService.getAll().subscribe({
            next: (res: ApiResponse<ServiceRequestResponse[]>) => {
                this.requests = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    get pendingCount(): number {
        return this.requests.filter(r => r.status === 'PENDING').length;
    }

    get assignedCount(): number {
        return this.requests.filter(r => r.status === 'ASSIGNED').length;
    }

    get inProgressCount(): number {
        return this.requests.filter(r => r.status === 'IN_PROGRESS').length;
    }

    get completedCount(): number {
        return this.requests.filter(r => r.status === 'COMPLETED' || r.status === 'CLOSED').length;
    }

    getStatusClass(status: string): string {
        return status.toLowerCase().replace('_', '-');
    }
}
