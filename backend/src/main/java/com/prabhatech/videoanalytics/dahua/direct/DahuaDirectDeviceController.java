package com.prabhatech.videoanalytics.dahua.direct;

import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.common.exception.BadRequestException;
import com.prabhatech.videoanalytics.common.exception.ResourceNotFoundException;
import com.prabhatech.videoanalytics.common.response.ApiResponse;
import com.prabhatech.videoanalytics.dahua.direct.dto.DirectDeviceCredentialsRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Admin-triggered direct-device integration (DAHUA_HTTP_API_V4.04): connects
 * straight to a camera/NVR's classic CGI API rather than through the DSS VMS
 * platform. Useful for standalone cameras not (yet) registered on DSS.
 * Credentials are supplied per-call and are not persisted.
 */
@Slf4j
@RestController
@RequestMapping("/api/integrations/dahua/direct")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
public class DahuaDirectDeviceController {

    private final CameraRepository cameraRepository;
    private final DahuaDirectDeviceClient directDeviceClient;
    private final DahuaDirectDeviceListenerManager listenerManager;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/{cameraId}/listen")
    public ResponseEntity<ApiResponse<Void>> startListening(
            @PathVariable Long cameraId,
            @Valid @RequestBody DirectDeviceCredentialsRequest request) {
        Camera camera = findCameraOrThrow(cameraId);
        listenerManager.start(camera, request.getUsername(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Direct-device event listener started", null));
    }

    @DeleteMapping("/{cameraId}/listen")
    public ResponseEntity<ApiResponse<Void>> stopListening(@PathVariable Long cameraId) {
        listenerManager.stop(cameraId);
        return ResponseEntity.ok(ApiResponse.success("Direct-device event listener stopped", null));
    }

    @PostMapping("/{cameraId}/snapshot")
    public ResponseEntity<ApiResponse<String>> captureSnapshot(
            @PathVariable Long cameraId, @Valid @RequestBody DirectDeviceCredentialsRequest request) {
        Camera camera = findCameraOrThrow(cameraId);
        try {
            byte[] image = directDeviceClient.captureSnapshot(
                    camera.getIpAddress().startsWith("http") ? camera.getIpAddress() : "http://" + camera.getIpAddress(),
                    request.getUsername(), request.getPassword(), request.getChannel());

            Path dir = Path.of(uploadDir, "dahua-snapshots");
            Files.createDirectories(dir);
            String fileName = "camera-" + cameraId + "-" + System.currentTimeMillis() + ".jpg";
            Files.write(dir.resolve(fileName), image);

            return ResponseEntity.ok(ApiResponse.success("Snapshot captured", "/uploads/dahua-snapshots/" + fileName));
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new BadRequestException("Failed to capture snapshot: " + e.getMessage());
        }
    }

    private Camera findCameraOrThrow(Long cameraId) {
        return cameraRepository.findById(cameraId)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with id: " + cameraId));
    }
}
