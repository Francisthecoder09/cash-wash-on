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
import java.util.Map;
import java.math.BigDecimal;
import java.util.stream.Collectors;
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
                if (branchId == null) {
                        return new DashboardSummaryResponse(0L, 0L, 0L, List.of(), List.of());
                }

                // Pre-load sessions once to avoid repeated queries
                var completedSessions = vehicleSessionRepository.findFiltered(branchId, SessionStatus.COMPLETED);
                var allSessions = vehicleSessionRepository.findFiltered(branchId, null);

                List<LaneLeaderboardItem> leaderboard = laneRepository.findByBranch_IdOrderByDisplayOrderAsc(branchId)
                                .stream()
                                .map(lane -> {
                                        var sessions = completedSessions.stream()
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
                                        // Use getBranchName() to avoid navigating the lazy-loaded Branch proxy
                                        String branchName = lane.getBranchName();
                                        return new LaneLeaderboardItem(lane.getId(), lane.getLaneName(),
                                                        branchName != null ? branchName : "", sessions.size(), avg);
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

                long delayedSessions = allSessions.stream()
                                .filter(session -> session.getStatus() != SessionStatus.COMPLETED)
                                .filter(session -> session.getRegisteredAt() != null
                                                && Duration.between(session.getRegisteredAt(), Instant.now())
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

        @Override
        public BigDecimal getTodayRevenue(Long branchId) {
                if (branchId == null) return BigDecimal.ZERO;
                LocalDate today = LocalDate.now(ZoneOffset.UTC);
                
                var sessions = vehicleSessionRepository.findFiltered(branchId, SessionStatus.COMPLETED);
                
                return sessions.stream()
                        .filter(s -> s.getCompletedAt() != null)
                        .filter(s -> LocalDate.ofInstant(s.getCompletedAt(), ZoneOffset.UTC).equals(today))
                        .filter(s -> Boolean.TRUE.equals(s.getPaid()))
                        .map(s -> s.getPrice() != null ? BigDecimal.valueOf(s.getPrice()) : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        @Override
        public long getActiveSessionsCount(Long branchId) {
                if (branchId == null) return 0;
                var allSessions = vehicleSessionRepository.findFiltered(branchId, null);
                return allSessions.stream()
                        .filter(s -> s.getStatus() != SessionStatus.COMPLETED)
                        .count();
        }

        @Override
        public Map<String, Long> getSessionStatusBreakdown(Long branchId) {
                if (branchId == null) return Map.of();
                LocalDate today = LocalDate.now(ZoneOffset.UTC);
                
                var allSessions = vehicleSessionRepository.findFiltered(branchId, null);
                
                return allSessions.stream()
                        .filter(s -> s.getRegisteredAt() != null)
                        .filter(s -> LocalDate.ofInstant(s.getRegisteredAt(), ZoneOffset.UTC).equals(today) || 
                                     (s.getStatus() != SessionStatus.COMPLETED))
                        .collect(Collectors.groupingBy(
                                s -> s.getStatus() != null ? s.getStatus().name() : "UNKNOWN",
                                Collectors.counting()
                        ));
        }

        @Override
        public Map<String, Long> getPopularServicesBreakdown(Long branchId) {
                if (branchId == null) return Map.of();
                LocalDate today = LocalDate.now(ZoneOffset.UTC);
                
                var allSessions = vehicleSessionRepository.findFiltered(branchId, null);
                
                return allSessions.stream()
                        .filter(s -> s.getRegisteredAt() != null)
                        .filter(s -> LocalDate.ofInstant(s.getRegisteredAt(), ZoneOffset.UTC).equals(today))
                        .filter(s -> s.getServicePackage() != null)
                        .collect(Collectors.groupingBy(
                                s -> s.getServicePackage(),
                                Collectors.counting()
                        ));
        }
}
