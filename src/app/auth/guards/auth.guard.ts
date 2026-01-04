import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

// Guard to protect routes - only allow logged-in users
export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('accessToken');

    if (token) {
        return true;
    }

    // Not logged in - redirect to login
    router.navigate(['/auth/login']);
    return false;
};

// Guard for auth pages - redirect logged-in users to dashboard
export const guestGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return true;
    }

    // Already logged in - redirect to dashboard based on role
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        const role = user.role?.toUpperCase();

        switch (role) {
            case 'ADMIN':
                router.navigate(['/admin']);
                break;
            case 'MANAGER':
                router.navigate(['/manager']);
                break;
            case 'TECHNICIAN':
                router.navigate(['/technician']);
                break;
            case 'INVENTORY_MANAGER':
                router.navigate(['/inventory']);
                break;
            default:
                router.navigate(['/customer']);
        }
    } else {
        router.navigate(['/customer']);
    }

    return false;
};
