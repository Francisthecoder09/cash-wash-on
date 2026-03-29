package com.carwash.ops.service;

import java.util.Optional;

public interface OtpService {
    
    /**
     * Generates a 4-digit OTP, saves it to the database, and returns the code.
     * In a real system, this would also trigger the SMS/Email notification.
     */
    String generateAndSendOtp(String email);

    /**
     * Verifies if the provided OTP code matches the latest unused OTP for the phone number.
     * Marks it as used if successful.
     */
    boolean verifyOtp(String email, String code);

    Optional<String> getLatestMockOtp(String email);
}
