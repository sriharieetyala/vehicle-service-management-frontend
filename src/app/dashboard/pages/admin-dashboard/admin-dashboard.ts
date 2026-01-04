import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';
import { TechnicianService } from '../../../services/technician';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  // Stats
  activeCustomers = 0;
  activeTechnicians = 0;
  pendingTechnicians = 0;
  isLoading = true;

  dashboardCards = [
    {
      title: 'Reports & Analytics',
      description: 'View revenue charts and service statistics',
      icon: 'bi-bar-chart-fill',
      route: '/admin/reports/revenue'
    },
    {
      title: 'Pending Technician Requests',
      description: 'Review and approve technician registrations',
      icon: 'bi-person-check',
      route: '/admin/technician-requests'
    },
    {
      title: 'Create Manager',
      description: 'Add new manager or inventory manager',
      icon: 'bi-person-plus',
      route: '/admin/managers/new'
    },
    {
      title: 'Manage Users',
      description: 'View and manage all user accounts',
      icon: 'bi-people',
      route: '/admin/customers'
    }
  ];

  constructor(
    private authService: AuthService,
    private technicianService: TechnicianService
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Load active customers count
    this.authService.getAllCustomers().subscribe({
      next: (res: { data?: { status: string }[] }) => {
        this.activeCustomers = res.data?.filter(c => c.status === 'ACTIVE').length || 0;
      }
    });

    // Load technicians counts
    this.technicianService.getAll().subscribe({
      next: (res: { data?: { status: string }[] }) => {
        const techs = res.data || [];
        this.activeTechnicians = techs.filter(t => t.status === 'ACTIVE').length;
        this.isLoading = false;
      }
    });

    this.technicianService.getPending().subscribe({
      next: (res: { data?: unknown[] }) => {
        this.pendingTechnicians = res.data?.length || 0;
      }
    });
  }
}
