package com.carwash.ops.dto.session;

import com.carwash.ops.domain.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PaymentRequest(
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,
        @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than zero")
        Double amount,
        @Size(max = 120, message = "Reference number must be 120 characters or fewer")
        String referenceNumber,
        @Size(max = 500, message = "Payment notes must be 500 characters or fewer")
        String paymentNotes
) {
}
