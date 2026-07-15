package com.prabhatech.videoanalytics.dahua.dss;

import com.prabhatech.videoanalytics.dahua.DahuaProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Manages the DSS platform login session as described in
 * "Dahua_HTTP_API_for_DSS_V8.7" section 3.1 (Login Authentication):
 * trigger authentication, submit signed credentials, heartbeat keep-alive,
 * periodic token update, and logout.
 *
 * The AES/RSA secret-key exchange offered by the second login step is only
 * needed to decrypt the ActiveMQ password for the platform's message-queue
 * push channel (section 3.2.1). Since this integration receives alarms via
 * the simpler HTTP callback subscription (section 3.6.1) instead of MQ, the
 * key-exchange fields are sent empty, which the API documents as supported
 * for backward compatibility.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DssSessionManager {

    private static final String AUTHORIZE_URI = "/brms/api/v1.0/accounts/authorize";
    private static final String KEEPALIVE_URI = "/brms/api/v1.0/accounts/keepalive";
    private static final String UPDATE_TOKEN_URI = "/brms/api/v1.0/accounts/updateToken";
    private static final String LOGOUT_URI = "/brms/api/v1.0/accounts/unauthorize";

    private final DahuaProperties properties;
    private final DssHttpClient httpClient;

    private volatile String token;
    private volatile String credential;
    private volatile long tokenRateMs = 1_800_000L;
    private volatile long lastTokenUpdateAt = 0L;

    public synchronized void login() {
        Map<String, Object> firstResponse = httpClient.post(AUTHORIZE_URI, Map.of(
                "userName", properties.getUsername(),
                "ipAddress", "",
                "clientType", "WINPC_V2"
        ), null);

        String realm = firstResponse != null ? (String) firstResponse.get("realm") : null;
        String randomKey = firstResponse != null ? (String) firstResponse.get("randomKey") : null;
        if (realm == null || randomKey == null) {
            throw new IllegalStateException("DSS trigger-authentication did not return realm/randomKey: " + firstResponse);
        }

        String signature = DssSignatureUtil.generateSignature(properties.getUsername(), properties.getPassword(), realm, randomKey);

        Map<String, Object> secondResponse = httpClient.post(AUTHORIZE_URI, Map.of(
                "mac", "",
                "signature", signature,
                "userName", properties.getUsername(),
                "randomKey", randomKey,
                "publicKey", "",
                "ipAddress", "",
                "clientType", "WINPC_V2",
                "userType", "0",
                "secretKey", "",
                "secretVector", ""
        ), null);

        String newToken = secondResponse != null ? (String) secondResponse.get("token") : null;
        if (newToken == null) {
            throw new IllegalStateException("DSS login failed, no token returned: " + secondResponse);
        }

        this.token = newToken;
        this.credential = (String) secondResponse.get("credential");
        Object tokenRate = secondResponse.get("tokenRate");
        if (tokenRate instanceof Number number) {
            this.tokenRateMs = number.longValue() * 1000L;
        }
        this.lastTokenUpdateAt = System.currentTimeMillis();
        log.info("Logged in to Dahua DSS platform at {} as {}", properties.getBaseUrl(), properties.getUsername());
    }

    public void keepAlive() {
        if (!isLoggedIn()) {
            return;
        }
        Map<String, Object> response = httpClient.put(KEEPALIVE_URI, Map.of("token", token), token);
        if (response == null || (Integer) response.getOrDefault("code", 0) != 1000) {
            log.warn("Dahua DSS keep-alive returned unexpected response: {}", response);
        }
    }

    @SuppressWarnings("unchecked")
    public void updateTokenIfDue() {
        if (!isLoggedIn()) {
            return;
        }
        long dueAfter = (long) (tokenRateMs * 2.0 / 3.0);
        if (System.currentTimeMillis() - lastTokenUpdateAt < dueAfter) {
            return;
        }
        Map<String, Object> response = httpClient.post(UPDATE_TOKEN_URI, Map.of(), token);
        Map<String, Object> data = response != null ? (Map<String, Object>) response.get("data") : null;
        String newToken = data != null ? (String) data.get("token") : null;
        if (newToken != null) {
            this.token = newToken;
            this.lastTokenUpdateAt = System.currentTimeMillis();
            log.debug("Refreshed Dahua DSS session token");
        } else {
            log.warn("Dahua DSS token update failed, will re-login: {}", response);
            this.token = null;
        }
    }

    public void logout() {
        if (!isLoggedIn()) {
            return;
        }
        try {
            httpClient.post(LOGOUT_URI, Map.of(), token);
        } finally {
            token = null;
            credential = null;
        }
    }

    public boolean isLoggedIn() {
        return token != null;
    }

    public String requireToken() {
        if (token == null) {
            throw new IllegalStateException("Not logged in to Dahua DSS platform yet");
        }
        return token;
    }

    public String getCredential() {
        return credential;
    }
}
