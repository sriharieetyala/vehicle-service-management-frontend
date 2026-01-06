import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, CustomerResponse } from '../../../core/auth/services/auth';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
    role: string;
}

@Component({
    selector: 'app-manage-customers',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './manage-customers.html',
    styleUrl: './manage-customers.css'
})
export class ManageCustomersPage implements OnInit {
    allUsers: User[] = [];
    filteredUsers: User[] = [];
    isLoading = true;

    // Filter
    selectedRole = 'ALL';

    // Deactivate Modal
    showDeactivateModal = false;
    userToDeactivate: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.loadAllUsers();
    }

    loadAllUsers(): void {
        this.isLoading = true;
        this.allUsers = [];

        // Load Customers
        this.authService.getAllCustomers().subscribe({
            next: (res) => {
                const customers = (res.data || []).map(c => ({
                    id: c.id,
                    firstName: c.firstName,
                    lastName: c.lastName,
                    email: c.email,
                    phone: c.phone,
                    status: c.status,
                    role: 'CUSTOMER'
                }));
                this.allUsers = [...this.allUsers, ...customers];
                this.applyFilter();
            }
        });

        // Load Technicians
        this.authService.getAllTechnicians().subscribe({
            next: (res) => {
                const techs = (res.data || []).map((t: any) => ({
                    id: t.id,
                    firstName: t.firstName,
                    lastName: t.lastName,
                    email: t.email,
                    phone: t.phone,
                    status: t.status || 'ACTIVE',
                    role: 'TECHNICIAN'
                }));
                this.allUsers = [...this.allUsers, ...techs];
                this.applyFilter();
            }
        });

        // Load Managers
        this.authService.getAllManagers().subscribe({
            next: (res) => {
                const managers = (res.data || []).map((m: any) => ({
                    id: m.id,
                    firstName: m.firstName,
                    lastName: m.lastName,
                    email: m.email,
                    phone: m.phone,
                    status: m.status || 'ACTIVE',
                    role: 'MANAGER'
                }));
                this.allUsers = [...this.allUsers, ...managers];
                this.applyFilter();
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    applyFilter(): void {
        if (this.selectedRole === 'ALL') {
            this.filteredUsers = this.allUsers;
        } else {
            this.filteredUsers = this.allUsers.filter(u => u.role === this.selectedRole);
        }
    }

    getStatusClass(status: string): string {
        return status.toLowerCase();
    }

    getRoleBadgeClass(role: string): string {
        switch (role) {
            case 'CUSTOMER': return 'role-customer';
            case 'TECHNICIAN': return 'role-technician';
            case 'MANAGER': return 'role-manager';
            default: return '';
        }
    }

    // Deactivate with confirmation
    openDeactivateModal(user: User): void {
        console.log('Opening deactivate modal for user:', user);
        this.userToDeactivate = user;
        this.showDeactivateModal = true;
    }

    closeDeactivateModal(): void {
        console.log('Closing deactivate modal');
        this.showDeactivateModal = false;
        this.userToDeactivate = null;
    }

    confirmDeactivate(): void {
        console.log('Confirm deactivate clicked');
        if (!this.userToDeactivate) return;

        const user = this.userToDeactivate;

        let handled = false;
        const handleSuccess = () => {
            if (handled) return;
            handled = true;
            this.loadAllUsers();
            this.closeDeactivateModal();
        };

        const handleError = (err: any) => {
            console.error('Deactivate error:', err);
            alert('Failed to deactivate user. Please try again.');
        };

        if (user.role === 'CUSTOMER') {
            this.authService.deactivateCustomer(user.id).subscribe({
                next: () => handleSuccess(),
                error: (err) => handleError(err),
                complete: () => handleSuccess()
            });
        } else if (user.role === 'TECHNICIAN') {
            this.authService.deactivateTechnician(user.id).subscribe({
                next: () => handleSuccess(),
                error: (err) => handleError(err),
                complete: () => handleSuccess()
            });
        } else if (user.role === 'MANAGER') {
            this.authService.deactivateManager(user.id).subscribe({
                next: () => handleSuccess(),
                error: (err) => handleError(err),
                complete: () => handleSuccess()
            });
        }
    }
}
