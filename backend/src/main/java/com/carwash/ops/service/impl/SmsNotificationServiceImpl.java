package com.carwash.ops.service.impl;

import com.carwash.ops.domain.entity.VehicleSession;
import com.carwash.ops.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class SmsNotificationServiceImpl implements NotificationService {

    @Override
    public void sendBookingConfirmation(VehicleSession session) {
        String phone = getCustomerPhone(session);
        if (phone == null) return;

        String portalUrl = "http://localhost:5173/portal/" + session.getPortalToken();
        log.info("\n[SMS MOCK] To: {}\nMessage: RinseFlow Car Wash: Your session for {} is booked! Track it live here: {}\n", 
            phone, session.getRegistrationNumber(), portalUrl);
    }

    @Override
    public void sendSessionComplete(VehicleSession session) {
        String phone = getCustomerPhone(session);
        if (phone == null) return;

        String portalUrl = "http://localhost:5173/portal/" + session.getPortalToken();
        log.info("\n[SMS MOCK] To: {}\nMessage: RinseFlow Car Wash: Your vehicle {} is ready! Review & sign here: {}\n", 
            phone, session.getRegistrationNumber(), portalUrl);
    }

    @Override
    public void sendSessionPaymentReceipt(VehicleSession session) {
        String phone = getCustomerPhone(session);
        if (phone == null) return;

        log.info("\n[SMS MOCK] To: {}\nMessage: RinseFlow Car Wash: Payment of ${} received for {}. Thank you!\n", 
            phone, session.getPrice(), session.getRegistrationNumber());
    }

    private String getCustomerPhone(VehicleSession session) {
        return Optional.ofNullable(session.getCustomer())
                .map(c -> c.getPhone())
                .orElse(null);
    }
}
