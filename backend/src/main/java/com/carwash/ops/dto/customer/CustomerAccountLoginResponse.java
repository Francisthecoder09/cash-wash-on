package com.carwash.ops.dto.customer;

public record CustomerAccountLoginResponse(
        Long id,
        String fullName,
        String username,
        String phone,
        String email,
        Integer totalVisits,
        Integer loyaltyPoints,
        String activePortalToken
) {
}
