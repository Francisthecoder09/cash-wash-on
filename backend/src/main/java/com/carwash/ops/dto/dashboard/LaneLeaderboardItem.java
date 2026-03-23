package com.carwash.ops.dto.dashboard;

public record LaneLeaderboardItem(
        Long laneId,
        String laneName,
        String branchName,
        long completedVehicles,
        double averageMinutes
) {
}
