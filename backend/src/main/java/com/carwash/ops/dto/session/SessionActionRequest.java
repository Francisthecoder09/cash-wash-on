package com.carwash.ops.dto.session;

import jakarta.validation.constraints.Size;

public record SessionActionRequest(
        Long laneId,
        Long operatorStaffId,
        @Size(max = 255) String delayReason
) {
}
