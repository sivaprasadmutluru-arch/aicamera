package com.prabhatech.videoanalytics.dahua.dss;

import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.common.exception.BadRequestException;
import com.prabhatech.videoanalytics.common.exception.ResourceNotFoundException;
import com.prabhatech.videoanalytics.dahua.DahuaProperties;
import com.prabhatech.videoanalytics.dahua.dss.dto.RecordingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.List;
import java.util.Map;

/**
 * Retrieves live-view and recorded-playback streaming URLs from the DSS
 * platform (Dahua_HTTP_API_for_DSS_V8.7 sections 3.4 - Live Video and 3.5 -
 * Record Playback). Returned URLs point at the platform's separate streaming
 * media server (a different port than the main REST API) and already embed
 * their own short-lived access token as a query parameter, so the browser can
 * connect to them directly without needing our session's X-Subject-Token.
 */
@Service
@RequiredArgsConstructor
public class DssVideoService {

    private final DahuaProperties properties;
    private final DssSessionManager sessionManager;
    private final DssHttpClient httpClient;
    private final CameraRepository cameraRepository;

    /** Stream type: 1 = Main stream, 2 = Sub stream 1, 3 = Sub stream 2. */
    public String getLiveStreamUrl(Long cameraId, int streamType) {
        Camera camera = requireDssCamera(cameraId);
        return getLiveFlvUrl(camera.getDahuaChannelId(), streamType);
    }

    /**
     * Searches recordings for a camera within a time range (section 3.5.1).
     * recordSource=3 (Center) covers footage stored on the DSS platform's own
     * storage service, which is the common case for a DSS-managed deployment.
     */
    @SuppressWarnings("unchecked")
    public List<RecordingDto> searchRecordings(Long cameraId, long startEpochSeconds, long endEpochSeconds) {
        Camera camera = requireDssCamera(cameraId);

        Map<String, Object> response = httpClient.post("/brms/api/v1.0/SS/Record/QueryRecords", Map.of(
                "data", Map.of(
                        "channelId", camera.getDahuaChannelId(),
                        "startTime", String.valueOf(startEpochSeconds),
                        "endTime", String.valueOf(endEpochSeconds),
                        "streamType", "1",
                        "recordType", "0",
                        "recordSource", "3"
                )
        ), sessionManager.requireToken());

        Map<String, Object> data = response != null ? (Map<String, Object>) response.get("data") : null;
        List<Map<String, Object>> records = data != null ? (List<Map<String, Object>>) data.get("records") : null;
        if (records == null) {
            return List.of();
        }

        return records.stream()
                .map(r -> new RecordingDto(
                        String.valueOf(r.get("channelId")),
                        String.valueOf(r.get("recordSource")),
                        String.valueOf(r.get("recordType")),
                        String.valueOf(r.get("streamId")),
                        Long.parseLong(String.valueOf(r.get("startTime"))),
                        Long.parseLong(String.valueOf(r.get("endTime"))),
                        String.valueOf(r.get("recordName"))
                ))
                .toList();
    }

    /**
     * Acquires an HLS playback URL for a specific recording (section 3.5.4).
     * The recordSource/recordType/streamId/startTime/endTime must be the exact
     * values returned by {@link #searchRecordings}.
     */
    @SuppressWarnings("unchecked")
    public String getPlaybackStreamUrl(Long cameraId, String recordSource, String recordType, String streamId,
                                        long startTime, long endTime) {
        Camera camera = requireDssCamera(cameraId);
        String protocol = resolveProtocol();

        String uri = "/brms/api/v1.1/video/playback/channel/" + camera.getDahuaChannelId() + "/hls"
                + "?recordSource=" + recordSource
                + "&streamId=" + streamId
                + "&recordType=" + recordType
                + "&streamType=1"
                + "&startTime=" + startTime
                + "&endTime=" + endTime
                + "&protocol=" + protocol;

        Map<String, Object> response = httpClient.get(uri, sessionManager.requireToken());
        Map<String, Object> data = response != null ? (Map<String, Object>) response.get("data") : null;
        String streamUrl = data != null ? (String) data.get("streamUrl") : null;
        if (streamUrl == null) {
            throw new IllegalStateException("DSS did not return a playback stream URL: " + response);
        }
        return streamUrl;
    }

    private Camera requireDssCamera(Long cameraId) {
        Camera camera = cameraRepository.findById(cameraId)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with id: " + cameraId));

        if (camera.getDahuaChannelId() == null) {
            throw new BadRequestException(
                    "Camera '" + camera.getName() + "' is not linked to a Dahua DSS channel");
        }
        if (!properties.isEnabled() || !sessionManager.isLoggedIn()) {
            throw new BadRequestException(
                    "This feature requires the Dahua DSS integration to be enabled and connected");
        }
        return camera;
    }

    @SuppressWarnings("unchecked")
    private String getLiveFlvUrl(String dahuaChannelId, int streamType) {
        String protocol = resolveProtocol();
        String uri = "/brms/api/v1.1/video/live/channel/" + dahuaChannelId + "/flv?protocol=" + protocol
                + "&streamType=" + streamType;
        Map<String, Object> response = httpClient.get(uri, sessionManager.requireToken());
        Map<String, Object> data = response != null ? (Map<String, Object>) response.get("data") : null;
        String streamUrl = data != null ? (String) data.get("streamUrl") : null;
        if (streamUrl == null) {
            throw new IllegalStateException("DSS did not return a live stream URL: " + response);
        }
        return streamUrl;
    }

    private String resolveProtocol() {
        String baseUrl = properties.getBaseUrl();
        if (baseUrl != null) {
            try {
                return URI.create(baseUrl).getScheme();
            } catch (IllegalArgumentException ignored) {
                // fall through to default
            }
        }
        return "https";
    }
}
