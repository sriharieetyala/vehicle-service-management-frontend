import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../auth/services/auth';
import { ServiceRequestService, ServiceRequestResponse, StatusUpdateDTO, RequestStatus } from '../../../services/service-request';

@Component({
    selector: 'app-my-tasks',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, DatePipe],
    templateUrl: './my-tasks.html',
    styleUrl: './my-tasks.css'
})
export class MyTasksPage implements OnInit {
    tasks: ServiceRequestResponse[] = [];
    isLoading = true;

    // Update Status Modal
    showStatusModal = false;
    selectedTask: ServiceRequestResponse | null = null;
    statusForm: FormGroup;
    isSubmitting = false;

    statuses: RequestStatus[] = [];

    constructor(
        private authService: AuthService,
        private serviceRequestService: ServiceRequestService,
        private fb: FormBuilder
    ) {
        this.statusForm = this.fb.group({
            status: ['', Validators.required],
            notes: ['']
        });
    }

    get currentUser() {
        return this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadTasks();
    }

    loadTasks(): void {
        const techId = this.currentUser?.userId;
        if (!techId) return;

        this.isLoading = true;
        this.serviceRequestService.getByTechnicianId(techId).subscribe({
            next: (res: { data?: ServiceRequestResponse[] }) => {
                this.tasks = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    openStatusModal(task: ServiceRequestResponse): void {
        this.selectedTask = task;
        this.statusForm.reset();
        // Set available statuses based on current status
        if (task.status === 'ASSIGNED') {
            this.statuses = ['IN_PROGRESS'];
        } else if (task.status === 'IN_PROGRESS') {
            this.statuses = ['COMPLETED'];
        } else {
            this.statuses = [];
        }
        this.showStatusModal = true;
    }

    closeModal(): void {
        this.showStatusModal = false;
        this.selectedTask = null;
    }

    submitStatus(): void {
        if (!this.selectedTask || this.statusForm.invalid) return;

        const data: StatusUpdateDTO = {
            status: this.statusForm.value.status,
            notes: this.statusForm.value.notes
        };

        this.isSubmitting = true;
        this.serviceRequestService.updateStatus(this.selectedTask.id, data).subscribe({
            next: () => {
                this.loadTasks();
                this.closeModal();
                this.isSubmitting = false;
            },
            error: () => this.isSubmitting = false
        });
    }

    getStatusClass(status: string): string {
        return status.toLowerCase().replace('_', '-');
    }
}
