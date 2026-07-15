package com.prabhatech.videoanalytics.aievent.entity;

import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "ai_events")
public class AiEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camera_id", nullable = false)
    private Camera camera;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AiEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventSeverity severity = EventSeverity.LOW;

    @Column(length = 1000)
    private String description;

    /** Raw metadata payload from the Dahua AI SDK/REST event, stored as JSON text. */
    @Column(columnDefinition = "TEXT")
    private String metadata;

    private String snapshotUrl;

    @Column(nullable = false)
    private LocalDateTime detectedAt;

    private boolean acknowledged = false;

    private String acknowledgedBy;

    private LocalDateTime acknowledgedAt;
}
