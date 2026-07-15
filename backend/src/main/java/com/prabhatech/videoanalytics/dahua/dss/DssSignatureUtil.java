package com.prabhatech.videoanalytics.dahua.dss;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Implements the 5-round MD5 login signature described in
 * "Dahua_HTTP_API_for_DSS_V8.7" section 5.1.1 (Get Authentication Token):
 *
 * <pre>
 * temp1 = md5(password)
 * temp2 = md5(userName + temp1)
 * temp3 = md5(temp2)
 * temp4 = md5(userName + ":" + realm + ":" + temp3)
 * signature = md5(temp4 + ":" + randomKey)
 * </pre>
 */
public final class DssSignatureUtil {

    private DssSignatureUtil() {
    }

    public static String generateSignature(String userName, String password, String realm, String randomKey) {
        String temp1 = md5Hex(password);
        String temp2 = md5Hex(userName + temp1);
        String temp3 = md5Hex(temp2);
        String temp4 = md5Hex(userName + ":" + realm + ":" + temp3);
        return md5Hex(temp4 + ":" + randomKey);
    }

    public static String md5Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 algorithm not available", e);
        }
    }
}
