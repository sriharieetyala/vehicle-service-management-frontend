import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Service request status flow
export type RequestStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
export type ServiceType = 'REGULAR_SERVICE' | 'REPAIR' | 'ACCIDENT' | 'OTHER';

// Request DTOs for service operations
export interface ServiceRequestCreate {
    customerId: number;
    vehicleId: number;
    serviceType: ServiceType;
    description?: string;
    priority?: 'NORMAL' | 'URGENT';
    preferredDate?: string;
    pickupRequired?: boolean;
    pickupAddress?: string;
}

export interface AssignTechnicianDTO {
    technicianId: number;
    bayNumber: number;
    estimatedHours?: number;
}

export interface StatusUpdateDTO {
    status: RequestStatus;
    notes?: string;
}

export interface CompleteWorkDTO {
    laborCost: number;
    partsCost?: number;
    notes?: string;
}

// Response DTOs from service request API
export interface ServiceRequestResponse {
    id: number;
    customerId: number;
    vehicleId: number;
    technicianId?: number;
    technicianName?: string;
    vehiclePlate?: string;
    issueDescription?: string;
    priority?: 'NORMAL' | 'URGENT';
    serviceType: ServiceType;
    status: RequestStatus;
    description?: string;
    bayNumber?: number;
    laborCost?: number;
    partsCost?: number;
    totalCost?: number;
    finalCost?: number;
    createdAt: string;
    completedAt?: string;
    preferredDate?: string;
    pickupRequired?: boolean;
    pickupAddress?: string;
}

export interface BayStatus {
    bayNumber: number;
    isOccupied: boolean;
    serviceRequestId?: number;
}

export interface DashboardStats {
    totalRequests: number;
    pendingRequests: number;
    inProgressRequests: number;
    completedToday: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface CreatedResponse {
    id: number;
}

// ServiceRequestService handles the entire service request lifecycle
// From booking by customer to assignment, work completion and closing
@Injectable({
    providedIn: 'root'
})
export class ServiceRequestService {
    private apiUrl = 'http://localhost:8080/api/service-requests';

    constructor(private http: HttpClient) { }

    // Get auth headers with JWT token
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // Customer books a new service request
    create(data: ServiceRequestCreate): Observable<CreatedResponse> {
        return this.http.post<CreatedResponse>(this.apiUrl, data, { headers: this.getHeaders() });
    }

    // Get single service request by ID
    getById(id: number): Observable<ApiResponse<ServiceRequestResponse>> {
        return this.http.get<ApiResponse<ServiceRequestResponse>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    // Get all service requests for a customer
    getByCustomerId(customerId: number): Observable<ApiResponse<ServiceRequestResponse[]>> {
        return this.http.get<ApiResponse<ServiceRequestResponse[]>>(`${this.apiUrl}/customer/${customerId}`, { headers: this.getHeaders() });
    }

    // Get service history for a vehicle
    getByVehicleId(vehicleId: number): Observable<ApiResponse<ServiceRequestResponse[]>> {
        return this.http.get<ApiResponse<ServiceRequestResponse[]>>(`${this.apiUrl}/vehicle/${vehicleId}`, { headers: this.getHeaders() });
    }

    // Get all requests with optional status filter
    getAll(status?: RequestStatus): Observable<ApiResponse<ServiceRequestResponse[]>> {
        const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
        return this.http.get<ApiResponse<ServiceRequestResponse[]>>(url, { headers: this.getHeaders() });
    }

    // Get all tasks assigned to a technician
    getByTechnicianId(technicianId: number, status?: RequestStatus): Observable<ApiResponse<ServiceRequestResponse[]>> {
        const url = status ? `${this.apiUrl}/technician/${technicianId}?status=${status}` : `${this.apiUrl}/technician/${technicianId}`;
        return this.http.get<ApiResponse<ServiceRequestResponse[]>>(url, { headers: this.getHeaders() });
    }

    // Manager assigns technician and service bay
    assign(id: number, data: AssignTechnicianDTO): Observable<ApiResponse<ServiceRequestResponse>> {
        return this.http.put<ApiResponse<ServiceRequestResponse>>(`${this.apiUrl}/${id}/assign`, data, { headers: this.getHeaders() });
    }

    // Update request status through the workflow
    updateStatus(id: number, data: StatusUpdateDTO): Observable<ApiResponse<ServiceRequestResponse>> {
        return this.http.put<ApiResponse<ServiceRequestResponse>>(`${this.apiUrl}/${id}/status`, data, { headers: this.getHeaders() });
    }

    // Manager sets labor cost after work is done
    setPricing(id: number, data: CompleteWorkDTO): Observable<ApiResponse<ServiceRequestResponse>> {
        return this.http.put<ApiResponse<ServiceRequestResponse>>(`${this.apiUrl}/${id}/set-pricing`, data, { headers: this.getHeaders() });
    }

    // Customer cancels their request
    cancel(id: number): Observable<ApiResponse<ServiceRequestResponse>> {
        return this.http.put<ApiResponse<ServiceRequestResponse>>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders() });
    }

    // Customer reschedules to a new date
    reschedule(id: number, newDate: string): Observable<ApiResponse<ServiceRequestResponse>> {
        return this.http.put<ApiResponse<ServiceRequestResponse>>(`${this.apiUrl}/${id}/reschedule?date=${newDate}`, {}, { headers: this.getHeaders() });
    }

    // Get dashboard statistics
    getStats(): Observable<ApiResponse<DashboardStats>> {
        return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
    }

    // Get status of all service bays
    getAllBays(): Observable<ApiResponse<BayStatus[]>> {
        return this.http.get<ApiResponse<BayStatus[]>>(`${this.apiUrl}/bays`, { headers: this.getHeaders() });
    }

    // Get list of available bays for assignment
    getAvailableBays(): Observable<ApiResponse<number[]>> {
        return this.http.get<ApiResponse<number[]>>(`${this.apiUrl}/bays/available`, { headers: this.getHeaders() });
    }

    // Get parts cost from inventory for a request
    getPartsCost(id: number): Observable<ApiResponse<number>> {
        return this.http.get<ApiResponse<number>>(`${this.apiUrl}/${id}/parts-cost`, { headers: this.getHeaders() });
    }
}
