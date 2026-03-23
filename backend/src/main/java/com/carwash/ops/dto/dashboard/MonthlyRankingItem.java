package com.carwash.ops.dto.dashboard;

public record MonthlyRankingItem(
        Long laneId,
        String laneName,
        String branchName,
        long vehiclesCompleted,
        double averageMinutes,
        double combinedScore
) {
}
