import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';
import { ServiceRequestService } from '../../../services/service-request';
import { InventoryService, PartRequestResponse, ApiResponse } from '../../../services/inventory';
import { TechnicianService, TechnicianResponse, ApiResponse as TechApiResponse } from '../../../services/technician';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './technician-dashboard.html',
  styleUrl: './technician-dashboard.css'
})
export class TechnicianDashboard implements OnInit {
  // Stats
  assignedCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  approvedParts = 0;
  rejectedParts = 0;
  isLoading = true;

  // Duty toggle
  isOnDuty = false;
  isTogglingDuty = false;

  dashboardCards = [
    {
      title: 'My Tasks',
      description: 'View assigned tasks',
      icon: 'bi-list-task',
      route: '/technician/tasks'
    },
    {
      title: 'Work in Progress',
      description: 'Current repairs',
      icon: 'bi-wrench',
      route: '/technician/work-in-progress'
    },
    {
      title: 'Part Requests',
      description: 'Request and track parts',
      icon: 'bi-box-seam',
      route: '/technician/part-requests'
    }
  ];

  constructor(
    private authService: AuthService,
    private serviceRequestService: ServiceRequestService,
    private inventoryService: InventoryService,
    private technicianService: TechnicianService
  ) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadPartRequestStats();
    this.loadDutyStatus();
  }

  loadStats(): void {
    const techId = this.authService.getCurrentUser()?.userId;
    if (!techId) return;

    this.serviceRequestService.getByTechnicianId(techId).subscribe({
      next: (res) => {
        const tasks = res.data || [];
        this.assignedCount = tasks.filter((t: { status: string }) => t.status === 'ASSIGNED').length;
        this.inProgressCount = tasks.filter((t: { status: string }) => t.status === 'IN_PROGRESS').length;
        this.completedCount = tasks.filter((t: { status: string }) => t.status === 'COMPLETED').length;
        this.isLoading = false;
      }
    });
  }

  loadPartRequestStats(): void {
    const techId = this.authService.getCurrentUser()?.userId;
    if (!techId) return;

    this.inventoryService.getRequestsByTechnician(techId).subscribe({
      next: (res: ApiResponse<PartRequestResponse[]>) => {
        const requests = res.data || [];
        this.approvedParts = requests.filter(r => r.status === 'APPROVED').length;
        this.rejectedParts = requests.filter(r => r.status === 'REJECTED').length;
      }
    });
  }

  loadDutyStatus(): void {
    const techId = this.authService.getCurrentUser()?.userId;
    if (!techId) return;

    this.technicianService.getById(techId).subscribe({
      next: (res) => {
        this.isOnDuty = res.data?.isOnDuty || false;
      }
    });
  }

  toggleDuty(): void {
    const techId = this.authService.getCurrentUser()?.userId;
    if (!techId || this.isTogglingDuty) return;

    this.isTogglingDuty = true;
    this.technicianService.toggleDuty(techId).subscribe({
      next: (res) => {
        this.isOnDuty = res.data?.isOnDuty || false;
        this.isTogglingDuty = false;
      },
      error: () => {
        this.isTogglingDuty = false;
      }
    });
  }
}
