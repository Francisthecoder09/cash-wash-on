package com.carwash.ops.dto.session;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignatureRequest(
        @NotBlank @Size(max = 120) String signedBy,
        @NotBlank String signatureDataUrl
) {
}
