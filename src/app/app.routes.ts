import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/guards/auth.guard';

// Only eager load the landing page (first thing users see)
import { Landing } from './public/pages/landing/landing';

export const routes: Routes = [
    // Landing - eager loaded (first page)
    { path: '', component: Landing },

    // ===== AUTH ROUTES (Lazy Loaded) =====
    {
        path: 'auth/login',
        loadComponent: () => import('./core/auth/pages/login/login').then(m => m.Login),
        canActivate: [guestGuard]
    },
    {
        path: 'auth/register',
        loadComponent: () => import('./core/auth/pages/register/register').then(m => m.Register),
        canActivate: [guestGuard]
    },
    {
        path: 'auth/register-technician',
        loadComponent: () => import('./core/auth/pages/register-technician/register-technician').then(m => m.RegisterTechnician),
        canActivate: [guestGuard]
    },

    // ===== UNAUTHORIZED PAGE =====
    {
        path: 'unauthorized',
        loadComponent: () => import('./pages/unauthorized/unauthorized').then(m => m.UnauthorizedPage)
    },

    // ===== DASHBOARD ROUTES (Lazy Loaded) =====
    {
        path: 'customer',
        loadComponent: () => import('./dashboard/pages/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboard),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['CUSTOMER'] }
    },
    {
        path: 'admin',
        loadComponent: () => import('./dashboard/pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['ADMIN'] }
    },
    {
        path: 'manager',
        loadComponent: () => import('./dashboard/pages/manager-dashboard/manager-dashboard').then(m => m.ManagerDashboard),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['MANAGER'] }
    },
    {
        path: 'technician',
        loadComponent: () => import('./dashboard/pages/technician-dashboard/technician-dashboard').then(m => m.TechnicianDashboard),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['TECHNICIAN'] }
    },
    {
        path: 'inventory',
        loadComponent: () => import('./dashboard/pages/inventory-manager-dashboard/inventory-manager-dashboard').then(m => m.InventoryManagerDashboard),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['INVENTORY_MANAGER', 'MANAGER'] }
    },

    // ===== CUSTOMER FEATURE PAGES (Lazy Loaded) =====
    {
        path: 'customer/vehicles',
        loadComponent: () => import('./customer/pages/vehicles/vehicles').then(m => m.VehiclesPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['CUSTOMER'] }
    },
    {
        path: 'customer/services',
        loadComponent: () => import('./customer/pages/services/services').then(m => m.ServicesPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['CUSTOMER'] }
    },
    {
        path: 'customer/book-service',
        loadComponent: () => import('./customer/pages/book-service/book-service').then(m => m.BookServicePage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['CUSTOMER'] }
    },
    {
        path: 'customer/invoices',
        loadComponent: () => import('./customer/pages/invoices/invoices').then(m => m.InvoicesPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['CUSTOMER'] }
    },

    // ===== ADMIN FEATURE PAGES (Lazy Loaded) =====
    {
        path: 'admin/technician-requests',
        loadComponent: () => import('./admin/pages/technician-requests/technician-requests').then(m => m.TechnicianRequestsPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['ADMIN'] }
    },
    {
        path: 'admin/managers/new',
        loadComponent: () => import('./admin/pages/add-manager/add-manager').then(m => m.AddManagerPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['ADMIN'] }
    },
    {
        path: 'admin/customers',
        loadComponent: () => import('./admin/pages/manage-customers/manage-customers').then(m => m.ManageCustomersPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['ADMIN'] }
    },
    {
        path: 'admin/reports/services',
        loadComponent: () => import('./admin/pages/reports/service-report/service-report').then(m => m.ServiceReportPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['ADMIN'] }
    },
    {
        path: 'admin/reports/technicians',
        loadComponent: () => import('./admin/pages/reports/technician-workload/technician-workload').then(m => m.TechnicianWorkloadPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['ADMIN'] }
    },
    {
        path: 'admin/reports/vehicles',
        loadComponent: () => import('./admin/pages/reports/vehicle-history/vehicle-history').then(m => m.VehicleHistoryPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['ADMIN'] }
    },
    {
        path: 'admin/reports/revenue',
        loadComponent: () => import('./admin/pages/reports/revenue-report/revenue-report').then(m => m.RevenueReportPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['ADMIN'] }
    },

    // ===== MANAGER FEATURE PAGES (Lazy Loaded) =====
    {
        path: 'manager/service-requests',
        loadComponent: () => import('./manager/pages/service-requests/service-requests').then(m => m.ServiceRequestsPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['MANAGER'] }
    },
    {
        path: 'manager/progress',
        loadComponent: () => import('./manager/pages/service-progress/service-progress').then(m => m.ServiceProgressPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['MANAGER'] }
    },
    {
        path: 'manager/bays',
        loadComponent: () => import('./manager/pages/bay-management/bay-management').then(m => m.BayManagementPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['MANAGER'] }
    },

    // ===== TECHNICIAN FEATURE PAGES (Lazy Loaded) =====
    {
        path: 'technician/tasks',
        loadComponent: () => import('./technician/pages/my-tasks/my-tasks').then(m => m.MyTasksPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['TECHNICIAN'] }
    },
    {
        path: 'technician/work-in-progress',
        loadComponent: () => import('./technician/pages/work-in-progress/work-in-progress').then(m => m.WorkInProgressPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['TECHNICIAN'] }
    },
    {
        path: 'technician/part-requests',
        loadComponent: () => import('./technician/pages/part-requests/part-requests').then(m => m.PartRequestsPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['TECHNICIAN'] }
    },

    // ===== INVENTORY FEATURE PAGES (Lazy Loaded) =====
    {
        path: 'inventory/requests',
        loadComponent: () => import('./inventory/pages/pending-requests/pending-requests').then(m => m.PendingRequestsPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['INVENTORY_MANAGER', 'MANAGER'] }
    },
    {
        path: 'inventory/parts',
        loadComponent: () => import('./inventory/pages/inventory-list/inventory-list').then(m => m.InventoryListPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['INVENTORY_MANAGER', 'MANAGER'] }
    },
    {
        path: 'inventory/low-stock',
        loadComponent: () => import('./inventory/pages/low-stock-alerts/low-stock-alerts').then(m => m.LowStockAlertsPage),
        canActivate: [authGuard, roleGuard],
        data: { allowedRoles: ['INVENTORY_MANAGER', 'MANAGER'] }
    },

    // ===== SHARED PAGES (Lazy Loaded) =====
    {
        path: 'profile',
        loadComponent: () => import('./shared/pages/profile/profile').then(m => m.Profile),
        canActivate: [authGuard]
    },

    // Legacy routes redirect
    { path: 'dashboard/customer', redirectTo: 'customer' },
    { path: 'dashboard/admin', redirectTo: 'admin' },
    { path: 'dashboard/manager', redirectTo: 'manager' },
    { path: 'dashboard/technician', redirectTo: 'technician' },
    { path: 'dashboard/inventory-manager', redirectTo: 'inventory' },

    { path: '**', redirectTo: '' }
];
