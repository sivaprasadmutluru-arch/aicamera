package com.prabhatech.videoanalytics.aievent.dto;

import com.prabhatech.videoanalytics.aievent.entity.AiEventType;
import com.prabhatech.videoanalytics.aievent.entity.EventSeverity;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AiEventRequest {

    @NotNull
    private Long cameraId;

    @NotNull
    private AiEventType eventType;

    private EventSeverity severity = EventSeverity.LOW;

    private String description;

    private String metadata;

    private String snapshotUrl;

    private LocalDateTime detectedAt;
}
