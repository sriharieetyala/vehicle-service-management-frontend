import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Enums matching backend
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG';
export type VehicleType = 'TWO_WHEELER' | 'THREE_WHEELER' | 'FOUR_WHEELER' | 'HEAVY_VEHICLE';

// Request DTOs
export interface VehicleCreateRequest {
    customerId: number;
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
    fuelType: FuelType;
    vehicleType: VehicleType;
}

export interface VehicleUpdateRequest {
    brand?: string;
    model?: string;
    year?: number;
    fuelType?: FuelType;
    vehicleType?: VehicleType;
}

// Response DTOs
export interface VehicleResponse {
    id: number;
    customerId: number;
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
    fuelType: FuelType;
    vehicleType: VehicleType;
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
export class VehicleService {
    private apiUrl = 'http://localhost:8080/api/vehicles';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Create vehicle
    create(data: VehicleCreateRequest): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.apiUrl, data, { headers: this.getHeaders() });
    }

    // Get vehicle by ID
    getById(id: number): Observable<ApiResponse<VehicleResponse>> {
        return this.http.get<ApiResponse<VehicleResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    // Get all vehicles (admin)
    getAll(): Observable<ApiResponse<VehicleResponse[]>> {
        return this.http.get<ApiResponse<VehicleResponse[]>>(this.apiUrl, { headers: this.getHeaders() });
    }

    // Get vehicles by customer ID
    getByCustomerId(customerId: number): Observable<ApiResponse<VehicleResponse[]>> {
        return this.http.get<ApiResponse<VehicleResponse[]>>(`${this.apiUrl}/customer/${customerId}`, { headers: this.getHeaders() });
    }

    // Update vehicle
    update(id: number, data: VehicleUpdateRequest): Observable<ApiResponse<VehicleResponse>> {
        return this.http.put<ApiResponse<VehicleResponse>>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    // Delete vehicle
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
