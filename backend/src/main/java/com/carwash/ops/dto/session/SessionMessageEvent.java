package com.carwash.ops.dto.session;

public record SessionMessageEvent(
        Long sessionId,
        SessionMessageResponse message
) {
}
