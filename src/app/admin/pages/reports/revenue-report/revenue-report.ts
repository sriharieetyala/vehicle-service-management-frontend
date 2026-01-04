import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ServiceRequestService, ServiceRequestResponse, ApiResponse, DashboardStats } from '../../../../services/service-request';

Chart.register(...registerables);

@Component({
    selector: 'app-revenue-report',
    standalone: true,
    imports: [RouterLink, DatePipe, DecimalPipe, FormsModule],
    templateUrl: './revenue-report.html',
    styleUrl: './revenue-report.css'
})
export class RevenueReportPage implements OnInit, AfterViewInit {
    @ViewChild('serviceChart') serviceChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('techChart') techChartRef!: ElementRef<HTMLCanvasElement>;

    allRequests: ServiceRequestResponse[] = [];
    requests: ServiceRequestResponse[] = [];
    isLoading = true;
    chartsReady = false;

    serviceChart: Chart | null = null;
    techChart: Chart | null = null;

    // Filter
    selectedMonth = '';
    months: { value: string; label: string }[] = [];

    // Dashboard stats
    stats: DashboardStats = {
        totalRequests: 0,
        pendingRequests: 0,
        inProgressRequests: 0,
        completedToday: 0
    };

    constructor(private serviceRequestService: ServiceRequestService) { }

    ngOnInit(): void {
        this.loadRevenue();
        this.loadStats();
        this.generateMonthOptions();
    }

    ngAfterViewInit(): void {
        this.chartsReady = true;
    }

    generateMonthOptions(): void {
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            this.months.push({
                value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }
    }

    loadRevenue(): void {
        this.serviceRequestService.getAll().subscribe({
            next: (res: ApiResponse<ServiceRequestResponse[]>) => {
                this.allRequests = res.data || [];
                this.filterByMonth();
                this.isLoading = false;
                setTimeout(() => this.renderCharts(), 100);
            },
            error: () => this.isLoading = false
        });
    }

    filterByMonth(): void {
        if (!this.selectedMonth) {
            this.requests = this.allRequests.filter(r =>
                r.status === 'COMPLETED' || r.status === 'CLOSED'
            );
        } else {
            this.requests = this.allRequests.filter(r => {
                if (r.status !== 'COMPLETED' && r.status !== 'CLOSED') return false;
                if (!r.completedAt) return false;
                const d = new Date(r.completedAt);
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                return monthKey === this.selectedMonth;
            });
        }
        if (this.chartsReady) {
            setTimeout(() => this.renderCharts(), 100);
        }
    }

    loadStats(): void {
        this.serviceRequestService.getStats().subscribe({
            next: (res: ApiResponse<DashboardStats>) => {
                this.stats = res.data || this.stats;
            }
        });
    }

    renderCharts(): void {
        this.renderServiceChart();
        this.renderTechChart();
    }

    renderServiceChart(): void {
        if (!this.serviceChartRef) return;
        if (this.serviceChart) this.serviceChart.destroy();

        const breakdown = this.serviceTypeBreakdown;
        this.serviceChart = new Chart(this.serviceChartRef.nativeElement, {
            type: 'pie',
            data: {
                labels: breakdown.map(b => b.type),
                datasets: [{
                    data: breakdown.map(b => b.revenue),
                    backgroundColor: ['#1a365d', '#2d4a6f', '#3d5a80', '#4a6fa5', '#5b8cb8', '#6ca0cc'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12 } }
                }
            }
        });
    }

    renderTechChart(): void {
        if (!this.techChartRef) return;
        if (this.techChart) this.techChart.destroy();

        const perf = this.technicianPerformance;
        this.techChart = new Chart(this.techChartRef.nativeElement, {
            type: 'bar',
            data: {
                labels: perf.map(t => t.name),
                datasets: [{
                    label: 'Jobs Completed',
                    data: perf.map(t => t.jobs),
                    backgroundColor: '#1a365d',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    get totalRevenue(): number {
        return this.requests.reduce((sum, r) => sum + (r.finalCost || 0), 0);
    }

    get todayRevenue(): number {
        const today = new Date().toDateString();
        return this.allRequests
            .filter(r => r.completedAt && new Date(r.completedAt).toDateString() === today)
            .reduce((sum, r) => sum + (r.finalCost || 0), 0);
    }

    get yesterdayRevenue(): number {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        return this.allRequests
            .filter(r => r.completedAt && new Date(r.completedAt).toDateString() === yesterdayStr)
            .reduce((sum, r) => sum + (r.finalCost || 0), 0);
    }

    get completedCount(): number {
        return this.requests.length;
    }

    // This now uses filtered requests - changes with month filter
    get closedInPeriod(): number {
        return this.requests.length;
    }

    get pendingCount(): number {
        return this.allRequests.filter(r => r.status === 'PENDING').length;
    }

    get customerCount(): number {
        const uniqueCustomers = new Set(this.allRequests.map(r => r.customerId));
        return uniqueCustomers.size;
    }

    get technicianPerformance(): { id: number; name: string; jobs: number; revenue: number }[] {
        const perf: { [key: number]: { name: string; jobs: number; revenue: number } } = {};
        this.requests.forEach(r => {
            if (r.technicianId) {
                if (!perf[r.technicianId]) {
                    perf[r.technicianId] = { name: r.technicianName || `Tech #${r.technicianId}`, jobs: 0, revenue: 0 };
                }
                perf[r.technicianId].jobs++;
                perf[r.technicianId].revenue += (r.finalCost || 0);
            }
        });
        return Object.entries(perf).map(([id, data]) => ({
            id: +id,
            name: data.name,
            jobs: data.jobs,
            revenue: data.revenue
        })).sort((a, b) => b.jobs - a.jobs);
    }

    get serviceTypeBreakdown(): { type: string; count: number; revenue: number }[] {
        const breakdown: { [key: string]: { count: number; revenue: number } } = {};
        this.requests.forEach(r => {
            const type = r.serviceType.replace('_', ' ');
            if (!breakdown[type]) {
                breakdown[type] = { count: 0, revenue: 0 };
            }
            breakdown[type].count++;
            breakdown[type].revenue += (r.finalCost || 0);
        });
        return Object.entries(breakdown).map(([type, data]) => ({
            type,
            count: data.count,
            revenue: data.revenue
        })).sort((a, b) => b.revenue - a.revenue);
    }

    get vehicleHistory(): { plate: string; vehicleId: number; services: number; totalSpent: number }[] {
        const history: { [key: number]: { plate: string; services: number; totalSpent: number } } = {};
        this.requests.forEach(r => {
            if (!history[r.vehicleId]) {
                history[r.vehicleId] = { plate: r.vehiclePlate || `Vehicle #${r.vehicleId}`, services: 0, totalSpent: 0 };
            }
            history[r.vehicleId].services++;
            history[r.vehicleId].totalSpent += (r.finalCost || 0);
        });
        return Object.entries(history).map(([id, data]) => ({
            vehicleId: +id,
            plate: data.plate,
            services: data.services,
            totalSpent: data.totalSpent
        })).sort((a, b) => b.services - a.services);
    }
}
