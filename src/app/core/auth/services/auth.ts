import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Request DTOs for API calls
export interface LoginRequest {
  email: string;
  password: string;
}

export interface CustomerCreateRequest {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface CustomerUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Response DTOs from API
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface CreatedResponse {
  id: number;
}

export interface CustomerResponse {
  id: number;
  userId: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// AuthService handles all authentication and user management API calls
// I use this for login, registration, profile updates and admin operations
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Creates auth header with JWT token for protected endpoints
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Login and get JWT token from backend
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password });
  }

  // Register new customer account
  register(customer: CustomerCreateRequest): Observable<CreatedResponse> {
    return this.http.post<CreatedResponse>(`${this.apiUrl}/customers`, customer);
  }

  // Change password for logged in user
  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/auth/change-password`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  // Get customer profile by ID
  getCustomerProfile(id: number): Observable<ApiResponse<CustomerResponse>> {
    return this.http.get<ApiResponse<CustomerResponse>>(
      `${this.apiUrl}/customers/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Update customer profile details
  updateCustomerProfile(id: number, data: CustomerUpdateRequest): Observable<ApiResponse<CustomerResponse>> {
    return this.http.put<ApiResponse<CustomerResponse>>(
      `${this.apiUrl}/customers/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // Admin creates a new manager account
  registerManager(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    employeeId: string;
    department: string;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(
      `${this.apiUrl}/managers`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // Get all customers for admin dashboard
  getAllCustomers(): Observable<ApiResponse<CustomerResponse[]>> {
    return this.http.get<ApiResponse<CustomerResponse[]>>(
      `${this.apiUrl}/customers`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Deactivate customer account
  deactivateCustomer(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/customers/${id}`,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  // Get all technicians for admin dashboard
  getAllTechnicians(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/technicians`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Deactivate technician account
  deactivateTechnician(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/technicians/${id}`,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  // Get all managers for admin
  getAllManagers(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/managers`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Deactivate manager account
  deactivateManager(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/managers/${id}`,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  // Delete customer account permanently
  deleteCustomerAccount(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/customers/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Clear local storage on logout
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Get JWT token from storage
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Get current user info from storage
  getCurrentUser(): { userId: number; email: string; role: string; firstName: string; lastName: string } | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Update local user data after profile edit
  updateLocalUser(firstName: string, lastName: string): void {
    const user = this.getCurrentUser();
    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
}
