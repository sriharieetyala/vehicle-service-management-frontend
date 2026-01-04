import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/guards/auth.guard';

import { Landing } from './public/pages/landing/landing';
import { Login } from './auth/pages/login/login';
import { Register } from './auth/pages/register/register';
import { RegisterTechnician } from './auth/pages/register-technician/register-technician';
import { CustomerDashboard } from './dashboard/pages/customer-dashboard/customer-dashboard';
import { AdminDashboard } from './dashboard/pages/admin-dashboard/admin-dashboard';
import { ManagerDashboard } from './dashboard/pages/manager-dashboard/manager-dashboard';
import { TechnicianDashboard } from './dashboard/pages/technician-dashboard/technician-dashboard';
import { InventoryManagerDashboard } from './dashboard/pages/inventory-manager-dashboard/inventory-manager-dashboard';
import { Profile } from './shared/pages/profile/profile';

// Customer Pages
import { VehiclesPage } from './customer/pages/vehicles/vehicles';
import { ServicesPage } from './customer/pages/services/services';
import { BookServicePage } from './customer/pages/book-service/book-service';
import { InvoicesPage } from './customer/pages/invoices/invoices';

// Admin Pages
import { TechnicianRequestsPage } from './admin/pages/technician-requests/technician-requests';
import { AddManagerPage } from './admin/pages/add-manager/add-manager';
import { ManageCustomersPage } from './admin/pages/manage-customers/manage-customers';
import { ServiceReportPage } from './admin/pages/reports/service-report/service-report';
import { TechnicianWorkloadPage } from './admin/pages/reports/technician-workload/technician-workload';
import { VehicleHistoryPage } from './admin/pages/reports/vehicle-history/vehicle-history';
import { RevenueReportPage } from './admin/pages/reports/revenue-report/revenue-report';

// Manager Pages
import { ServiceRequestsPage } from './manager/pages/service-requests/service-requests';
import { ServiceProgressPage } from './manager/pages/service-progress/service-progress';
import { BayManagementPage } from './manager/pages/bay-management/bay-management';

// Technician Pages
import { MyTasksPage } from './technician/pages/my-tasks/my-tasks';
import { WorkInProgressPage } from './technician/pages/work-in-progress/work-in-progress';
import { PartRequestsPage } from './technician/pages/part-requests/part-requests';

// Inventory Pages
import { PendingRequestsPage } from './inventory/pages/pending-requests/pending-requests';
import { InventoryListPage } from './inventory/pages/inventory-list/inventory-list';
import { LowStockAlertsPage } from './inventory/pages/low-stock-alerts/low-stock-alerts';

export const routes: Routes = [
    { path: '', component: Landing },

    // Auth routes - only for guests
    { path: 'auth/login', component: Login, canActivate: [guestGuard] },
    { path: 'auth/register', component: Register, canActivate: [guestGuard] },
    { path: 'auth/register-technician', component: RegisterTechnician, canActivate: [guestGuard] },

    // Dashboard routes - protected
    { path: 'customer', component: CustomerDashboard, canActivate: [authGuard] },
    { path: 'admin', component: AdminDashboard, canActivate: [authGuard] },
    { path: 'manager', component: ManagerDashboard, canActivate: [authGuard] },
    { path: 'technician', component: TechnicianDashboard, canActivate: [authGuard] },
    { path: 'inventory', component: InventoryManagerDashboard, canActivate: [authGuard] },

    // Customer Feature Pages
    { path: 'customer/vehicles', component: VehiclesPage, canActivate: [authGuard] },
    { path: 'customer/services', component: ServicesPage, canActivate: [authGuard] },
    { path: 'customer/book-service', component: BookServicePage, canActivate: [authGuard] },
    { path: 'customer/invoices', component: InvoicesPage, canActivate: [authGuard] },

    // Admin Feature Pages
    { path: 'admin/technician-requests', component: TechnicianRequestsPage, canActivate: [authGuard] },
    { path: 'admin/managers/new', component: AddManagerPage, canActivate: [authGuard] },
    { path: 'admin/customers', component: ManageCustomersPage, canActivate: [authGuard] },
    { path: 'admin/reports/services', component: ServiceReportPage, canActivate: [authGuard] },
    { path: 'admin/reports/technicians', component: TechnicianWorkloadPage, canActivate: [authGuard] },
    { path: 'admin/reports/vehicles', component: VehicleHistoryPage, canActivate: [authGuard] },
    { path: 'admin/reports/revenue', component: RevenueReportPage, canActivate: [authGuard] },

    // Manager Feature Pages
    { path: 'manager/service-requests', component: ServiceRequestsPage, canActivate: [authGuard] },
    { path: 'manager/progress', component: ServiceProgressPage, canActivate: [authGuard] },
    { path: 'manager/bays', component: BayManagementPage, canActivate: [authGuard] },

    // Technician Feature Pages
    { path: 'technician/tasks', component: MyTasksPage, canActivate: [authGuard] },
    { path: 'technician/work-in-progress', component: WorkInProgressPage, canActivate: [authGuard] },
    { path: 'technician/part-requests', component: PartRequestsPage, canActivate: [authGuard] },


    // Inventory Feature Pages
    { path: 'inventory/requests', component: PendingRequestsPage, canActivate: [authGuard] },
    { path: 'inventory/parts', component: InventoryListPage, canActivate: [authGuard] },
    { path: 'inventory/low-stock', component: LowStockAlertsPage, canActivate: [authGuard] },

    // Profile route - protected
    { path: 'profile', component: Profile, canActivate: [authGuard] },

    // Legacy routes redirect
    { path: 'dashboard/customer', redirectTo: 'customer' },
    { path: 'dashboard/admin', redirectTo: 'admin' },
    { path: 'dashboard/manager', redirectTo: 'manager' },
    { path: 'dashboard/technician', redirectTo: 'technician' },
    { path: 'dashboard/inventory-manager', redirectTo: 'inventory' },

    { path: '**', redirectTo: '' }
];
