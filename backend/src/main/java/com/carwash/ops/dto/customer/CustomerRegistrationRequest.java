package com.carwash.ops.dto.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRegistrationRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Size(max = 60) String username,
        @NotBlank @Size(max = 30) String phone,
        @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 4, max = 12) String pin
) {
}
