package com.prabhatech.videoanalytics.aievent.service;

import com.prabhatech.videoanalytics.aievent.dto.AiEventRequest;
import com.prabhatech.videoanalytics.aievent.dto.AiEventResponse;
import com.prabhatech.videoanalytics.aievent.entity.AiEvent;
import com.prabhatech.videoanalytics.aievent.entity.AiEventType;
import com.prabhatech.videoanalytics.aievent.entity.EventSeverity;
import com.prabhatech.videoanalytics.aievent.repository.AiEventRepository;
import com.prabhatech.videoanalytics.aievent.repository.AiEventSpecifications;
import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.common.exception.ResourceNotFoundException;
import com.prabhatech.videoanalytics.incident.service.IncidentService;
import com.prabhatech.videoanalytics.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiEventService {

    private final AiEventRepository aiEventRepository;
    private final CameraRepository cameraRepository;
    private final NotificationService notificationService;
    private final IncidentService incidentService;

    @Transactional
    public AiEventResponse ingestEvent(AiEventRequest request) {
        Camera camera = cameraRepository.findById(request.getCameraId())
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with id: " + request.getCameraId()));

        AiEvent event = new AiEvent();
        event.setCamera(camera);
        event.setEventType(request.getEventType());
        event.setSeverity(request.getSeverity() != null ? request.getSeverity() : EventSeverity.LOW);
        event.setDescription(request.getDescription());
        event.setMetadata(request.getMetadata());
        event.setSnapshotUrl(request.getSnapshotUrl());
        event.setDetectedAt(request.getDetectedAt() != null ? request.getDetectedAt() : LocalDateTime.now());
        event = aiEventRepository.save(event);

        AiEventResponse response = new AiEventResponse(event);
        notificationService.broadcast(NotificationService.TOPIC_AI_EVENTS, response);

        if (event.getSeverity() == EventSeverity.HIGH || event.getSeverity() == EventSeverity.CRITICAL) {
            incidentService.createFromAiEvent(event);
        }

        return response;
    }

    public Page<AiEventResponse> searchEvents(
            Long cameraId, AiEventType eventType, EventSeverity severity,
            LocalDateTime from, LocalDateTime to, Boolean acknowledged, Pageable pageable) {
        return aiEventRepository
                .findAll(AiEventSpecifications.withFilters(cameraId, eventType, severity, from, to, acknowledged), pageable)
                .map(AiEventResponse::new);
    }

    @Transactional
    public AiEventResponse acknowledge(Long id, String acknowledgedBy) {
        AiEvent event = aiEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI event not found with id: " + id));
        event.setAcknowledged(true);
        event.setAcknowledgedBy(acknowledgedBy);
        event.setAcknowledgedAt(LocalDateTime.now());
        return new AiEventResponse(aiEventRepository.save(event));
    }
}
