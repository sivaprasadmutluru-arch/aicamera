package com.prabhatech.videoanalytics.dahua.controller;

import com.prabhatech.videoanalytics.common.response.ApiResponse;
import com.prabhatech.videoanalytics.dahua.DahuaIntegrationService;
import com.prabhatech.videoanalytics.dahua.DahuaProperties;
import com.prabhatech.videoanalytics.dahua.dto.DahuaEventPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Webhook receiver for the Dahua VMS event subscription / SDK bridge described
 * in the technical proposal (section 10 - Dahua VMS Integration: "Live Events").
 * Configure the Dahua VMS (or an intermediary SDK bridge process) to POST AI
 * and alarm events to /api/integrations/dahua/events.
 */
@RestController
@RequestMapping("/api/integrations/dahua")
@RequiredArgsConstructor
public class DahuaWebhookController {

    private final DahuaIntegrationService dahuaIntegrationService;
    private final DahuaProperties dahuaProperties;

    @PostMapping("/events")
    public ResponseEntity<ApiResponse<Void>> receiveEvent(@RequestBody DahuaEventPayload payload) {
        dahuaIntegrationService.handleDssAlarm(payload);
        return ResponseEntity.ok(ApiResponse.success("Event processed", null));
    }

    @PostMapping("/device-status")
    public ResponseEntity<ApiResponse<Void>> receiveDeviceStatus(
            @RequestParam String channelId, @RequestParam String status) {
        if ("online".equalsIgnoreCase(status)) {
            dahuaIntegrationService.handleDeviceOnline(channelId);
        } else {
            dahuaIntegrationService.handleDeviceOffline(channelId);
        }
        return ResponseEntity.ok(ApiResponse.success("Device status updated", null));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> status() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "enabled", dahuaProperties.isEnabled(),
                "baseUrl", dahuaProperties.getBaseUrl()
        )));
    }
}
