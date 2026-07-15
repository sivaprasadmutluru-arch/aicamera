package com.prabhatech.videoanalytics.dahua.direct;

import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.dahua.DahuaIntegrationService;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.http.HttpResponse;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Manages one long-lived eventManager.cgi connection per directly-integrated
 * camera (see {@link MultipartEventStreamParser}), reconnecting on failure.
 * Credentials are supplied per-call rather than persisted, since they are not
 * currently stored on the Camera entity.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DahuaDirectDeviceListenerManager {

    private final DahuaDirectDeviceClient client;
    private final DahuaIntegrationService integrationService;

    private final Map<Long, ListenerHandle> listeners = new ConcurrentHashMap<>();

    public void start(Camera camera, String username, String password) {
        stop(camera.getId());
        ListenerHandle handle = new ListenerHandle();
        Thread thread = new Thread(() -> runLoop(camera, username, password, handle), "dahua-direct-listener-" + camera.getId());
        thread.setDaemon(true);
        handle.thread = thread;
        listeners.put(camera.getId(), handle);
        thread.start();
        log.info("Started direct-device event listener for camera {}", camera.getId());
    }

    public void stop(Long cameraId) {
        ListenerHandle handle = listeners.remove(cameraId);
        if (handle != null) {
            handle.stop();
            log.info("Stopped direct-device event listener for camera {}", cameraId);
        }
    }

    public boolean isRunning(Long cameraId) {
        return listeners.containsKey(cameraId);
    }

    @PreDestroy
    public void stopAll() {
        listeners.keySet().forEach(this::stop);
    }

    private void runLoop(Camera camera, String username, String password, ListenerHandle handle) {
        String host = camera.getIpAddress().startsWith("http") ? camera.getIpAddress() : "http://" + camera.getIpAddress();
        while (!handle.stopped.get()) {
            try {
                HttpResponse<java.io.InputStream> response = client.digestAuthenticatedRequest(
                        host, "/cgi-bin/eventManager.cgi?action=attach&codes=All&heartbeat=30",
                        HttpResponse.BodyHandlers.ofInputStream(), username, password);

                if (response.statusCode() != 200) {
                    log.warn("Direct-device event stream for camera {} returned status {}", camera.getId(), response.statusCode());
                    sleep(10_000);
                    continue;
                }

                new MultipartEventStreamParser().parse(response.body(), event -> {
                    try {
                        integrationService.handleDirectDeviceEvent(camera.getDahuaChannelId(), event.code(), event.action(), event.data());
                    } catch (Exception e) {
                        log.warn("Failed to process direct-device event for camera {}: {}", camera.getId(), e.getMessage());
                    }
                }, handle.stopped::get);
            } catch (Exception e) {
                if (!handle.stopped.get()) {
                    log.warn("Direct-device event stream for camera {} disconnected ({}), retrying in 10s", camera.getId(), e.getMessage());
                    sleep(10_000);
                }
            }
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static class ListenerHandle {
        Thread thread;
        final AtomicBoolean stopped = new AtomicBoolean(false);

        void stop() {
            stopped.set(true);
            if (thread != null) {
                thread.interrupt();
            }
        }
    }
}
