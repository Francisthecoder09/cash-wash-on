package com.carwash.ops.dto.dashboard;

import java.util.List;

public record DashboardSummaryResponse(
        long vehiclesToday,
        long activeLanes,
        long delayedSessions,
        List<LaneLeaderboardItem> laneLeaderboard,
        List<MonthlyRankingItem> monthlyRanking
) {
}
