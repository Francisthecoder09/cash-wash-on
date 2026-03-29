package com.carwash.ops.dto.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerAccountLoginRequest(
        @NotBlank @Size(max = 60) String username,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 4, max = 12) String pin
) {
}
