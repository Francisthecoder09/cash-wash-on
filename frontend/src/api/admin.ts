import { api } from './client';
import { AdminDashboard, Branch, BranchStats, DailyVehicleCount, Lane, Staff, User, CreateBranchRequest, CreateLaneRequest, CreateUserRequest, CreateStaffRequest } from '../types';

// Branch APIs
export const branchApi = {
    getAll: () => api.get<Branch[]>('/admin/branches'),
    getById: (id: number) => api.get<Branch>(`/admin/branches/${id}`),
    create: (data: CreateBranchRequest) => api.post<Branch>('/admin/branches', data),
    update: (id: number, data: CreateBranchRequest) => api.post<Branch>(`/admin/branches/${id}`, data),
    delete: (id: number) => api.post<void>(`/admin/branches/${id}`),
};

// Lane APIs
export const laneApi = {
    getAll: () => api.get<Lane[]>('/admin/lanes'),
    getByBranch: (branchId: number) => api.get<Lane[]>(`/admin/branches/${branchId}/lanes`),
    create: (data: CreateLaneRequest) => api.post<Lane>('/admin/lanes', data),
    update: (id: number, data: CreateLaneRequest) => api.post<Lane>(`/admin/lanes/${id}`, data),
    delete: (id: number) => api.post<void>(`/admin/lanes/${id}`),
};

// User APIs
export const userApi = {
    getAll: () => api.get<User[]>('/admin/users'),
    getByBranch: (branchId: number) => api.get<User[]>(`/admin/users?branchId=${branchId}`),
    create: (data: CreateUserRequest) => api.post<User>('/admin/users', data),
    deactivate: (id: number) => api.delete<void>(`/admin/users/${id}`),
};

// Staff APIs
export const staffApi = {
    getByBranch: (branchId: number) => {
        console.log('staffApi.getByBranch called with branchId:', branchId, 'type:', typeof branchId);
        // Validate branchId before making API call
        if (branchId === undefined || branchId === null || branchId <= 0) {
            console.log('staffApi.getByBranch: Invalid branchId, returning empty array');
            return Promise.resolve([]);
        }
        const result = api.get<Staff[]>(`/admin/branches/${branchId}/staff`);
        console.log('staffApi.getByBranch result:', result);
        return result;
    },
    create: (data: CreateStaffRequest) => api.post<Staff>('/admin/staff', data),
};

// Dashboard API
export const dashboardApi = {
    getAdminDashboard: () => api.get<AdminDashboard>('/admin/dashboard'),
    getSummary: (branchId: number) => api.get<any>(`/dashboard/summary?branchId=${branchId}`),
    getTodayRevenue: (branchId: number) => api.get<number>(`/dashboard/revenue/today?branchId=${branchId}`),
    getActiveSessionsCount: (branchId: number) => api.get<number>(`/dashboard/active-sessions/count?branchId=${branchId}`),
    getSessionStatusBreakdown: (branchId: number) => api.get<Record<string, number>>(`/dashboard/status-breakdown?branchId=${branchId}`),
    getPopularServicesBreakdown: (branchId: number) => api.get<Record<string, number>>(`/dashboard/services-breakdown?branchId=${branchId}`)
};

// Services API
export const servicesApi = {
  getAll: (activeOnly: boolean = false) => api.get<any[]>(`/admin/services?activeOnly=${activeOnly}`),
  create: (data: any) => api.post<any>('/admin/services', data),
  update: (id: number, data: any) => api.put<any>(`/admin/services/${id}`, data),
  delete: (id: number) => api.delete<void>(`/admin/services/${id}`),

  getPricing: (serviceId: number) => api.get<any[]>(`/admin/services/${serviceId}/pricing`),
  getAllPricing: (activeOnly: boolean = false) => api.get<any[]>(`/admin/pricing?activeOnly=${activeOnly}`),
  createPricing: (data: any) => api.post<any>('/admin/pricing', data),
  updatePricing: (id: number, data: any) => api.put<any>(`/admin/pricing/${id}`, data),
  deletePricing: (id: number) => api.delete<void>(`/admin/pricing/${id}`),
};

export const customerApi = {
    getAll: () => api.get<any[]>('/admin/customers'),
};

export const sessionApi = {
    pay: (id: number) => api.post<any>(`/sessions/${id}/pay`),
};


