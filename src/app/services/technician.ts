import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Enums
export type Specialization = 'GENERAL' | 'ENGINE' | 'ELECTRICAL' | 'AC' | 'BRAKES' | 'TRANSMISSION';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'INACTIVE';

// Request DTOs
export interface TechnicianCreateRequest {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
    specialization: Specialization;
    experience: number;
}

// Response DTOs
export interface TechnicianResponse {
    id: number;
    userId: number;
    employeeId: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    specialization: Specialization;
    experience: number;
    status: UserStatus;
    isOnDuty: boolean;
    currentWorkload: number;
    maxWorkload: number;
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

@Injectable({
    providedIn: 'root'
})
export class TechnicianService {
    private apiUrl = 'http://localhost:8080/api/technicians';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Register (public)
    register(data: TechnicianCreateRequest): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.apiUrl, data);
    }

    // Get all technicians
    getAll(): Observable<ApiResponse<TechnicianResponse[]>> {
        return this.http.get<ApiResponse<TechnicianResponse[]>>(this.apiUrl, { headers: this.getHeaders() });
    }

    // Get by ID
    getById(id: number): Observable<ApiResponse<TechnicianResponse>> {
        return this.http.get<ApiResponse<TechnicianResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    // Get available technicians
    getAvailable(): Observable<ApiResponse<TechnicianResponse[]>> {
        return this.http.get<ApiResponse<TechnicianResponse[]>>(`${this.apiUrl}/available`, { headers: this.getHeaders() });
    }

    // Get by specialization
    getBySpecialization(spec: Specialization): Observable<ApiResponse<TechnicianResponse[]>> {
        return this.http.get<ApiResponse<TechnicianResponse[]>>(`${this.apiUrl}/by-specialization?spec=${spec}`, { headers: this.getHeaders() });
    }

    // Get pending technicians
    getPending(): Observable<ApiResponse<TechnicianResponse[]>> {
        return this.http.get<ApiResponse<TechnicianResponse[]>>(`${this.apiUrl}/pending`, { headers: this.getHeaders() });
    }

    // Approve technician
    approve(id: number): Observable<ApiResponse<TechnicianResponse>> {
        return this.http.put<ApiResponse<TechnicianResponse>>(`${this.apiUrl}/${id}/review?action=APPROVE`, {}, { headers: this.getHeaders() });
    }

    // Reject technician
    reject(id: number): Observable<ApiResponse<TechnicianResponse>> {
        return this.http.put<ApiResponse<TechnicianResponse>>(`${this.apiUrl}/${id}/review?action=REJECT`, {}, { headers: this.getHeaders() });
    }

    // Toggle duty status
    toggleDuty(id: number): Observable<ApiResponse<TechnicianResponse>> {
        return this.http.put<ApiResponse<TechnicianResponse>>(`${this.apiUrl}/${id}/duty`, {}, { headers: this.getHeaders() });
    }

    // Delete
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
