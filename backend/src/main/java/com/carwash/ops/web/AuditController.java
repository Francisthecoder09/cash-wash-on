package com.carwash.ops.web;

import com.carwash.ops.domain.entity.AuditLog;
import com.carwash.ops.dto.audit.AuditLogResponse;
import com.carwash.ops.repository.AuditLogRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Returns all audit log entries, newest first.
     * Access: ADMIN (full view) and AUDITOR (read-only view).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public List<AuditLogResponse> list() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getAction() != null ? log.getAction().name() : null,
                log.getDescription(),
                log.getMetadataJson(),
                log.getUser() != null ? log.getUser().getId() : null,
                log.getVehicleSession() != null ? log.getVehicleSession().getId() : null,
                log.getCreatedAt()
        );
    }
}
