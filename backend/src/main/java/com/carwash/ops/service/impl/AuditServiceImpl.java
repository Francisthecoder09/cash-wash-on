package com.carwash.ops.service.impl;

import com.carwash.ops.domain.entity.AuditLog;
import com.carwash.ops.domain.entity.User;
import com.carwash.ops.domain.entity.VehicleSession;
import com.carwash.ops.domain.enums.AuditAction;
import com.carwash.ops.dto.audit.AuditLogResponse;
import com.carwash.ops.repository.AuditLogRepository;
import com.carwash.ops.service.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void log(User user, VehicleSession vehicleSession, AuditAction action, String description, String metadataJson) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setVehicleSession(vehicleSession);
        auditLog.setAction(action);
        auditLog.setDescription(description);
        auditLog.setMetadataJson(metadataJson);
        auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLogResponse> findAll() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getAction().name(),
                        log.getDescription(),
                        log.getMetadataJson(),
                        log.getUser() != null ? log.getUser().getId() : null,
                        log.getVehicleSession() != null ? log.getVehicleSession().getId() : null,
                        log.getCreatedAt()))
                .collect(Collectors.toList());
    }
}
