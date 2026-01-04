import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TechnicianService, TechnicianResponse, ApiResponse } from '../../../../services/technician';

@Component({
    selector: 'app-technician-workload',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './technician-workload.html',
    styleUrl: './technician-workload.css'
})
export class TechnicianWorkloadPage implements OnInit {
    technicians: TechnicianResponse[] = [];
    isLoading = true;

    constructor(private technicianService: TechnicianService) { }

    ngOnInit(): void {
        this.loadTechnicians();
    }

    loadTechnicians(): void {
        this.technicianService.getAll().subscribe({
            next: (res: ApiResponse<TechnicianResponse[]>) => {
                this.technicians = (res.data || []).filter(t => t.status === 'ACTIVE');
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    get totalTechnicians(): number {
        return this.technicians.length;
    }

    get activeTasks(): number {
        return this.technicians.reduce((sum, t) => sum + (t.currentWorkload || 0), 0);
    }

    get averageLoad(): number {
        if (this.technicians.length === 0) return 0;
        return Math.round(this.activeTasks / this.technicians.length * 10) / 10;
    }

    getLoadClass(tech: TechnicianResponse): string {
        const ratio = (tech.currentWorkload || 0) / (tech.maxWorkload || 5);
        if (ratio >= 0.8) return 'high';
        if (ratio >= 0.5) return 'medium';
        return 'low';
    }
}
