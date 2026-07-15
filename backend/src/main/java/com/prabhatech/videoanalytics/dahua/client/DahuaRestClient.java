package com.prabhatech.videoanalytics.dahua.client;

import com.prabhatech.videoanalytics.dahua.DahuaProperties;
import com.prabhatech.videoanalytics.dahua.dto.DahuaDeviceDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Thin REST client for the Dahua VMS "Login Authentication" and "Device" APIs
 * described in the technical proposal (section 10 - Dahua VMS Integration).
 *
 * This is an integration stub: the exact login handshake (RPC2_Login challenge/
 * response, ICC OAuth2 token exchange, or DSS session cookie) and device listing
 * endpoint depend on which Dahua product (VMS/DSS/ICC) is deployed at the client
 * site. Wire the real request/response shapes here once VMS API docs/credentials
 * are provided by the client.
 */
@Slf4j
@Component
public class DahuaRestClient implements DahuaClient {

    private final DahuaProperties properties;
    private final RestClient restClient;

    public DahuaRestClient(DahuaProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder().baseUrl(properties.getBaseUrl()).build();
    }

    @Override
    public String login() {
        if (!properties.isEnabled()) {
            throw new IllegalStateException("Dahua VMS integration is disabled (set app.dahua.enabled=true and provide credentials)");
        }
        log.info("Authenticating against Dahua VMS at {}", properties.getBaseUrl());
        Map<?, ?> response = restClient.post()
                .uri("/RPC2_Login")
                .body(Map.of("username", properties.getUsername(), "password", properties.getPassword()))
                .retrieve()
                .body(Map.class);
        return response != null ? String.valueOf(response.get("token")) : null;
    }

    @Override
    public List<DahuaDeviceDto> fetchDevices(String sessionToken) {
        if (!properties.isEnabled()) {
            throw new IllegalStateException("Dahua VMS integration is disabled (set app.dahua.enabled=true and provide credentials)");
        }
        return restClient.get()
                .uri("/api/devices")
                .header("Authorization", "Bearer " + sessionToken)
                .retrieve()
                .body(new ParameterizedTypeReference<List<DahuaDeviceDto>>() {
                });
    }
}
