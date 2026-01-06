import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Part categories in inventory
export type PartCategory = 'ENGINE' | 'BRAKES' | 'ELECTRICAL' | 'SUSPENSION' | 'BODY' | 'TRANSMISSION' | 'FLUIDS' | 'FILTERS' | 'TIRES' | 'OTHER';
export type PartRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Request DTOs for parts operations
export interface PartCreateDTO {
    name: string;
    partNumber: string;
    category: PartCategory;
    unitPrice: number;
    quantity: number;
    reorderLevel: number;
}

export interface PartUpdateDTO {
    name?: string;
    description?: string;
    category?: PartCategory;
    unitPrice?: number;
    quantity?: number;
    reorderLevel?: number;
}

export interface PartRequestCreateDTO {
    serviceRequestId: number;
    partId: number;
    technicianId: number;
    requestedQuantity: number;
    notes?: string;
}

// Response DTOs from inventory API
export interface PartResponse {
    id: number;
    name: string;
    partNumber: string;
    description?: string;
    category: PartCategory;
    unitPrice: number;
    quantity: number;
    reorderLevel: number;
    lowStock: boolean;
}

export interface PartRequestResponse {
    id: number;
    partId: number;
    partNumber?: string;
    partName: string;
    serviceRequestId: number;
    technicianId: number;
    requestedQuantity: number;
    status: PartRequestStatus;
    notes?: string;
    createdAt: string;
    processedAt?: string;
    processedBy?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface CreatedResponse {
    id: number;
}

// InventoryService handles parts catalog and part requests
// Inventory managers use this to manage stock and approve requests
@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private partsUrl = 'http://localhost:8080/api/parts';
    private requestsUrl = 'http://localhost:8080/api/part-requests';

    constructor(private http: HttpClient) { }

    // Get auth headers with JWT token
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Parts Management

    // Add new part to inventory catalog
    createPart(data: PartCreateDTO): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.partsUrl, data, { headers: this.getHeaders() });
    }

    // Get all parts with optional category filter
    getAllParts(category?: PartCategory): Observable<ApiResponse<PartResponse[]>> {
        const url = category ? `${this.partsUrl}?category=${category}` : this.partsUrl;
        return this.http.get<ApiResponse<PartResponse[]>>(url, { headers: this.getHeaders() });
    }

    // Get parts that need restocking
    getLowStockParts(): Observable<ApiResponse<PartResponse[]>> {
        return this.http.get<ApiResponse<PartResponse[]>>(`${this.partsUrl}/low-stock`, { headers: this.getHeaders() });
    }

    // Update part details or restock quantity
    updatePart(id: number, data: PartUpdateDTO): Observable<ApiResponse<PartResponse>> {
        return this.http.put<ApiResponse<PartResponse>>(`${this.partsUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    // Part Requests Management

    // Technician submits a part request
    createRequest(data: PartRequestCreateDTO): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.requestsUrl, data, { headers: this.getHeaders() });
    }

    // Get pending requests for inventory manager
    getPendingRequests(): Observable<ApiResponse<PartRequestResponse[]>> {
        return this.http.get<ApiResponse<PartRequestResponse[]>>(`${this.requestsUrl}/pending`, { headers: this.getHeaders() });
    }

    // Approve part request and deduct from stock
    approveRequest(id: number, approvedBy?: number): Observable<ApiResponse<PartRequestResponse>> {
        const url = approvedBy ? `${this.requestsUrl}/${id}/approve?approvedBy=${approvedBy}` : `${this.requestsUrl}/${id}/approve`;
        return this.http.put<ApiResponse<PartRequestResponse>>(url, {}, { headers: this.getHeaders() });
    }

    // Reject part request with optional reason
    rejectRequest(id: number, rejectedBy?: number, reason?: string): Observable<ApiResponse<PartRequestResponse>> {
        let url = `${this.requestsUrl}/${id}/reject`;
        const params: string[] = [];
        if (rejectedBy) params.push(`rejectedBy=${rejectedBy}`);
        if (reason) params.push(`reason=${encodeURIComponent(reason)}`);
        if (params.length) url += '?' + params.join('&');
        return this.http.put<ApiResponse<PartRequestResponse>>(url, {}, { headers: this.getHeaders() });
    }

    // Get total parts cost for a service request
    getTotalCostForService(serviceRequestId: number): Observable<ApiResponse<number>> {
        return this.http.get<ApiResponse<number>>(`${this.requestsUrl}/service/${serviceRequestId}/total-cost`, { headers: this.getHeaders() });
    }

    // Get all requests made by a technician
    getRequestsByTechnician(technicianId: number): Observable<ApiResponse<PartRequestResponse[]>> {
        return this.http.get<ApiResponse<PartRequestResponse[]>>(`${this.requestsUrl}/technician/${technicianId}`, { headers: this.getHeaders() });
    }
}
