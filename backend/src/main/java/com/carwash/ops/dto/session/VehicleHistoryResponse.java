package com.carwash.ops.dto.session;

import java.util.List;

public record VehicleHistoryResponse(
        String registrationNumber,
        List<VehicleSessionDetailResponse> sessions
) {
}
