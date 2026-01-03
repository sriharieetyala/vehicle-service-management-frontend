import { Routes } from '@angular/router';
import { Landing } from './public/pages/landing/landing';
import { Login } from './auth/pages/login/login';
import { Register } from './auth/pages/register/register';
import { CustomerDashboard } from './dashboard/pages/customer-dashboard/customer-dashboard';
import { AdminDashboard } from './dashboard/pages/admin-dashboard/admin-dashboard';
import { ManagerDashboard } from './dashboard/pages/manager-dashboard/manager-dashboard';

export const routes: Routes = [
    { path: '', component: Landing },
    { path: 'auth/login', component: Login },
    { path: 'auth/register', component: Register },
    { path: 'dashboard/customer', component: CustomerDashboard },
    { path: 'dashboard/admin', component: AdminDashboard },
    { path: 'dashboard/manager', component: ManagerDashboard },
    { path: '**', redirectTo: '' }
];
