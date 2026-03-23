package com.carwash.ops.dto.auth;

import com.carwash.ops.domain.enums.RoleName;

public record AuthResponse(
        String token,
        Long userId,
        String username,
        RoleName role,
        Long branchId,
        Long staffId
) {
}
