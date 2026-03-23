package com.carwash.ops.dto.session;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateVehicleSessionRequest(
        @NotNull Long branchId,
        Long laneId,
        @NotBlank @Size(max = 25) String registrationNumber,
        @NotBlank @Size(max = 120) String customerName,
        @Size(max = 30) String customerPhone,
        @NotBlank @Size(max = 50) String vehicleType,
        @NotBlank @Size(max = 80) String servicePackage,
        @Size(max = 80) String sourceRequestId
) {
}
