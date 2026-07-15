package com.prabhatech.videoanalytics.dahua.dss;

import com.prabhatech.videoanalytics.dahua.DahuaProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Keeps the DSS session alive per section 5.1.2/5.1.3 of the API doc: a
 * heartbeat every ~20 seconds (the default token "duration" is 30s) and a
 * token refresh every ~2/3 of tokenRate (default 1800s -> refresh ~1200s).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DssSessionScheduler {

    private final DahuaProperties properties;
    private final DssSessionManager sessionManager;

    @Scheduled(initialDelay = 2_000, fixedDelay = 20_000)
    public void maintainSession() {
        if (!properties.isEnabled()) {
            return;
        }
        try {
            if (!sessionManager.isLoggedIn()) {
                sessionManager.login();
            } else {
                sessionManager.keepAlive();
                sessionManager.updateTokenIfDue();
            }
        } catch (Exception e) {
            log.warn("Dahua DSS session maintenance failed, will retry: {}", e.getMessage());
        }
    }
}
