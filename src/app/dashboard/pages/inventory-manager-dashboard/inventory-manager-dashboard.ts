import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../../services/inventory';

@Component({
  selector: 'app-inventory-manager-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inventory-manager-dashboard.html',
  styleUrl: './inventory-manager-dashboard.css'
})
export class InventoryManagerDashboard implements OnInit {
  // Stats
  pendingRequests = 0;
  lowStockCount = 0;
  totalParts = 0;
  isLoading = true;

  dashboardCards = [
    {
      title: 'Part Requests',
      description: 'Approve or reject pending requests',
      icon: 'bi-cart-check',
      route: '/inventory/requests'
    },
    {
      title: 'Inventory',
      description: 'View all parts in stock',
      icon: 'bi-box',
      route: '/inventory/parts'
    },
    {
      title: 'Low Stock Alerts',
      description: 'View items with low stock',
      icon: 'bi-exclamation-triangle',
      route: '/inventory/low-stock'
    }
  ];

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Load pending requests
    this.inventoryService.getPendingRequests().subscribe({
      next: (res: { data?: unknown[] }) => this.pendingRequests = res.data?.length || 0
    });

    // Load all parts for total count
    this.inventoryService.getAllParts().subscribe({
      next: (res: { data?: unknown[] }) => {
        this.totalParts = res.data?.length || 0;
        this.isLoading = false;
      }
    });

    // Load low stock parts
    this.inventoryService.getLowStockParts().subscribe({
      next: (res: { data?: unknown[] }) => this.lowStockCount = res.data?.length || 0
    });
  }
}
