package com.prabhatech.videoanalytics.dahua.direct;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.util.Map;

/**
 * Direct HTTP-Digest client for a single Dahua camera/NVR's classic CGI API
 * (DAHUA_HTTP_API_V4.04), used for sites where cameras are managed directly
 * rather than through the DSS VMS platform (see {@link com.prabhatech.videoanalytics.dahua.dss}).
 */
@Slf4j
@Component
public class DahuaDirectDeviceClient {

    private final HttpClient httpClient;

    public DahuaDirectDeviceClient() {
        this.httpClient = HttpClient.newBuilder()
                .sslContext(trustAllSslContext())
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /** GET /cgi-bin/snapshot.cgi?channel={channel} (section 6 - Camera APIs). */
    public byte[] captureSnapshot(String host, String username, String password, int channel) throws IOException, InterruptedException {
        String path = "/cgi-bin/snapshot.cgi?channel=" + channel;
        HttpResponse<byte[]> response = digestAuthenticatedRequest(host, path, HttpResponse.BodyHandlers.ofByteArray(), username, password);
        if (response.statusCode() != 200) {
            throw new IOException("Snapshot request failed with status " + response.statusCode());
        }
        return response.body();
    }

    /**
     * Sends a GET request to a Digest-protected Dahua CGI endpoint, handling the
     * standard challenge/response handshake (RFC 2617): the first request is
     * expected to come back 401 with a WWW-Authenticate header, which is used
     * to compute and retry with the real Authorization header.
     */
    <T> HttpResponse<T> digestAuthenticatedRequest(String host, String path, HttpResponse.BodyHandler<T> bodyHandler,
                                                    String username, String password) throws IOException, InterruptedException {
        URI uri = URI.create(host + path);
        HttpRequest challengeRequest = HttpRequest.newBuilder(uri).GET().timeout(Duration.ofSeconds(15)).build();
        HttpResponse<T> firstResponse = httpClient.send(challengeRequest, bodyHandler);

        if (firstResponse.statusCode() != 401 || username == null) {
            return firstResponse;
        }

        String wwwAuthenticate = firstResponse.headers().firstValue("WWW-Authenticate").orElse(null);
        Map<String, String> challenge = DigestAuthUtil.parseChallenge(wwwAuthenticate);
        String authorization = DigestAuthUtil.buildAuthorizationHeader("GET", path, username, password, challenge);

        HttpRequest authorizedRequest = HttpRequest.newBuilder(uri)
                .header("Authorization", authorization)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();
        return httpClient.send(authorizedRequest, bodyHandler);
    }

    private static SSLContext trustAllSslContext() {
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() {
                            return new X509Certificate[0];
                        }

                        public void checkClientTrusted(X509Certificate[] certs, String authType) {
                        }

                        public void checkServerTrusted(X509Certificate[] certs, String authType) {
                        }
                    }
            };
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAllCerts, new SecureRandom());
            return sslContext;
        } catch (Exception e) {
            log.warn("Falling back to default SSL context for direct-device client: {}", e.getMessage());
            try {
                return SSLContext.getDefault();
            } catch (Exception ex) {
                throw new IllegalStateException(ex);
            }
        }
    }
}
