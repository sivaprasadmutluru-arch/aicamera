package com.prabhatech.videoanalytics.incident.service;

import com.prabhatech.videoanalytics.aievent.entity.AiEvent;
import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.common.exception.ResourceNotFoundException;
import com.prabhatech.videoanalytics.incident.dto.IncidentRequest;
import com.prabhatech.videoanalytics.incident.dto.IncidentResponse;
import com.prabhatech.videoanalytics.incident.dto.ResolveIncidentRequest;
import com.prabhatech.videoanalytics.incident.entity.Incident;
import com.prabhatech.videoanalytics.incident.entity.IncidentPriority;
import com.prabhatech.videoanalytics.incident.entity.IncidentStatus;
import com.prabhatech.videoanalytics.incident.repository.IncidentRepository;
import com.prabhatech.videoanalytics.notification.NotificationService;
import com.prabhatech.videoanalytics.user.entity.User;
import com.prabhatech.videoanalytics.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final CameraRepository cameraRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public IncidentResponse createIncident(IncidentRequest request, Long createdByUserId) {
        Incident incident = new Incident();
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setPriority(request.getPriority() != null ? request.getPriority() : IncidentPriority.MEDIUM);
        incident.setStatus(IncidentStatus.OPEN);

        if (request.getCameraId() != null) {
            Camera camera = cameraRepository.findById(request.getCameraId())
                    .orElseThrow(() -> new ResourceNotFoundException("Camera not found with id: " + request.getCameraId()));
            incident.setCamera(camera);
        }

        userRepository.findById(createdByUserId).ifPresent(incident::setCreatedBy);

        return save(incident);
    }

    @Transactional
    public void createFromAiEvent(AiEvent event) {
        Incident incident = new Incident();
        incident.setTitle(event.getEventType().name().replace('_', ' ') + " detected on " + event.getCamera().getName());
        incident.setDescription(event.getDescription());
        incident.setCamera(event.getCamera());
        incident.setRelatedAiEvent(event);
        incident.setStatus(IncidentStatus.OPEN);
        incident.setPriority(switch (event.getSeverity()) {
            case CRITICAL -> IncidentPriority.CRITICAL;
            case HIGH -> IncidentPriority.HIGH;
            case MEDIUM -> IncidentPriority.MEDIUM;
            case LOW -> IncidentPriority.LOW;
        });
        save(incident);
    }

    public Page<IncidentResponse> getIncidents(IncidentStatus status, Pageable pageable) {
        Page<Incident> page = status != null
                ? incidentRepository.findByStatus(status, pageable)
                : incidentRepository.findAll(pageable);
        return page.map(IncidentResponse::new);
    }

    public IncidentResponse getIncident(Long id) {
        return new IncidentResponse(findOrThrow(id));
    }

    @Transactional
    public IncidentResponse assign(Long id, Long userId) {
        Incident incident = findOrThrow(id);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        incident.setAssignedTo(user);
        incident.setStatus(IncidentStatus.ASSIGNED);
        return save(incident);
    }

    @Transactional
    public IncidentResponse updateStatus(Long id, IncidentStatus status) {
        Incident incident = findOrThrow(id);
        incident.setStatus(status);
        return save(incident);
    }

    @Transactional
    public IncidentResponse resolve(Long id, ResolveIncidentRequest request) {
        Incident incident = findOrThrow(id);
        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolutionNotes(request.getResolutionNotes());
        incident.setResolvedAt(LocalDateTime.now());
        return save(incident);
    }

    public long countOpen() {
        return incidentRepository.countByStatusNotIn(List.of(IncidentStatus.RESOLVED, IncidentStatus.CLOSED));
    }

    private IncidentResponse save(Incident incident) {
        IncidentResponse response = new IncidentResponse(incidentRepository.save(incident));
        notificationService.broadcast(NotificationService.TOPIC_INCIDENTS, response);
        return response;
    }

    private Incident findOrThrow(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
    }
}
