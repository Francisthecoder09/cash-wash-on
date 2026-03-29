package com.carwash.ops.dto.session;

import com.carwash.ops.domain.enums.SessionMessageSenderType;
import java.time.Instant;

public record SessionMessageResponse(
        Long id,
        Long sessionId,
        SessionMessageSenderType senderType,
        String senderName,
        String message,
        Instant createdAt
) {
}
