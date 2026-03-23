package com.carwash.ops.dto.session;

import com.carwash.ops.domain.enums.SessionStatus;
import java.time.Instant;

public record VehicleSessionResponse(
        Long id,
        String registrationNumber,
        String customerName,
        String customerPhone,
        String vehicleType,
        String servicePackage,
        SessionStatus status,
        String delayReason,
        Long branchId,
        String branchName,
        Long laneId,
        String laneName,
        Long cashierUserId,
        Long operatorStaffId,
        String operatorName,
        Instant registeredAt,
        Instant washingStartedAt,
        Instant interiorStartedAt,
        Instant inspectionStartedAt,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt
) {
}
