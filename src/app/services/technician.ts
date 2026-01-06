import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Technician specializations
export type Specialization = 'GENERAL' | 'ENGINE' | 'ELECTRICAL' | 'AC' | 'BODY';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'INACTIVE';

// Request DTO for technician registration
export interface TechnicianCreateRequest {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
    specialization: Specialization;
    experience: number;
}

// Response DTO from technician API
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
    onDuty: boolean;
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

// TechnicianService handles technician registration and management
// Includes the approval workflow and duty status toggling
@Injectable({
    providedIn: 'root'
})
export class TechnicianService {
    private apiUrl = 'http://localhost:8080/api/technicians';

    constructor(private http: HttpClient) { }

    // Get auth headers with JWT token
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Register new technician (public, no auth required)
    register(data: TechnicianCreateRequest): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.apiUrl, data);
    }

    // Get all approved technicians
    getAll(): Observable<ApiResponse<TechnicianResponse[]>> {
        return this.http.get<ApiResponse<TechnicianResponse[]>>(this.apiUrl, { headers: this.getHeaders() });
    }

    // Get single technician by ID
    getById(id: number): Observable<ApiResponse<TechnicianResponse>> {
        return this.http.get<ApiResponse<TechnicianResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    // Get technicians who are on duty and have capacity
    getAvailable(): Observable<ApiResponse<TechnicianResponse[]>> {
        return this.http.get<ApiResponse<TechnicianResponse[]>>(`${this.apiUrl}/available`, { headers: this.getHeaders() });
    }

    // Filter by specialization for better task assignment
    getBySpecialization(spec: Specialization): Observable<ApiResponse<TechnicianResponse[]>> {
        return this.http.get<ApiResponse<TechnicianResponse[]>>(`${this.apiUrl}/by-specialization?spec=${spec}`, { headers: this.getHeaders() });
    }

    // Get technicians waiting for admin approval
    getPending(): Observable<ApiResponse<TechnicianResponse[]>> {
        return this.http.get<ApiResponse<TechnicianResponse[]>>(`${this.apiUrl}/pending`, { headers: this.getHeaders() });
    }

    // Admin approves a technician application
    approve(id: number): Observable<ApiResponse<TechnicianResponse>> {
        return this.http.put<ApiResponse<TechnicianResponse>>(`${this.apiUrl}/${id}/review?action=APPROVE`, {}, { headers: this.getHeaders() });
    }

    // Admin rejects a technician application
    reject(id: number): Observable<ApiResponse<TechnicianResponse>> {
        return this.http.put<ApiResponse<TechnicianResponse>>(`${this.apiUrl}/${id}/review?action=REJECT`, {}, { headers: this.getHeaders() });
    }

    // Technician toggles their on duty status
    toggleDuty(id: number): Observable<ApiResponse<TechnicianResponse>> {
        return this.http.put<ApiResponse<TechnicianResponse>>(`${this.apiUrl}/${id}/duty`, {}, { headers: this.getHeaders() });
    }

    // Delete technician account
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
