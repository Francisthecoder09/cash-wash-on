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
    deactivate: (id: number) => api.post<void>(`/admin/users/${id}`),
};

// Staff APIs
export const staffApi = {
    getByBranch: (branchId: number) => api.get<Staff[]>(`/admin/branches/${branchId}/staff`),
    create: (data: CreateStaffRequest) => api.post<Staff>('/admin/staff', data),
};

// Dashboard API
export const dashboardApi = {
    getAdminDashboard: () => api.get<AdminDashboard>('/admin/dashboard'),
};
