package com.prabhatech.videoanalytics.dahua.dss;

import com.prabhatech.videoanalytics.dahua.DahuaProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.Map;

/**
 * Thin authenticated HTTP wrapper around the DSS platform's JSON REST API
 * (Dahua_HTTP_API_for_DSS_V8.7). DSS boxes are typically deployed with a
 * self-signed certificate on an internal network, matching the behaviour of
 * Dahua's own sample client code (section 6.3.1.1), so this client trusts all
 * certificates rather than requiring the operator to import the VMS cert into
 * the JVM truststore.
 *
 * Uses a buffered HttpURLConnection-based request factory (rather than the
 * JDK HttpClient) so requests are sent as plain HTTP/1.1 with an explicit
 * Content-Length, instead of a chunked body with an HTTP/2 upgrade attempt -
 * safer for talking to embedded/appliance HTTP servers.
 */
@Slf4j
@Component
public class DssHttpClient {

    private final RestClient restClient;

    public DssHttpClient(DahuaProperties properties) {
        this.restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl() != null ? properties.getBaseUrl() : "")
                .requestFactory(trustAllRequestFactory())
                .build();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> post(String uri, Object body, String token) {
        return exchange(restClient.post().uri(uri), body, token);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> put(String uri, Object body, String token) {
        return exchange(restClient.put().uri(uri), body, token);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> get(String uri, String token) {
        RestClient.RequestHeadersSpec<?> spec = restClient.get().uri(uri);
        if (token != null) {
            spec = spec.header("X-Subject-Token", token);
        }
        return spec.exchange((request, response) -> (Map<String, Object>) response.bodyTo(Map.class));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> exchange(RestClient.RequestBodySpec spec, Object body, String token) {
        if (token != null) {
            spec.header("X-Subject-Token", token);
        }
        return spec.body(body != null ? body : Map.of())
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .exchange((request, response) -> (Map<String, Object>) response.bodyTo(Map.class));
    }

    private static SimpleClientHttpRequestFactory trustAllRequestFactory() {
        SSLContext sslContext = trustAllSslContext();
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory() {
            @Override
            protected void prepareConnection(HttpURLConnection connection, String httpMethod) throws IOException {
                super.prepareConnection(connection, httpMethod);
                if (connection instanceof HttpsURLConnection https && sslContext != null) {
                    https.setSSLSocketFactory(sslContext.getSocketFactory());
                    https.setHostnameVerifier((hostname, session) -> true);
                }
            }
        };
        return factory;
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
            log.warn("Falling back to default SSL context for DSS client: {}", e.getMessage());
            return null;
        }
    }
}
