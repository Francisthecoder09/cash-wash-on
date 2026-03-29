package com.carwash.ops.dto.customer;

import com.carwash.ops.domain.enums.SessionStatus;
import java.time.Instant;
import java.util.List;

public record CustomerDashboardResponse(
        Long id,
        String fullName,
        String username,
        String phone,
        String email,
        Integer totalVisits,
        Integer loyaltyPoints,
        String loyaltyTier,
        DashboardSessionCard activeSession,
        DashboardSessionCard upcomingSession,
        List<SavedVehicleCard> savedVehicles,
        List<RecentSessionCard> recentSessions,
        List<DashboardNotification> notifications
) {
    public record DashboardSessionCard(
            Long sessionId,
            String portalToken,
            String registrationNumber,
            String vehicleType,
            String servicePackage,
            List<String> addOnServices,
            String branchName,
            SessionStatus status,
            Double price,
            Boolean paid,
            Instant appointmentAt,
            Instant registeredAt,
            Instant updatedAt
    ) {
    }

    public record SavedVehicleCard(
            String registrationNumber,
            String vehicleType,
            String preferredServicePackage,
            List<String> preferredAddOnServices,
            String lastBranchName,
            Instant lastSeenAt,
            Integer totalSessions
    ) {
    }

    public record RecentSessionCard(
            Long sessionId,
            String portalToken,
            String registrationNumber,
            String vehicleType,
            String servicePackage,
            List<String> addOnServices,
            String branchName,
            SessionStatus status,
            Double price,
            Boolean paid,
            Instant appointmentAt,
            Instant completedAt,
            Instant createdAt
    ) {
    }

    public record DashboardNotification(
            String title,
            String body,
            String tone,
            Instant occurredAt
    ) {
    }
}
