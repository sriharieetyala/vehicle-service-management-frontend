import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceRequestService, ApiResponse } from '../../../services/service-request';

interface BayInfo {
    bayNumber: number;
    status: 'OCCUPIED' | 'FREE';
    serviceRequestId?: number;
    vehiclePlate?: string;
    technicianName?: string;
}

@Component({
    selector: 'app-bay-management',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './bay-management.html',
    styleUrl: './bay-management.css'
})
export class BayManagementPage implements OnInit {
    bays: BayInfo[] = [];
    isLoading = true;
    totalBays = 20; // 20 service bays

    constructor(private serviceRequestService: ServiceRequestService) { }

    ngOnInit(): void {
        this.loadBays();
    }

    loadBays(): void {
        // Initialize all bays as free
        this.bays = Array.from({ length: this.totalBays }, (_, i) => ({
            bayNumber: i + 1,
            status: 'FREE' as const
        }));

        // Get occupied bays from service requests
        this.serviceRequestService.getAll().subscribe({
            next: (res: ApiResponse<{ bayNumber?: number; vehiclePlate?: string; technicianName?: string; id: number; status: string }[]>) => {
                const activeRequests = (res.data || []).filter(r =>
                    r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
                );

                activeRequests.forEach(req => {
                    if (req.bayNumber && req.bayNumber <= this.totalBays) {
                        this.bays[req.bayNumber - 1] = {
                            bayNumber: req.bayNumber,
                            status: 'OCCUPIED',
                            serviceRequestId: req.id,
                            vehiclePlate: req.vehiclePlate,
                            technicianName: req.technicianName
                        };
                    }
                });
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    get occupiedCount(): number {
        return this.bays.filter(b => b.status === 'OCCUPIED').length;
    }

    get freeCount(): number {
        return this.bays.filter(b => b.status === 'FREE').length;
    }
}
