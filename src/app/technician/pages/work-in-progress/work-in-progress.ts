import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth';
import { ServiceRequestService, ServiceRequestResponse } from '../../../services/service-request';

@Component({
    selector: 'app-work-in-progress',
    standalone: true,
    imports: [RouterLink, DatePipe, ReactiveFormsModule],
    templateUrl: './work-in-progress.html',
    styleUrl: './work-in-progress.css'
})
export class WorkInProgressPage implements OnInit {
    tasks: ServiceRequestResponse[] = [];
    isLoading = true;

    // Complete modal
    showCompleteModal = false;
    selectedTask: ServiceRequestResponse | null = null;
    remarksForm: FormGroup;
    isSubmitting = false;

    constructor(
        private authService: AuthService,
        private serviceRequestService: ServiceRequestService,
        private fb: FormBuilder
    ) {
        this.remarksForm = this.fb.group({
            remarks: ['']
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
        this.serviceRequestService.getByTechnicianId(techId, 'IN_PROGRESS').subscribe({
            next: (res: { data?: ServiceRequestResponse[] }) => {
                this.tasks = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    openCompleteModal(task: ServiceRequestResponse): void {
        this.selectedTask = task;
        this.remarksForm.reset();
        this.showCompleteModal = true;
    }

    closeModal(): void {
        this.showCompleteModal = false;
        this.selectedTask = null;
    }

    submitComplete(): void {
        if (!this.selectedTask) return;

        this.isSubmitting = true;
        const remarks = this.remarksForm.value.remarks || '';

        this.serviceRequestService.updateStatus(this.selectedTask.id, {
            status: 'COMPLETED',
            notes: remarks
        }).subscribe({
            next: () => {
                this.loadTasks();
                this.closeModal();
                this.isSubmitting = false;
            },
            error: () => this.isSubmitting = false
        });
    }
}
