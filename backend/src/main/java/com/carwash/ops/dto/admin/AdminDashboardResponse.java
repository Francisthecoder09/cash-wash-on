package com.carwash.ops.dto.admin;

import java.util.List;

public record AdminDashboardResponse(
        long totalBranches,
        long activeBranches,
        long totalLanes,
        long activeLanes,
        long totalUsers,
        long totalStaff,
        long vehiclesToday,
        long vehiclesThisWeek,
        long vehiclesThisMonth,
        List<BranchStats> branchStats,
        List<DailyVehicleCount> dailyTrend) {
    public record BranchStats(
            Long branchId,
            String branchName,
            String location,
            long activeLanes,
            long vehiclesToday,
            long vehiclesThisWeek,
            double completionRate) {
    }

    public record DailyVehicleCount(
            String date,
            long count) {
    }
}
