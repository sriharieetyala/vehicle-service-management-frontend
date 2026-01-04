import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventoryService, PartResponse, ApiResponse, PartCategory, PartCreateDTO } from '../../../services/inventory';

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
    categories: PartCategory[] = ['ENGINE', 'ELECTRICAL', 'BRAKES', 'TRANSMISSION', 'AC', 'BODY', 'GENERAL'];

    // Add Part Modal
    showAddModal = false;
    addPartForm: FormGroup;
    isSubmitting = false;

    constructor(
        private inventoryService: InventoryService,
        private fb: FormBuilder
    ) {
        this.addPartForm = this.fb.group({
            name: ['', Validators.required],
            partNumber: ['', Validators.required],
            category: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0.01)]],
            stockQuantity: [0, [Validators.required, Validators.min(0)]],
            minimumStock: [1, [Validators.required, Validators.min(1)]]
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
        this.addPartForm.reset({ price: 0, stockQuantity: 0, minimumStock: 5 });
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
}
