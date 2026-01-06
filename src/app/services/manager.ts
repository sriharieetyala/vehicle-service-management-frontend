import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Manager departments
export type Department = 'SERVICE' | 'INVENTORY';

// Request DTOs for manager operations
export interface ManagerCreateRequest {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
    department: Department;
}

export interface ManagerUpdateRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: Department;
}

// Response DTO from manager API
export interface ManagerResponse {
    id: number;
    userId: number;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    department: Department;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface CreatedResponse {
    id: number;
}

// ManagerService handles manager creation and management
// Only admins can create managers, credentials are sent via email
@Injectable({
    providedIn: 'root'
})
export class ManagerService {
    private apiUrl = 'http://localhost:8080/api/managers';

    constructor(private http: HttpClient) { }

    // Get auth headers with JWT token
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Admin creates a new manager
    create(data: ManagerCreateRequest): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.apiUrl, data, { headers: this.getHeaders() });
    }

    // Get all managers with optional department filter
    getAll(department?: Department): Observable<ApiResponse<ManagerResponse[]>> {
        const url = department ? `${this.apiUrl}?department=${department}` : this.apiUrl;
        return this.http.get<ApiResponse<ManagerResponse[]>>(url, { headers: this.getHeaders() });
    }

    // Update manager profile
    update(id: number, data: ManagerUpdateRequest): Observable<ApiResponse<ManagerResponse>> {
        return this.http.put<ApiResponse<ManagerResponse>>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    // Delete manager account
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
