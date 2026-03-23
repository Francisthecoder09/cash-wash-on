package com.carwash.ops.service;

import com.carwash.ops.domain.entity.User;
import com.carwash.ops.domain.entity.VehicleSession;
import com.carwash.ops.domain.enums.AuditAction;

public interface AuditService {
    void log(User user, VehicleSession vehicleSession, AuditAction action, String description, String metadataJson);
}
