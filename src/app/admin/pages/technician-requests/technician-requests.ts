import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TechnicianService, TechnicianResponse } from '../../../services/technician';

@Component({
    selector: 'app-technician-requests',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './technician-requests.html',
    styleUrl: './technician-requests.css'
})
export class TechnicianRequestsPage implements OnInit {
    pendingTechnicians: TechnicianResponse[] = [];
    isLoading = true;

    // Reject modal
    showRejectModal = false;
    selectedTechId: number | null = null;
    rejectForm: FormGroup;

    constructor(
        private technicianService: TechnicianService,
        private fb: FormBuilder
    ) {
        this.rejectForm = this.fb.group({
            reason: ['']
        });
    }

    ngOnInit(): void {
        this.loadPending();
    }

    loadPending(): void {
        this.isLoading = true;
        this.technicianService.getPending().subscribe({
            next: (res: { data?: TechnicianResponse[] }) => {
                this.pendingTechnicians = res.data || [];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    approve(id: number): void {
        this.technicianService.approve(id).subscribe({
            next: () => this.loadPending()
        });
    }

    openRejectModal(id: number): void {
        this.selectedTechId = id;
        this.rejectForm.reset();
        this.showRejectModal = true;
    }

    closeModal(): void {
        this.showRejectModal = false;
        this.selectedTechId = null;
    }

    confirmReject(): void {
        if (!this.selectedTechId) return;
        this.technicianService.reject(this.selectedTechId).subscribe({
            next: () => {
                this.loadPending();
                this.closeModal();
            }
        });
    }
}
