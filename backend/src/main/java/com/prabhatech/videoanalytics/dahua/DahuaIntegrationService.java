package com.prabhatech.videoanalytics.dahua;

import com.prabhatech.videoanalytics.aievent.dto.AiEventRequest;
import com.prabhatech.videoanalytics.aievent.entity.EventSeverity;
import com.prabhatech.videoanalytics.aievent.service.AiEventService;
import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.entity.CameraStatus;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.common.exception.ResourceNotFoundException;
import com.prabhatech.videoanalytics.dahua.dto.DahuaEventPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

/**
 * Translates inbound Dahua alarm/event notifications into this platform's
 * domain model and feeds them through the normal AI event ingestion pipeline.
 * Two upstream shapes are handled:
 * - DSS platform alarm subscription callbacks (see {@link #handleDssAlarm}).
 * - Direct-device eventManager.cgi push events (see {@link #handleDirectDeviceEvent}).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DahuaIntegrationService {

    private final CameraRepository cameraRepository;
    private final AiEventService aiEventService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public void handleDssAlarm(DahuaEventPayload payload) {
        if (payload.getCallbackType() != null && payload.getCallbackType() == 2) {
            log.debug("Ignoring DSS linked-image callback for alarm {}", payload.getAlarmCode());
            return;
        }
        if ("2".equals(payload.getAlarmStatus())) {
            log.debug("Ignoring DSS alarm-cleared callback for alarm {}", payload.getAlarmCode());
            return;
        }

        Camera camera = cameraRepository.findByDahuaChannelId(payload.getSourceCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No camera registered for Dahua channel id: " + payload.getSourceCode()));

        AiEventRequest request = new AiEventRequest();
        request.setCameraId(camera.getId());
        request.setEventType(DahuaEventTypeMapper.mapDssAlarmType(payload.getAlarmType(), payload.getAlarmTypeName()));
        request.setSeverity(mapSeverity(payload.getAlarmGrade()));
        request.setDescription(payload.getEventRemark() != null ? payload.getEventRemark() : payload.getRemark());
        request.setMetadata(payload.getExtData());
        request.setSnapshotUrl(saveFirstSnapshot(payload.getAlarmCode(), payload.getAlarmPictures()));
        request.setDetectedAt(payload.getAlarmTime() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochSecond(payload.getAlarmTime()), ZoneId.systemDefault())
                : LocalDateTime.now());

        aiEventService.ingestEvent(request);
    }

    /** Direct-device eventManager.cgi push (DAHUA_HTTP_API_V4.04 section 4.9.17). */
    @Transactional
    public void handleDirectDeviceEvent(String dahuaChannelId, String code, String action, String rawDataJson) {
        if (!"Start".equalsIgnoreCase(action) && !"Pulse".equalsIgnoreCase(action)) {
            return;
        }
        Camera camera = cameraRepository.findByDahuaChannelId(dahuaChannelId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No camera registered for Dahua channel id: " + dahuaChannelId));

        AiEventRequest request = new AiEventRequest();
        request.setCameraId(camera.getId());
        request.setEventType(DahuaEventTypeMapper.mapDirectDeviceCode(code));
        request.setSeverity(EventSeverity.MEDIUM);
        request.setDescription(code);
        request.setMetadata(rawDataJson);
        request.setDetectedAt(LocalDateTime.now());

        aiEventService.ingestEvent(request);
    }

    public void handleDeviceOnline(String dahuaChannelId) {
        updateCameraStatus(dahuaChannelId, CameraStatus.ONLINE);
    }

    public void handleDeviceOffline(String dahuaChannelId) {
        updateCameraStatus(dahuaChannelId, CameraStatus.OFFLINE);
    }

    private void updateCameraStatus(String dahuaChannelId, CameraStatus status) {
        cameraRepository.findByDahuaChannelId(dahuaChannelId).ifPresentOrElse(camera -> {
            camera.setStatus(status);
            camera.setLastHeartbeatAt(LocalDateTime.now());
            cameraRepository.save(camera);
        }, () -> log.warn("Received device status event for unknown Dahua channel id: {}", dahuaChannelId));
    }

    private EventSeverity mapSeverity(String alarmGrade) {
        if (alarmGrade == null) {
            return EventSeverity.LOW;
        }
        return switch (alarmGrade) {
            case "1" -> EventSeverity.HIGH;
            case "2" -> EventSeverity.MEDIUM;
            default -> EventSeverity.LOW;
        };
    }

    private String saveFirstSnapshot(String alarmCode, List<String> base64Pictures) {
        if (base64Pictures == null || base64Pictures.isEmpty()) {
            return null;
        }
        try {
            Path dir = Path.of(uploadDir, "dahua-events");
            Files.createDirectories(dir);
            String fileName = (alarmCode != null ? alarmCode.replaceAll("[^a-zA-Z0-9-]", "") : UUID.randomUUID().toString()) + ".jpg";
            Path file = dir.resolve(fileName);
            Files.write(file, Base64.getDecoder().decode(base64Pictures.get(0)));
            return "/uploads/dahua-events/" + fileName;
        } catch (IOException | IllegalArgumentException e) {
            log.warn("Failed to save Dahua alarm snapshot: {}", e.getMessage());
            return null;
        }
    }
}
