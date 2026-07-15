package com.prabhatech.videoanalytics.dahua.dss;

import com.prabhatech.videoanalytics.dahua.DahuaProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Registers this backend's webhook as the DSS platform's alarm push target,
 * per "Dahua_HTTP_API_for_DSS_V8.7" section 3.6.1 (Subscribe to Alarms):
 * POST /brms/api/v1.1/push-data/alarm/subscribe with our callbackUrl.
 * The platform then POSTs alarm messages to that URL as they occur
 * (see {@link com.prabhatech.videoanalytics.dahua.controller.DahuaWebhookController}).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DssAlarmSubscriptionService {

    private static final String SUBSCRIBE_URI = "/brms/api/v1.1/push-data/alarm/subscribe";

    private final DahuaProperties properties;
    private final DssSessionManager sessionManager;
    private final DssHttpClient httpClient;

    private final AtomicBoolean subscribed = new AtomicBoolean(false);

    @Scheduled(initialDelay = 20_000, fixedDelay = 300_000)
    public void ensureSubscribed() {
        if (!properties.isEnabled() || !sessionManager.isLoggedIn() || subscribed.get()) {
            return;
        }
        if (properties.getCallbackBaseUrl() == null || properties.getCallbackBaseUrl().isBlank()) {
            log.warn("app.dahua.callback-base-url is not configured; skipping alarm subscription");
            return;
        }
        try {
            String callbackUrl = properties.getCallbackBaseUrl() + "/api/integrations/dahua/events";
            Map<String, Object> response = httpClient.post(SUBSCRIBE_URI, Map.of(
                    "callbackUrl", callbackUrl,
                    "action", "1",
                    "signature", UUID.randomUUID().toString().replace("-", "")
            ), sessionManager.requireToken());

            if (response != null && Integer.valueOf(1000).equals(response.get("code"))) {
                subscribed.set(true);
                log.info("Subscribed to Dahua DSS alarm push at {}", callbackUrl);
            } else {
                log.warn("Dahua DSS alarm subscription failed: {}", response);
            }
        } catch (Exception e) {
            log.warn("Dahua DSS alarm subscription failed: {}", e.getMessage());
        }
    }
}
