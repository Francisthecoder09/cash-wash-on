package com.carwash.ops.dto.session;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record MatsTrackingRequest(
        @Min(0) int matsRemoved,
        @Min(0) int matsReinstalled,
        @Size(max = 255) String conditionNotes
) {
}
