export type Role = 'ADMIN' | 'BRANCH_MANAGER' | 'CASHIER' | 'LANE_OPERATOR' | 'INSPECTOR' | 'AUDITOR';

export type SessionStatus = 'REGISTERED' | 'WASHING' | 'INTERIOR' | 'INSPECTION' | 'COMPLETED';

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  role: Role;
  branchId: number;
  staffId: number;
}

export interface SelectOption {
  id: number;
  label: string;
}

export interface VehicleSession {
  id: number;
  registrationNumber: string;
  customerName: string;
  customerPhone?: string;
  vehicleType: string;
  servicePackage: string;
  status: SessionStatus;
  delayReason?: string;
  branchId: number;
  branchName: string;
  laneId?: number;
  laneName?: string;
  cashierUserId: number;
  operatorStaffId?: number;
  operatorName?: string;
  registeredAt: string;
  washingStartedAt?: string;
  interiorStartedAt?: string;
  inspectionStartedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  vehiclesToday: number;
  activeLanes: number;
  delayedSessions: number;
  laneLeaderboard: {
    laneId: number;
    laneName: string;
    branchName: string;
    completedVehicles: number;
    averageMinutes: number;
  }[];
  monthlyRanking: {
    laneId: number;
    laneName: string;
    branchName: string;
    vehiclesCompleted: number;
    averageMinutes: number;
    combinedScore: number;
  }[];
}

export interface VehicleHistory {
  registrationNumber: string;
  sessions: {
    sessionId: number;
    branchName: string;
    laneName?: string;
    operatorName?: string;
    servicePackage: string;
    status: SessionStatus;
    registeredAt: string;
    completedAt?: string;
    matsTracking?: {
      matsRemoved: number;
      matsReinstalled: number;
      conditionNotes?: string;
    };
    signature?: {
      signedBy: string;
      signedAt: string;
    };
    inspection?: {
      bodyCheckPassed: boolean;
      interiorCheckPassed: boolean;
      notes?: string;
      inspectedAt: string;
    };
  }[];
}

export interface RealtimeSessionEvent {
  type: string;
  session: VehicleSession;
}

export interface OfflineRequest {
  id?: number;
  url: string;
  method: 'POST';
  body: unknown;
  token: string;
  createdAt: string;
}

export interface Branch {
  id: number;
  name: string;
  location: string;
  timezone: string;
  active: boolean;
}

export interface Lane {
  id: number;
  branchId: number;
  branchName?: string;
  laneName: string;
  displayOrder: number;
  active: boolean;
}

export interface Staff {
  id: number;
  branchId: number;
  fullName: string;
  employeeCode: string;
  phone: string;
  active: boolean;
}

export interface User {
  id: number;
  username: string;
  role: Role;
  branchId: number;
  branchName?: string;
  staffId: number;
  staffName?: string;
  active: boolean;
}

export interface CreateBranchRequest {
  name: string;
  location: string;
  timezone?: string;
}

export interface CreateLaneRequest {
  laneName: string;
  branchId: number;
  displayOrder?: number;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: Role;
  branchId: number;
  staffId?: number;
}

export interface CreateStaffRequest {
  fullName: string;
  employeeCode: string;
  phone: string;
  branchId: number;
}

export interface AdminDashboard {
  totalBranches: number;
  activeBranches: number;
  totalLanes: number;
  activeLanes: number;
  totalUsers: number;
  totalStaff: number;
  vehiclesToday: number;
  vehiclesThisWeek: number;
  vehiclesThisMonth: number;
  branchStats: BranchStats[];
  dailyTrend: DailyVehicleCount[];
}

export interface BranchStats {
  branchId: number;
  branchName: string;
  location: string;
  activeLanes: number;
  vehiclesToday: number;
  vehiclesThisWeek: number;
  completionRate: number;
}

export interface DailyVehicleCount {
  date: string;
  count: number;
}
