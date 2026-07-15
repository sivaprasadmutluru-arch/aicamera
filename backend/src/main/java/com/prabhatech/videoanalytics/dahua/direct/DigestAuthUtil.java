package com.prabhatech.videoanalytics.dahua.direct;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * HTTP Digest authentication (RFC 2617) for the classic Dahua device CGI API
 * (DAHUA_HTTP_API_V4.04), which challenges every request with
 * {@code WWW-Authenticate: Digest realm="...", qop="auth", nonce="...", opaque="..."}.
 */
public final class DigestAuthUtil {

    private static final Pattern DIRECTIVE_PATTERN = Pattern.compile("(\\w+)=\"?([^\",]+)\"?");
    private static final SecureRandom RANDOM = new SecureRandom();

    private DigestAuthUtil() {
    }

    public static Map<String, String> parseChallenge(String wwwAuthenticateHeader) {
        Map<String, String> directives = new LinkedHashMap<>();
        if (wwwAuthenticateHeader == null) {
            return directives;
        }
        String header = wwwAuthenticateHeader.replaceFirst("(?i)^Digest\\s+", "");
        Matcher matcher = DIRECTIVE_PATTERN.matcher(header);
        while (matcher.find()) {
            directives.put(matcher.group(1), matcher.group(2));
        }
        return directives;
    }

    public static String buildAuthorizationHeader(String method, String uri, String username, String password, Map<String, String> challenge) {
        String realm = challenge.get("realm");
        String nonce = challenge.get("nonce");
        String opaque = challenge.get("opaque");
        String qop = challenge.get("qop");
        String cnonce = randomHex(16);
        String nc = "00000001";

        String ha1 = md5Hex(username + ":" + realm + ":" + password);
        String ha2 = md5Hex(method + ":" + uri);
        String response = (qop != null)
                ? md5Hex(ha1 + ":" + nonce + ":" + nc + ":" + cnonce + ":" + qop + ":" + ha2)
                : md5Hex(ha1 + ":" + nonce + ":" + ha2);

        StringBuilder header = new StringBuilder("Digest ");
        header.append("username=\"").append(username).append("\", ");
        header.append("realm=\"").append(realm).append("\", ");
        header.append("nonce=\"").append(nonce).append("\", ");
        header.append("uri=\"").append(uri).append("\", ");
        if (qop != null) {
            header.append("qop=").append(qop).append(", ");
            header.append("nc=").append(nc).append(", ");
            header.append("cnonce=\"").append(cnonce).append("\", ");
        }
        header.append("response=\"").append(response).append("\"");
        if (opaque != null) {
            header.append(", opaque=\"").append(opaque).append("\"");
        }
        return header.toString();
    }

    private static String randomHex(int bytes) {
        byte[] buf = new byte[bytes];
        RANDOM.nextBytes(buf);
        StringBuilder sb = new StringBuilder();
        for (byte b : buf) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static String md5Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("MD5 algorithm not available", e);
        }
    }
}
