package com.prabhatech.videoanalytics.aievent.dto;

import com.prabhatech.videoanalytics.aievent.entity.AiEvent;
import com.prabhatech.videoanalytics.aievent.entity.AiEventType;
import com.prabhatech.videoanalytics.aievent.entity.EventSeverity;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AiEventResponse {
    private final Long id;
    private final Long cameraId;
    private final String cameraName;
    private final AiEventType eventType;
    private final EventSeverity severity;
    private final String description;
    private final String snapshotUrl;
    private final LocalDateTime detectedAt;
    private final boolean acknowledged;
    private final String acknowledgedBy;

    public AiEventResponse(AiEvent event) {
        this.id = event.getId();
        this.cameraId = event.getCamera().getId();
        this.cameraName = event.getCamera().getName();
        this.eventType = event.getEventType();
        this.severity = event.getSeverity();
        this.description = event.getDescription();
        this.snapshotUrl = event.getSnapshotUrl();
        this.detectedAt = event.getDetectedAt();
        this.acknowledged = event.isAcknowledged();
        this.acknowledgedBy = event.getAcknowledgedBy();
    }
}
