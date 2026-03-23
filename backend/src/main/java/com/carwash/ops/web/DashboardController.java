package com.carwash.ops.web;

import com.carwash.ops.dto.dashboard.DashboardSummaryResponse;
import com.carwash.ops.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // READ — AUDITOR can view the dashboard summary
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR','INSPECTOR','AUDITOR')")
    public DashboardSummaryResponse summary(@RequestParam Long branchId) {
        return dashboardService.getSummary(branchId);
    }
}
