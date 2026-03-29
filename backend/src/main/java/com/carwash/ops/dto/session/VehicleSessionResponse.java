package com.carwash.ops.dto.session;

import com.carwash.ops.domain.enums.SessionStatus;
import java.time.Instant;
import java.util.List;

public record VehicleSessionResponse(
        Long id,
        String registrationNumber,
        String customerName,
        String customerPhone,
        String customerEmail,
        String vehicleType,
        String vehicleImageUrl,
        String servicePackage,
        List<String> addOnServices,
        SessionStatus status,
        String delayReason,
        Double price,
        Boolean paid,
        String portalToken,
        Long branchId,
        String branchName,
        Long laneId,
        String laneName,
        Long cashierUserId,
        Long operatorStaffId,
        String operatorName,
        Instant appointmentAt,
        Instant registeredAt,
        Instant washingStartedAt,
        Instant interiorStartedAt,
        Instant inspectionStartedAt,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt,
        SessionPaymentResponse latestPayment,
        List<SessionPaymentResponse> paymentHistory,
        CustomerProfileView customerProfile,
        List<CustomerHistoryItem> recentSessions,
        List<SavedVehicleView> savedVehicles,
        List<PortalNotificationItem> notifications
) {
    public record CustomerProfileView(
            Integer totalVisits,
            Integer loyaltyPoints,
            String loyaltyTier,
            String lastVehicleRegistration
    ) {
    }

    public record CustomerHistoryItem(
            Long sessionId,
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

    public record SavedVehicleView(
            String registrationNumber,
            String vehicleType,
            String preferredServicePackage,
            List<String> preferredAddOnServices,
            String lastBranchName,
            Instant lastSeenAt,
            Integer totalSessions
    ) {
    }

    public record PortalNotificationItem(
            String title,
            String body,
            String tone,
            Instant occurredAt
    ) {
    }
}
