package com.carwash.ops.dto.session;

import java.time.Instant;

public record VehicleSessionDetailResponse(
        Long sessionId,
        String branchName,
        String laneName,
        String operatorName,
        String servicePackage,
        String status,
        Instant registeredAt,
        Instant completedAt,
        MatsTrackingView matsTracking,
        SignatureView signature,
        InspectionView inspection
) {
    public record MatsTrackingView(int matsRemoved, int matsReinstalled, String conditionNotes) {}
    public record SignatureView(String signedBy, Instant signedAt) {}
    public record InspectionView(boolean bodyCheckPassed, boolean interiorCheckPassed, String notes, Instant inspectedAt) {}
}
