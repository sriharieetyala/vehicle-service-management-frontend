import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Enums
export type PaymentStatus = 'PENDING' | 'PAID';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';

// Request DTOs
export interface PaymentDTO {
    paymentMethod: PaymentMethod;
}

// Response DTOs
export interface InvoiceResponse {
    id: number;
    invoiceNumber: string;
    serviceRequestId: number;
    customerId: number;
    laborCost: number;
    partsCost: number;
    taxAmount: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    paidAt?: string;
    createdAt: string;
}

export interface RevenueStats {
    totalRevenue: number;
    todayRevenue: number;
    pendingAmount: number;
    paidInvoices: number;
    unpaidInvoices: number;
}

export interface InvoiceCreatedResponse {
    invoiceNumber: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private apiUrl = 'http://localhost:8080/api/invoices';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Generate invoice
    generate(serviceRequestId: number): Observable<InvoiceCreatedResponse> {
        return this.http.post<InvoiceCreatedResponse>(`${this.apiUrl}/generate/${serviceRequestId}`, {}, { headers: this.getHeaders() });
    }

    // Get all invoices
    getAll(): Observable<ApiResponse<InvoiceResponse[]>> {
        return this.http.get<ApiResponse<InvoiceResponse[]>>(this.apiUrl, { headers: this.getHeaders() });
    }

    // Get my invoices (customer)
    getMyInvoices(customerId: number): Observable<ApiResponse<InvoiceResponse[]>> {
        return this.http.get<ApiResponse<InvoiceResponse[]>>(`${this.apiUrl}/my?customerId=${customerId}`, { headers: this.getHeaders() });
    }

    // Get unpaid invoices
    getUnpaid(): Observable<ApiResponse<InvoiceResponse[]>> {
        return this.http.get<ApiResponse<InvoiceResponse[]>>(`${this.apiUrl}/unpaid`, { headers: this.getHeaders() });
    }

    // Pay invoice
    pay(id: number, data: PaymentDTO): Observable<ApiResponse<InvoiceResponse>> {
        return this.http.put<ApiResponse<InvoiceResponse>>(`${this.apiUrl}/${id}/pay`, data, { headers: this.getHeaders() });
    }

    // Get revenue stats
    getStats(): Observable<ApiResponse<RevenueStats>> {
        return this.http.get<ApiResponse<RevenueStats>>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
    }
}
