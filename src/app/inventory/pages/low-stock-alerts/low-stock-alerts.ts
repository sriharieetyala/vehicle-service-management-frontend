import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService, PartResponse, ApiResponse } from '../../../services/inventory';

@Component({
    selector: 'app-low-stock-alerts',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './low-stock-alerts.html',
    styleUrl: './low-stock-alerts.css'
})
export class LowStockAlertsPage implements OnInit {
    parts: PartResponse[] = [];
    isLoading = true;

    constructor(private inventoryService: InventoryService) { }

    ngOnInit(): void {
        this.loadLowStock();
    }

    loadLowStock(): void {
        this.inventoryService.getLowStockParts().subscribe({
            next: (res: ApiResponse<PartResponse[]>) => {
                this.parts = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    getUrgency(part: PartResponse): string {
        const ratio = part.quantity / part.reorderLevel;
        if (ratio === 0) return 'critical';
        if (ratio < 0.5) return 'urgent';
        return 'warning';
    }
}
