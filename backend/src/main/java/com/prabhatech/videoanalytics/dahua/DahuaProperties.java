package com.prabhatech.videoanalytics.dahua;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration for the Dahua DSS (VMS platform) integration described in
 * "Dahua_HTTP_API_for_DSS_V8.7" section 3.1 (Login Authentication), 3.3
 * (Device), and 3.6 (Alarm/Event Center).
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.dahua")
public class DahuaProperties {
    /** DSS platform base URL, e.g. https://192.168.1.1:443 */
    private String baseUrl;
    private String username;
    private String password;
    private boolean enabled;

    /**
     * Public base URL of this backend, used to register the alarm subscription
     * callback with the DSS platform (section 3.6.1 Subscribe to Alarms).
     * e.g. https://analytics.example.com:8081
     */
    private String callbackBaseUrl;
}
