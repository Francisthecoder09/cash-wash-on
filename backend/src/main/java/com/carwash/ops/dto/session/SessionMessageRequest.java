package com.carwash.ops.dto.session;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SessionMessageRequest(
        @NotBlank(message = "Message is required")
        @Size(max = 1200, message = "Message must be 1200 characters or fewer")
        String message
) {
}
