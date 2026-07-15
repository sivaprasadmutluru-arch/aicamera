package com.prabhatech.videoanalytics.dahua.dss;

import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.entity.CameraStatus;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.dahua.DahuaProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Syncs cameras registered on the Dahua DSS platform into this backend's
 * Camera table, using:
 * - GET /brms/api/v1.1/device/page (section 3.3.1.2 - Get the List of Devices in Pages)
 * - POST /brms/api/v1.1/device/status/fetch/batch/list (section 3.3.1.5 - device/channel status)
 *
 * Each DSS "channel" (format deviceCode$unit$0$index, e.g. "1000001$1$0$0")
 * becomes one Camera row, matching this backend's per-channel camera model.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DssDeviceSyncService {

    private static final String DEVICE_PAGE_URI = "/brms/api/v1.1/device/page";
    private static final String BATCH_STATUS_URI = "/brms/api/v1.1/device/status/fetch/batch/list";
    private static final int PAGE_SIZE = 200;

    private final DahuaProperties properties;
    private final DssSessionManager sessionManager;
    private final DssHttpClient httpClient;
    private final CameraRepository cameraRepository;

    @Scheduled(initialDelay = 15_000, fixedDelay = 300_000)
    public void syncDevices() {
        if (!properties.isEnabled() || !sessionManager.isLoggedIn()) {
            return;
        }
        try {
            List<Map<String, Object>> devices = fetchAllDevicePages();
            if (devices.isEmpty()) {
                return;
            }
            Map<String, Map<String, Object>> deviceByCode = new LinkedHashMap<>();
            List<String> deviceCodes = new ArrayList<>();
            for (Map<String, Object> device : devices) {
                String code = String.valueOf(device.get("deviceCode"));
                deviceByCode.put(code, device);
                deviceCodes.add(code);
            }

            List<Map<String, Object>> statuses = fetchChannelStatuses(deviceCodes);
            applyChannelStatuses(statuses, deviceByCode);
        } catch (Exception e) {
            log.warn("Dahua DSS device sync failed: {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchAllDevicePages() {
        List<Map<String, Object>> all = new ArrayList<>();
        int page = 1;
        while (true) {
            String uri = DEVICE_PAGE_URI + "?page=" + page + "&pageSize=" + PAGE_SIZE + "&containChild=1";
            Map<String, Object> response = httpClient.get(uri, sessionManager.requireToken());
            Map<String, Object> data = response != null ? (Map<String, Object>) response.get("data") : null;
            List<Map<String, Object>> pageData = data != null ? (List<Map<String, Object>>) data.get("pageData") : null;
            if (pageData == null || pageData.isEmpty()) {
                break;
            }
            all.addAll(pageData);
            if (pageData.size() < PAGE_SIZE) {
                break;
            }
            page++;
        }
        return all;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchChannelStatuses(List<String> deviceCodes) {
        Map<String, Object> response = httpClient.post(BATCH_STATUS_URI, Map.of("deviceCodes", deviceCodes), sessionManager.requireToken());
        Map<String, Object> data = response != null ? (Map<String, Object>) response.get("data") : null;
        if (data == null) {
            return List.of();
        }
        Object results = data.containsKey("results") ? data.get("results") : data.get("pageData");
        return results instanceof List ? (List<Map<String, Object>>) results : List.of();
    }

    @SuppressWarnings("unchecked")
    private void applyChannelStatuses(List<Map<String, Object>> statuses, Map<String, Map<String, Object>> deviceByCode) {
        for (Map<String, Object> deviceStatus : statuses) {
            String deviceCode = String.valueOf(deviceStatus.get("deviceCode"));
            Map<String, Object> device = deviceByCode.get(deviceCode);
            String deviceName = device != null ? String.valueOf(device.get("deviceName")) : deviceCode;
            String deviceIp = device != null ? String.valueOf(device.get("deviceIp")) : null;

            List<Map<String, Object>> channels = (List<Map<String, Object>>) deviceStatus.getOrDefault("channels", List.of());
            for (Map<String, Object> channel : channels) {
                String channelId = String.valueOf(channel.get("channelId"));
                int status = channel.get("status") instanceof Number n ? n.intValue() : 0;
                upsertCamera(channelId, deviceCode, deviceName, deviceIp, status == 1);
            }
        }
    }

    private void upsertCamera(String channelId, String deviceCode, String deviceName, String deviceIp, boolean online) {
        Camera camera = cameraRepository.findByDahuaChannelId(channelId).orElseGet(() -> {
            Camera c = new Camera();
            c.setCode(channelId);
            c.setDahuaChannelId(channelId);
            c.setName(deviceName + " - " + channelSuffix(channelId));
            c.setAiEnabled(true);
            return c;
        });
        camera.setDahuaDeviceId(deviceCode);
        camera.setIpAddress(deviceIp);
        camera.setStatus(online ? CameraStatus.ONLINE : CameraStatus.OFFLINE);
        camera.setLastHeartbeatAt(LocalDateTime.now());
        cameraRepository.save(camera);
    }

    private String channelSuffix(String channelId) {
        String[] parts = channelId.split("\\$");
        String index = parts.length > 3 ? parts[3] : "0";
        try {
            return "Ch" + (Integer.parseInt(index) + 1);
        } catch (NumberFormatException e) {
            return "Ch" + index;
        }
    }
}
