package com.carwash.ops.service.impl;

import com.carwash.ops.domain.entity.CustomerOtpEntity;
import com.carwash.ops.repository.CustomerOtpRepository;
import com.carwash.ops.service.OtpService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final CustomerOtpRepository otpRepository;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.mail.from:noreply@carwash.com}")
    private String fromEmail;

    @Value("${app.mail.mock-enabled:true}")
    private boolean mockEnabled;

    @Override
    @Transactional
    public String generateAndSendOtp(String email) {
        String code = generate4DigitCode();
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        
        CustomerOtpEntity otp = CustomerOtpEntity.builder()
                .email(normalizedEmail)
                .otpCode(code)
                .expiresAt(Instant.now().plus(10, ChronoUnit.MINUTES))
                .build();
                
        otpRepository.save(otp);
        
        sendOtpEmail(normalizedEmail, code);
            
        return code;
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String code) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        CustomerOtpEntity validOtp = otpRepository.findFirstByEmailAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                normalizedEmail, Instant.now()).orElse(null);

        if (validOtp != null && validOtp.getOtpCode().equals(code)) {
            validOtp.setIsUsed(true);
            otpRepository.save(validOtp);
            return true;
        }
        
        return false;
    }

    private String generate4DigitCode() {
        int num = 1000 + secureRandom.nextInt(9000);
        return String.valueOf(num);
    }

    private void sendOtpEmail(String email, String code) {
        String subject = "Your RinseFlow Portal Login Code";
        String html = String.format(
                "<h2>RinseFlow Portal Login</h2>" +
                "<p>Your one-time login code is:</p>" +
                "<p style=\"font-size:28px;font-weight:700;letter-spacing:4px;\">%s</p>" +
                "<p>This code expires in 10 minutes.</p>",
                code);

        if (mockEnabled) {
            log.info("\n[EMAIL MOCK] To: {}\nSubject: {}\nMessage: Your RinseFlow Portal Login Code is: {}\nThis code expires in 10 minutes.\n",
                    email, subject, code);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("OTP email sent to {}", email);
        } catch (MailException | jakarta.mail.MessagingException e) {
            log.error("Failed to send OTP email to {}", email, e);
            throw e instanceof RuntimeException runtime ? runtime : new IllegalStateException("OTP email delivery failed", e);
        }
    }
}
