package com.prabhatech.videoanalytics.dahua.direct;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.function.BooleanSupplier;
import java.util.function.Consumer;

/**
 * Parses the {@code multipart/x-mixed-replace} event stream returned by
 * {@code GET /cgi-bin/eventManager.cgi?action=attach} (DAHUA_HTTP_API_V4.04
 * section 4.9.17), where each part looks like:
 *
 * <pre>
 * --myboundary
 * Content-Type: text/plain
 * Content-Length: 39
 *
 * Code=VideoMotion;action=Start;index=0
 * --myboundary
 * ...
 * </pre>
 *
 * This is a purpose-built reader for that specific format rather than a
 * general MIME multipart parser.
 */
public class MultipartEventStreamParser {

    public record ParsedEvent(String code, String action, String index, String data) {
    }

    public void parse(InputStream in, Consumer<ParsedEvent> onEvent, BooleanSupplier stopRequested) throws IOException {
        while (!stopRequested.getAsBoolean()) {
            String boundaryLine = readLine(in);
            if (boundaryLine == null) {
                return;
            }
            if (boundaryLine.isBlank()) {
                continue;
            }
            if (boundaryLine.startsWith("--") && boundaryLine.trim().endsWith("--")) {
                return;
            }

            int contentLength = -1;
            String line;
            while ((line = readLine(in)) != null && !line.isEmpty()) {
                if (line.toLowerCase(Locale.ROOT).startsWith("content-length:")) {
                    try {
                        contentLength = Integer.parseInt(line.substring(line.indexOf(':') + 1).trim());
                    } catch (NumberFormatException ignored) {
                        contentLength = -1;
                    }
                }
            }
            if (line == null) {
                return;
            }
            if (contentLength < 0) {
                continue;
            }

            byte[] body = readExact(in, contentLength);
            if (body == null) {
                return;
            }
            String content = new String(body, StandardCharsets.UTF_8).trim();
            readLine(in);

            if (!content.equals("Heartbeat") && !content.isBlank()) {
                parseEvent(content, onEvent);
            }
        }
    }

    private void parseEvent(String content, Consumer<ParsedEvent> onEvent) {
        int dataIdx = content.indexOf(";data=");
        String prefix = dataIdx >= 0 ? content.substring(0, dataIdx) : content;
        String data = dataIdx >= 0 ? content.substring(dataIdx + 6) : null;

        Map<String, String> fields = new LinkedHashMap<>();
        for (String part : prefix.split(";")) {
            int eq = part.indexOf('=');
            if (eq > 0) {
                fields.put(part.substring(0, eq).trim(), part.substring(eq + 1).trim());
            }
        }
        String code = fields.get("Code");
        if (code == null) {
            return;
        }
        onEvent.accept(new ParsedEvent(code, fields.get("action"), fields.get("index"), data));
    }

    private String readLine(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        int b;
        boolean any = false;
        while ((b = in.read()) != -1) {
            any = true;
            if (b == '\n') {
                if (!sb.isEmpty() && sb.charAt(sb.length() - 1) == '\r') {
                    sb.setLength(sb.length() - 1);
                }
                return sb.toString();
            }
            sb.append((char) b);
        }
        return any ? sb.toString() : null;
    }

    private byte[] readExact(InputStream in, int length) throws IOException {
        byte[] buf = new byte[length];
        int total = 0;
        while (total < length) {
            int read = in.read(buf, total, length - total);
            if (read == -1) {
                return total == 0 ? null : java.util.Arrays.copyOf(buf, total);
            }
            total += read;
        }
        return buf;
    }
}
