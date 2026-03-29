export type Role = 'ADMIN' | 'BRANCH_MANAGER' | 'CASHIER' | 'LANE_OPERATOR' | 'INSPECTOR' | 'AUDITOR';

export type SessionStatus = 'REGISTERED' | 'EXPIRED' | 'WASHING' | 'INTERIOR' | 'INSPECTION' | 'COMPLETED';

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
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
  customerEmail?: string;
  vehicleType: string;
  vehicleImageUrl?: string;
  servicePackage: string;
  addOnServices?: string[];
  status: SessionStatus;
  delayReason?: string;
  price?: number;
  paid?: boolean;
  portalToken?: string;
  branchId: number;
  branchName: string;
  laneId?: number;
  laneName?: string;
  cashierUserId: number;
  operatorStaffId?: number;
  operatorName?: string;
  appointmentAt?: string;
  registeredAt: string;
  washingStartedAt?: string;
  interiorStartedAt?: string;
  inspectionStartedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  latestPayment?: SessionPaymentRecord;
  paymentHistory?: SessionPaymentRecord[];
  customerProfile?: {
    totalVisits: number;
    loyaltyPoints: number;
    loyaltyTier: string;
    lastVehicleRegistration?: string;
  };
  recentSessions?: {
    sessionId: number;
    registrationNumber: string;
    vehicleType?: string;
    servicePackage: string;
    addOnServices?: string[];
    branchName?: string;
    status: SessionStatus;
    price?: number;
    paid?: boolean;
    appointmentAt?: string;
    completedAt?: string;
    createdAt: string;
  }[];
  savedVehicles?: {
    registrationNumber: string;
    vehicleType?: string;
    preferredServicePackage?: string;
    preferredAddOnServices?: string[];
    lastBranchName?: string;
    lastSeenAt?: string;
    totalSessions: number;
  }[];
  notifications?: {
    title: string;
    body: string;
    tone: string;
    occurredAt?: string;
  }[];
}

export interface SessionMessage {
  id: number;
  sessionId: number;
  senderType: 'CUSTOMER' | 'STAFF';
  senderName: string;
  message: string;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'CARD' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface SessionPaymentRecord {
  id: number;
  sessionId: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  referenceNumber?: string;
  paymentNotes?: string;
  processedByUserId?: number;
  processedByName?: string;
  paidAt: string;
  createdAt: string;
}

export interface SessionMessageEvent {
  sessionId: number;
  message: SessionMessage;
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
    price?: number;
    paid?: boolean;
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
  staffId?: number;
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
  staffId: number;
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

export interface ServiceType {
  id: number;
  serviceName: string;
  description?: string;
  basePrice: number;
  durationMinutes: number;
  category: string;
  isFeatured: boolean;
  active: boolean;
  branchId?: number;
  branchName?: string;
}

export interface Pricing {
  id: number;
  serviceTypeId: number;
  serviceName: string;
  vehicleCategory: string;
  price: number;
  discountPercentage?: number;
  active: boolean;
}

export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  totalVisits: number;
  loyaltyPoints: number;
  lastVehicleRegistration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAccount {
  id: number;
  fullName: string;
  username: string;
  phone?: string;
  email: string;
  totalVisits: number;
  loyaltyPoints: number;
  activePortalToken?: string | null;
}

export interface CustomerDashboard {
  id: number;
  fullName: string;
  username: string;
  phone?: string;
  email?: string;
  totalVisits: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  activeSession?: {
    sessionId: number;
    portalToken?: string;
    registrationNumber: string;
    vehicleType?: string;
    servicePackage: string;
    addOnServices?: string[];
    branchName?: string;
    status: SessionStatus;
    price?: number;
    paid?: boolean;
    appointmentAt?: string;
    registeredAt?: string;
    updatedAt?: string;
  } | null;
  upcomingSession?: {
    sessionId: number;
    portalToken?: string;
    registrationNumber: string;
    vehicleType?: string;
    servicePackage: string;
    addOnServices?: string[];
    branchName?: string;
    status: SessionStatus;
    price?: number;
    paid?: boolean;
    appointmentAt?: string;
    registeredAt?: string;
    updatedAt?: string;
  } | null;
  savedVehicles: {
    registrationNumber: string;
    vehicleType?: string;
    preferredServicePackage?: string;
    preferredAddOnServices?: string[];
    lastBranchName?: string;
    lastSeenAt?: string;
    totalSessions: number;
  }[];
  recentSessions: {
    sessionId: number;
    portalToken?: string;
    registrationNumber: string;
    vehicleType?: string;
    servicePackage: string;
    addOnServices?: string[];
    branchName?: string;
    status: SessionStatus;
    price?: number;
    paid?: boolean;
    appointmentAt?: string;
    completedAt?: string;
    createdAt: string;
  }[];
  notifications: {
    title: string;
    body: string;
    tone: string;
    occurredAt?: string;
  }[];
}
