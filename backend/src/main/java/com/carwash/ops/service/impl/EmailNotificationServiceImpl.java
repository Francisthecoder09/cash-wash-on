package com.carwash.ops.service.impl;

import com.carwash.ops.domain.entity.VehicleSession;
import com.carwash.ops.service.NotificationService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationServiceImpl implements NotificationService {

    private final JavaMailSender emailSender;

    @Value("${app.mail.from:noreply@carwash.com}")
    private String fromEmail;

    @Value("${app.mail.mock-enabled:true}")
    private boolean mockEnabled;

    @Override
    public void sendBookingConfirmation(VehicleSession session) {
        String email = getCustomerEmail(session);
        if (email == null) return;
        
        String subject = "Wash Booking Confirmed - " + session.getRegistrationNumber();
        String portalUrl = "http://localhost:5173/portal/" + session.getPortalToken();
        
        String html = String.format(
            "<h1>Booking Confirmed</h1>" +
            "<p>Hi %s,</p>" +
            "<p>Your vehicle (%s) is confirmed at %s.</p>" +
            "<br/>" +
            "<a href=\"%s\" style=\"padding:10px 20px;background:#38bdf8;color:#fff;text-decoration:none;border-radius:5px;\">Track Your Wash Live</a>",
            session.getCustomer().getFullName(),
            session.getRegistrationNumber(),
            session.getBranch().getName(),
            portalUrl
        );
        sendHtmlEmail(email, subject, html);
    }

    @Override
    public void sendSessionComplete(VehicleSession session) {
        String email = getCustomerEmail(session);
        if (email == null) return;

        String subject = "Your Wash is Complete! - " + session.getRegistrationNumber();
        String portalUrl = "http://localhost:5173/portal/" + session.getPortalToken();
        
        String html = String.format(
            "<h1>Wash Completed</h1>" +
            "<p>Your vehicle is ready. Sign off and pay securely via your portal.</p>" +
            "<br/>" +
            "<a href=\"%s\" style=\"padding:10px 20px;background:#22c55e;color:#fff;text-decoration:none;border-radius:5px;\">View Receipt & Sign</a>",
            portalUrl
        );
        sendHtmlEmail(email, subject, html);
    }

    @Override
    public void sendSessionPaymentReceipt(VehicleSession session) {
        String email = getCustomerEmail(session);
        if (email == null) return;

        String subject = "Payment Receipt - " + session.getRegistrationNumber();
        
        String html = String.format(
            "<h1>Payment Successful</h1>" +
            "<p>Thank you for your payment of $%.2f.</p>" +
            "<p>We hope to see you again soon!</p>",
            session.getPrice()
        );
        sendHtmlEmail(email, subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = isHtml
            
            if (mockEnabled) {
                log.info("\n[EMAIL MOCK] To: {}\nSubject: {}\nContent: {}\n", to, subject, htmlContent);
                return;
            }

            emailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to construct HTML email for {}", to, e);
        } catch (MailException e) {
            log.error("SMTP email delivery failed for {}", to, e);
        } catch (Exception e) {
            log.error("Unexpected email delivery failure for {}", to, e);
        }
    }

    private String getCustomerEmail(VehicleSession session) {
        return Optional.ofNullable(session.getCustomer())
                .map(c -> c.getEmail())
                .filter(e -> e.contains("@"))
                .orElse(null);
    }
}
