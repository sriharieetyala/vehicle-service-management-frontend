import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { VehicleService, VehicleResponse, ApiResponse } from '../../../../services/vehicle';

@Component({
    selector: 'app-vehicle-history',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './vehicle-history.html',
    styleUrl: './vehicle-history.css'
})
export class VehicleHistoryPage implements OnInit {
    vehicles: VehicleResponse[] = [];
    isLoading = true;

    constructor(private vehicleService: VehicleService) { }

    ngOnInit(): void {
        this.loadVehicles();
    }

    loadVehicles(): void {
        this.vehicleService.getAll().subscribe({
            next: (res: ApiResponse<VehicleResponse[]>) => {
                this.vehicles = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    get totalVehicles(): number {
        return this.vehicles.length;
    }

    getVehiclesByType(): { type: string; count: number }[] {
        const typeMap = new Map<string, number>();
        this.vehicles.forEach(v => {
            const count = typeMap.get(v.vehicleType) || 0;
            typeMap.set(v.vehicleType, count + 1);
        });
        return Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
    }
}
