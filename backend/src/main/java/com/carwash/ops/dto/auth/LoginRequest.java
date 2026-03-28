package com.carwash.ops.dto.auth;

import com.carwash.ops.domain.enums.RoleName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginRequest(
                @NotBlank String email,
                @NotBlank String pin,
                RoleName role) {
}
