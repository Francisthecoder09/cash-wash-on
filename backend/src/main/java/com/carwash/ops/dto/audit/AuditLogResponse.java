package com.carwash.ops.dto.audit;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        String action,
        String description,
        String metadataJson,
        Long userId,
        Long vehicleSessionId,
        Instant createdAt
) {}
