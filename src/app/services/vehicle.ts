import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Fuel types supported by the system
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG';
export type VehicleType = 'TWO_WHEELER' | 'THREE_WHEELER' | 'FOUR_WHEELER' | 'HEAVY_VEHICLE';

// Request DTOs for vehicle operations
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

// Response DTOs from vehicle API
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

// VehicleService handles all vehicle related API calls
// Customers use this to register and manage their vehicles
@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    private apiUrl = 'http://localhost:8080/api/vehicles';

    constructor(private http: HttpClient) { }

    // Get auth headers with JWT token
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Register a new vehicle
    create(data: VehicleCreateRequest): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.apiUrl, data, { headers: this.getHeaders() });
    }

    // Get single vehicle by ID
    getById(id: number): Observable<ApiResponse<VehicleResponse>> {
        return this.http.get<ApiResponse<VehicleResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    // Get all vehicles for admin
    getAll(): Observable<ApiResponse<VehicleResponse[]>> {
        return this.http.get<ApiResponse<VehicleResponse[]>>(this.apiUrl, { headers: this.getHeaders() });
    }

    // Get all vehicles for a specific customer
    getByCustomerId(customerId: number): Observable<ApiResponse<VehicleResponse[]>> {
        return this.http.get<ApiResponse<VehicleResponse[]>>(`${this.apiUrl}/customer/${customerId}`, { headers: this.getHeaders() });
    }

    // Update vehicle details
    update(id: number, data: VehicleUpdateRequest): Observable<ApiResponse<VehicleResponse>> {
        return this.http.put<ApiResponse<VehicleResponse>>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    // Delete a vehicle
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
