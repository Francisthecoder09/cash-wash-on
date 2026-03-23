package com.carwash.ops.dto.session;

public record RealtimeSessionEvent(
        String type,
        VehicleSessionResponse session
) {
}
