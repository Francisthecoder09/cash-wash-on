package com.carwash.ops.service;

import com.carwash.ops.domain.entity.VehicleSession;

public interface NotificationService {

    void sendBookingConfirmation(VehicleSession session);

    void sendSessionComplete(VehicleSession session);

    void sendSessionPaymentReceipt(VehicleSession session);
}
