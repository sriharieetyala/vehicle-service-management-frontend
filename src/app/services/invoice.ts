import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Payment status and methods
export type PaymentStatus = 'PENDING' | 'PAID';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';

// Request DTO for payment
export interface PaymentDTO {
    paymentMethod: PaymentMethod;
}

// Response DTOs from invoice API
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

// InvoiceService handles invoice generation and payments
// Invoices are created after service completion and paid by customers
@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private apiUrl = 'http://localhost:8080/api/invoices';

    constructor(private http: HttpClient) { }

    // Get auth headers with JWT token
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Generate invoice for a completed service request
    generate(serviceRequestId: number): Observable<InvoiceCreatedResponse> {
        return this.http.post<InvoiceCreatedResponse>(`${this.apiUrl}/generate/${serviceRequestId}`, {}, { headers: this.getHeaders() });
    }

    // Get all invoices for admin/manager
    getAll(): Observable<ApiResponse<InvoiceResponse[]>> {
        return this.http.get<ApiResponse<InvoiceResponse[]>>(this.apiUrl, { headers: this.getHeaders() });
    }

    // Get invoices for the logged in customer
    getMyInvoices(customerId: number): Observable<ApiResponse<InvoiceResponse[]>> {
        return this.http.get<ApiResponse<InvoiceResponse[]>>(`${this.apiUrl}/my?customerId=${customerId}`, { headers: this.getHeaders() });
    }

    // Get unpaid invoices for follow up
    getUnpaid(): Observable<ApiResponse<InvoiceResponse[]>> {
        return this.http.get<ApiResponse<InvoiceResponse[]>>(`${this.apiUrl}/unpaid`, { headers: this.getHeaders() });
    }

    // Customer pays their invoice
    pay(id: number, data: PaymentDTO): Observable<ApiResponse<InvoiceResponse>> {
        return this.http.put<ApiResponse<InvoiceResponse>>(`${this.apiUrl}/${id}/pay`, data, { headers: this.getHeaders() });
    }

    // Get revenue statistics for dashboard
    getStats(): Observable<ApiResponse<RevenueStats>> {
        return this.http.get<ApiResponse<RevenueStats>>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
    }
}
