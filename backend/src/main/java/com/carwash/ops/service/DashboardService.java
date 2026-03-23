package com.carwash.ops.service;

import com.carwash.ops.dto.dashboard.DashboardSummaryResponse;

public interface DashboardService {
    DashboardSummaryResponse getSummary(Long branchId);
}
