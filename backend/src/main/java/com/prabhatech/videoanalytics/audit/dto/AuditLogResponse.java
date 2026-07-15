package com.prabhatech.videoanalytics.audit.dto;

import com.prabhatech.videoanalytics.audit.entity.AuditLog;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AuditLogResponse {
    private final Long id;
    private final String userEmail;
    private final String action;
    private final String entityType;
    private final Long entityId;
    private final String details;
    private final LocalDateTime createdAt;

    public AuditLogResponse(AuditLog auditLog) {
        this.id = auditLog.getId();
        this.userEmail = auditLog.getUser() != null ? auditLog.getUser().getEmail() : null;
        this.action = auditLog.getAction();
        this.entityType = auditLog.getEntityType();
        this.entityId = auditLog.getEntityId();
        this.details = auditLog.getDetails();
        this.createdAt = auditLog.getCreatedAt();
    }
}
