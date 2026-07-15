package com.prabhatech.videoanalytics.camera.controller;

import com.prabhatech.videoanalytics.camera.dto.CameraRequest;
import com.prabhatech.videoanalytics.camera.dto.CameraResponse;
import com.prabhatech.videoanalytics.camera.dto.UpdateCameraStatusRequest;
import com.prabhatech.videoanalytics.camera.service.CameraService;
import com.prabhatech.videoanalytics.common.response.ApiResponse;
import com.prabhatech.videoanalytics.dahua.dss.DssVideoService;
import com.prabhatech.videoanalytics.dahua.dss.dto.RecordingDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cameras")
@RequiredArgsConstructor
public class CameraController {

    private final CameraService cameraService;
    private final DssVideoService dssVideoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CameraResponse>>> getAllCameras() {
        return ResponseEntity.ok(ApiResponse.success(cameraService.getAllCameras()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CameraResponse>> getCamera(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cameraService.getCamera(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<CameraResponse>> createCamera(@Valid @RequestBody CameraRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Camera registered", cameraService.createCamera(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<CameraResponse>> updateCamera(
            @PathVariable Long id, @Valid @RequestBody CameraRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Camera updated", cameraService.updateCamera(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'SECURITY_OPERATOR')")
    public ResponseEntity<ApiResponse<CameraResponse>> updateStatus(
            @PathVariable Long id, @RequestBody UpdateCameraStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Camera status updated", cameraService.updateStatus(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCamera(@PathVariable Long id) {
        cameraService.deleteCamera(id);
        return ResponseEntity.ok(ApiResponse.success("Camera removed", null));
    }

    /**
     * Returns a live-view stream URL from the Dahua DSS platform (HTTP-FLV).
     * The URL already embeds its own short-lived token, so the browser can
     * connect to it directly with an FLV-capable player (e.g. flv.js).
     */
    @GetMapping("/{id}/live-stream")
    public ResponseEntity<ApiResponse<Map<String, String>>> getLiveStreamUrl(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int streamType) {
        String streamUrl = dssVideoService.getLiveStreamUrl(id, streamType);
        return ResponseEntity.ok(ApiResponse.success(Map.of("streamUrl", streamUrl)));
    }

    /** Searches recorded footage for a camera within a time range (epoch seconds). */
    @GetMapping("/{id}/recordings")
    public ResponseEntity<ApiResponse<List<RecordingDto>>> searchRecordings(
            @PathVariable Long id,
            @RequestParam long from,
            @RequestParam long to) {
        return ResponseEntity.ok(ApiResponse.success(dssVideoService.searchRecordings(id, from, to)));
    }

    /**
     * Returns an HLS playback URL for one recording found via {@link #searchRecordings}.
     * recordSource/recordType/streamId/startTime/endTime must match that recording exactly.
     */
    @GetMapping("/{id}/recordings/playback-url")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPlaybackUrl(
            @PathVariable Long id,
            @RequestParam String recordSource,
            @RequestParam String recordType,
            @RequestParam String streamId,
            @RequestParam long startTime,
            @RequestParam long endTime) {
        String streamUrl = dssVideoService.getPlaybackStreamUrl(id, recordSource, recordType, streamId, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(Map.of("streamUrl", streamUrl)));
    }
}
