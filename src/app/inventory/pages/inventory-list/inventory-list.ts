import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventoryService, PartResponse, ApiResponse, PartCategory, PartCreateDTO, PartUpdateDTO } from '../../../services/inventory';

@Component({
    selector: 'app-inventory-list',
    standalone: true,
    imports: [RouterLink, DecimalPipe, ReactiveFormsModule],
    templateUrl: './inventory-list.html',
    styleUrl: './inventory-list.css'
})
export class InventoryListPage implements OnInit {
    parts: PartResponse[] = [];
    filteredParts: PartResponse[] = [];
    isLoading = true;
    categoryFilter: PartCategory | '' = '';
    categories: PartCategory[] = ['ENGINE', 'BRAKES', 'ELECTRICAL', 'SUSPENSION', 'BODY', 'TRANSMISSION', 'FLUIDS', 'FILTERS', 'TIRES', 'OTHER'];

    // Add Part Modal
    showAddModal = false;
    addPartForm: FormGroup;
    isSubmitting = false;

    // Edit Part Modal
    showEditModal = false;
    editPartForm: FormGroup;
    selectedPartId: number | null = null;
    isUpdating = false;

    constructor(
        private inventoryService: InventoryService,
        private fb: FormBuilder
    ) {
        this.addPartForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            partNumber: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\-]+$/)]],
            category: ['', Validators.required],
            price: ['', [Validators.required, Validators.pattern(/^(0\.\d{1,2}|[1-9]\d*(\.\d{1,2})?)$/)]],
            stockQuantity: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
            minimumStock: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]]
        });

        this.editPartForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            category: ['', Validators.required],
            unitPrice: ['', [Validators.required, Validators.pattern(/^(0\.\d{1,2}|[1-9]\d*(\.\d{1,2})?)$/)]],
            quantity: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
            reorderLevel: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]]
        });
    }

    ngOnInit(): void {
        this.loadParts();
    }

    loadParts(): void {
        this.inventoryService.getAllParts().subscribe({
            next: (res: ApiResponse<PartResponse[]>) => {
                this.parts = res.data || [];
                this.applyFilter();
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    filterByCategory(category: PartCategory | ''): void {
        this.categoryFilter = category;
        this.applyFilter();
    }

    applyFilter(): void {
        if (this.categoryFilter) {
            this.filteredParts = this.parts.filter(p => p.category === this.categoryFilter);
        } else {
            this.filteredParts = this.parts;
        }
    }

    get totalValue(): number {
        return this.parts.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0);
    }

    get lowStockCount(): number {
        return this.parts.filter(p => p.lowStock).length;
    }

    // Add Part Modal Methods
    openAddModal(): void {
        this.showAddModal = true;
        this.addPartForm.reset();
    }

    closeAddModal(): void {
        this.showAddModal = false;
        this.addPartForm.reset();
    }

    submitAddPart(): void {
        if (this.addPartForm.invalid) return;

        const data: PartCreateDTO = {
            name: this.addPartForm.value.name,
            partNumber: this.addPartForm.value.partNumber,
            category: this.addPartForm.value.category,
            unitPrice: Math.round(+this.addPartForm.value.price * 100) / 100,
            quantity: +this.addPartForm.value.stockQuantity,
            reorderLevel: +this.addPartForm.value.minimumStock
        };

        this.isSubmitting = true;
        this.inventoryService.createPart(data).subscribe({
            next: () => {
                this.loadParts();
                this.closeAddModal();
                this.isSubmitting = false;
            },
            error: () => this.isSubmitting = false
        });
    }

    // Edit Part Modal Methods
    openEditModal(part: PartResponse): void {
        this.selectedPartId = part.id;
        this.editPartForm.patchValue({
            name: part.name,
            category: part.category,
            unitPrice: part.unitPrice.toString(),
            quantity: part.quantity.toString(),
            reorderLevel: part.reorderLevel.toString()
        });
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.selectedPartId = null;
        this.editPartForm.reset();
    }

    submitEditPart(): void {
        if (this.editPartForm.invalid || !this.selectedPartId) return;

        const data: PartUpdateDTO = {
            name: this.editPartForm.value.name,
            category: this.editPartForm.value.category,
            unitPrice: Math.round(+this.editPartForm.value.unitPrice * 100) / 100,
            quantity: +this.editPartForm.value.quantity,
            reorderLevel: +this.editPartForm.value.reorderLevel
        };

        this.isUpdating = true;
        this.inventoryService.updatePart(this.selectedPartId, data).subscribe({
            next: () => {
                this.loadParts();
                this.closeEditModal();
                this.isUpdating = false;
            },
            error: () => this.isUpdating = false
        });
    }
}

