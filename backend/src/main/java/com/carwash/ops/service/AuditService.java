package com.carwash.ops.service;

import com.carwash.ops.domain.entity.User;
import com.carwash.ops.domain.entity.VehicleSession;
import com.carwash.ops.domain.enums.AuditAction;
import com.carwash.ops.dto.audit.AuditLogResponse;
import java.util.List;

public interface AuditService {
    void log(User user, VehicleSession vehicleSession, AuditAction action, String description, String metadataJson);
    List<AuditLogResponse> findAll();
}
