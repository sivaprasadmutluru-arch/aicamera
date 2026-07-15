package com.prabhatech.videoanalytics.incident.dto;

import com.prabhatech.videoanalytics.incident.entity.Incident;
import com.prabhatech.videoanalytics.incident.entity.IncidentPriority;
import com.prabhatech.videoanalytics.incident.entity.IncidentStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class IncidentResponse {
    private final Long id;
    private final String title;
    private final String description;
    private final Long cameraId;
    private final String cameraName;
    private final Long relatedAiEventId;
    private final IncidentStatus status;
    private final IncidentPriority priority;
    private final String assignedToName;
    private final String createdByName;
    private final String resolutionNotes;
    private final LocalDateTime resolvedAt;
    private final LocalDateTime createdAt;

    public IncidentResponse(Incident incident) {
        this.id = incident.getId();
        this.title = incident.getTitle();
        this.description = incident.getDescription();
        this.cameraId = incident.getCamera() != null ? incident.getCamera().getId() : null;
        this.cameraName = incident.getCamera() != null ? incident.getCamera().getName() : null;
        this.relatedAiEventId = incident.getRelatedAiEvent() != null ? incident.getRelatedAiEvent().getId() : null;
        this.status = incident.getStatus();
        this.priority = incident.getPriority();
        this.assignedToName = incident.getAssignedTo() != null ? incident.getAssignedTo().getFullName() : null;
        this.createdByName = incident.getCreatedBy() != null ? incident.getCreatedBy().getFullName() : null;
        this.resolutionNotes = incident.getResolutionNotes();
        this.resolvedAt = incident.getResolvedAt();
        this.createdAt = incident.getCreatedAt();
    }
}
