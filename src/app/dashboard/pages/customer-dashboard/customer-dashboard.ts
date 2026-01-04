import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboard {
  dashboardCards = [
    {
      title: 'My Vehicles',
      description: 'View and manage your registered vehicles',
      icon: 'bi-car-front',
      route: '/customer/vehicles'
    },
    {
      title: 'Book a Service',
      description: 'Schedule a service appointment',
      icon: 'bi-calendar-plus',
      route: '/customer/book-service'
    },
    {
      title: 'Service History',
      description: 'Track your service requests',
      icon: 'bi-clock-history',
      route: '/customer/services'
    },
    {
      title: 'My Invoices',
      description: 'View your bills and payments',
      icon: 'bi-receipt',
      route: '/customer/invoices'
    }
  ];
}
