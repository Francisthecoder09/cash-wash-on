package com.carwash.ops.service.impl;

import com.carwash.ops.domain.enums.SessionStatus;
import com.carwash.ops.dto.dashboard.DashboardSummaryResponse;
import com.carwash.ops.dto.dashboard.LaneLeaderboardItem;
import com.carwash.ops.dto.dashboard.MonthlyRankingItem;
import com.carwash.ops.repository.LaneRepository;
import com.carwash.ops.repository.VehicleSessionRepository;
import com.carwash.ops.service.DashboardService;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

        private final VehicleSessionRepository vehicleSessionRepository;
        private final LaneRepository laneRepository;

        public DashboardServiceImpl(
                        VehicleSessionRepository vehicleSessionRepository,
                        LaneRepository laneRepository) {
                this.vehicleSessionRepository = vehicleSessionRepository;
                this.laneRepository = laneRepository;
        }

        @Override
        public DashboardSummaryResponse getSummary(Long branchId) {
                List<LaneLeaderboardItem> leaderboard = laneRepository.findByBranch_IdOrderByDisplayOrderAsc(branchId)
                                .stream()
                                .map(lane -> {
                                        var sessions = vehicleSessionRepository
                                                        .findFiltered(branchId, SessionStatus.COMPLETED).stream()
                                                        .filter(session -> session.getLane() != null && session
                                                                        .getLane().getId().equals(lane.getId()))
                                                        .filter(session -> session.getCompletedAt() != null
                                                                        && session.getWashingStartedAt() != null)
                                                        .toList();
                                        double avg = sessions.isEmpty() ? 0.0
                                                        : sessions.stream()
                                                                        .mapToLong(session -> Duration.between(
                                                                                        session.getWashingStartedAt(),
                                                                                        session.getCompletedAt())
                                                                                        .toMinutes())
                                                                        .average().orElse(0.0);
                                        return new LaneLeaderboardItem(lane.getId(), lane.getLaneName(),
                                                        lane.getBranch().getName(), sessions.size(), avg);
                                })
                                .sorted(Comparator.comparingDouble(LaneLeaderboardItem::averageMinutes))
                                .toList();

                long maxVehicles = leaderboard.stream().mapToLong(LaneLeaderboardItem::completedVehicles).max()
                                .orElse(1L);
                double bestAvg = leaderboard.stream()
                                .filter(item -> item.averageMinutes() > 0)
                                .mapToDouble(LaneLeaderboardItem::averageMinutes)
                                .min().orElse(1.0);

                List<MonthlyRankingItem> ranking = leaderboard.stream()
                                .map(item -> {
                                        double completionScore = maxVehicles == 0 ? 0
                                                        : (double) item.completedVehicles() / maxVehicles;
                                        double speedScore = item.averageMinutes() == 0 ? 0
                                                        : bestAvg / item.averageMinutes();
                                        double combinedScore = (0.6 * completionScore) + (0.4 * speedScore);
                                        return new MonthlyRankingItem(item.laneId(), item.laneName(), item.branchName(),
                                                        item.completedVehicles(), item.averageMinutes(), combinedScore);
                                })
                                .sorted(Comparator.comparingDouble(MonthlyRankingItem::combinedScore).reversed())
                                .toList();

                LocalDate today = LocalDate.now(ZoneOffset.UTC);
                long vehiclesToday = vehicleSessionRepository.countDailyCompleted(
                                branchId,
                                today.atStartOfDay().toInstant(ZoneOffset.UTC),
                                today.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC));
                long delayedSessions = vehicleSessionRepository.findFiltered(branchId, null).stream()
                                .filter(session -> session.getStatus() != SessionStatus.COMPLETED)
                                .filter(session -> Duration.between(session.getRegisteredAt(), Instant.now())
                                                .toMinutes() > 45)
                                .count();

                return new DashboardSummaryResponse(
                                vehiclesToday,
                                laneRepository.findByBranch_IdOrderByDisplayOrderAsc(branchId).stream()
                                                .filter(lane -> lane.isActive()).count(),
                                delayedSessions,
                                leaderboard,
                                ranking);
        }
}
