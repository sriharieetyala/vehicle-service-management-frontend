import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceRequestService, ServiceRequestResponse, ApiResponse } from '../../../services/service-request';
import { CountUpComponent } from '../../../shared/components/count-up/count-up';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [RouterLink, CountUpComponent],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.css'
})
export class ManagerDashboard implements OnInit {
  // Stats
  pendingCount = 0;
  assignedCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  closedCount = 0;
  isLoading = true;

  dashboardCards = [
    {
      title: 'Service Requests',
      description: 'View and manage all service requests',
      icon: 'bi-clipboard-check',
      route: '/manager/service-requests'
    },
    {
      title: 'Service Progress',
      description: 'Track ongoing service progress',
      icon: 'bi-hourglass-split',
      route: '/manager/progress'
    },
    {
      title: 'Bay Management',
      description: 'View and manage service bays',
      icon: 'bi-building',
      route: '/manager/bays'
    }
  ];

  constructor(private serviceRequestService: ServiceRequestService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Load all service requests and count by status
    this.serviceRequestService.getAll().subscribe({
      next: (res: ApiResponse<ServiceRequestResponse[]>) => {
        const data = res.data || [];
        this.pendingCount = data.filter(r => r.status === 'PENDING').length;
        this.assignedCount = data.filter(r => r.status === 'ASSIGNED').length;
        this.inProgressCount = data.filter(r => r.status === 'IN_PROGRESS').length;
        this.completedCount = data.filter(r => r.status === 'COMPLETED').length;
        this.closedCount = data.filter(r => r.status === 'CLOSED').length;
        this.isLoading = false;
      }
    });
  }
}


