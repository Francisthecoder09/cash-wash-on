package com.carwash.ops.dto.session;

import com.carwash.ops.domain.enums.PaymentMethod;
import com.carwash.ops.domain.enums.PaymentStatus;
import java.time.Instant;

public record SessionPaymentResponse(
        Long id,
        Long sessionId,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        Double amount,
        String referenceNumber,
        String paymentNotes,
        Long processedByUserId,
        String processedByName,
        Instant paidAt,
        Instant createdAt
) {
}
