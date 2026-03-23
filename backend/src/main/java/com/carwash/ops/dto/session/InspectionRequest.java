package com.carwash.ops.dto.session;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InspectionRequest(
        @NotNull Long inspectorStaffId,
        boolean bodyCheckPassed,
        boolean interiorCheckPassed,
        @Size(max = 255) String notes
) {
}
