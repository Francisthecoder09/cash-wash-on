package com.carwash.ops.service;

import com.carwash.ops.dto.dashboard.DashboardSummaryResponse;
import java.math.BigDecimal;
import java.util.Map;

public interface DashboardService {
    DashboardSummaryResponse getSummary(Long branchId);

    // New Analytics Endpoints
    BigDecimal getTodayRevenue(Long branchId);
    
    long getActiveSessionsCount(Long branchId);
    
    Map<String, Long> getSessionStatusBreakdown(Long branchId);
    
    Map<String, Long> getPopularServicesBreakdown(Long branchId);
}
