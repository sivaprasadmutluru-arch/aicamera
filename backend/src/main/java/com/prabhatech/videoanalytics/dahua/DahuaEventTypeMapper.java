package com.prabhatech.videoanalytics.dahua;

import com.prabhatech.videoanalytics.aievent.entity.AiEventType;

import java.util.Locale;
import java.util.Map;

/**
 * Maps raw Dahua alarm/event identifiers onto this platform's {@link AiEventType}.
 *
 * Two integration paths feed this mapper with different identifier shapes:
 * <ul>
 *   <li>DSS platform alarm callbacks (Dahua_HTTP_API_for_DSS_V8.7 section 3.6.1)
 *       carry a numeric {@code alarmType} id plus a human-readable
 *       {@code alarmTypeName}. The [6.1.7 Alarm Type] dictionary reuses the same
 *       numeric sub-category value across unrelated alarm categories (e.g. "7"
 *       means "Loitering Detection" under Intelligent Event but "Disarm" under
 *       Zones), so {@link #mapDssAlarmType} matches on the name first and only
 *       trusts the numeric id for the handful of ranges that are documented as
 *       globally unique (Open AI Event 16000000-16999999, and the Smart
 *       Object Abandoned/Missing 900002-900005 codes).</li>
 *   <li>Direct-device eventManager.cgi pushes (DAHUA_HTTP_API_V4.04 section
 *       4.9.17) carry a fixed English code string such as "CrossLineDetection"
 *       or "FireWarning", handled by {@link #mapDirectDeviceCode}.</li>
 * </ul>
 */
public final class DahuaEventTypeMapper {

    private static final Map<String, AiEventType> DIRECT_DEVICE_CODES = Map.ofEntries(
            Map.entry("videomotion", AiEventType.MOTION_DETECTION),
            Map.entry("smartmotionhuman", AiEventType.HUMAN_DETECTION),
            Map.entry("smartmotionvehicle", AiEventType.VEHICLE_DETECTION),
            Map.entry("facedetection", AiEventType.FACE_DETECTION),
            Map.entry("crosslinedetection", AiEventType.LINE_CROSSING),
            Map.entry("crossregiondetection", AiEventType.INTRUSION_DETECTION),
            Map.entry("leftdetection", AiEventType.OBJECT_ABANDONMENT),
            Map.entry("objectplacementdetection", AiEventType.OBJECT_ABANDONMENT),
            Map.entry("takenawaydetection", AiEventType.OBJECT_REMOVED),
            Map.entry("objectremovaldetection", AiEventType.OBJECT_REMOVED),
            Map.entry("wanderdetection", AiEventType.LOITERING_DETECTION),
            Map.entry("riotdetection", AiEventType.CROWD_DENSITY),
            Map.entry("riotedetection", AiEventType.CROWD_DENSITY),
            Map.entry("crowddetection", AiEventType.CROWD_DENSITY),
            Map.entry("firewarning", AiEventType.FIRE_DETECTION),
            Map.entry("firewarninginfo", AiEventType.FIRE_DETECTION),
            Map.entry("heatimagingtemper", AiEventType.FIRE_DETECTION),
            Map.entry("videoabnormaldetection", AiEventType.INTRUSION_DETECTION),
            Map.entry("alarmlocal", AiEventType.INTRUSION_DETECTION),
            Map.entry("parkingdetection", AiEventType.VEHICLE_DETECTION),
            Map.entry("movedetection", AiEventType.MOTION_DETECTION)
    );

    private DahuaEventTypeMapper() {
    }

    /** Direct-device eventManager.cgi push code, e.g. "CrossLineDetection". */
    public static AiEventType mapDirectDeviceCode(String code) {
        if (code == null) {
            return AiEventType.MOTION_DETECTION;
        }
        String key = code.toLowerCase(Locale.ROOT).replace("_", "").replace("-", "");
        return DIRECT_DEVICE_CODES.getOrDefault(key, AiEventType.MOTION_DETECTION);
    }

    /** DSS platform alarm callback: numeric alarmType id + alarmTypeName. */
    public static AiEventType mapDssAlarmType(String alarmTypeCode, String alarmTypeName) {
        Integer code = parseInt(alarmTypeCode);
        if (code != null) {
            if (code >= 16_000_000 && code <= 16_999_999) {
                return matchByName(alarmTypeName).orElse(AiEventType.MOTION_DETECTION);
            }
            switch (code) {
                case 900002, 900003 -> {
                    return AiEventType.OBJECT_ABANDONMENT;
                }
                case 900004, 900005, 577 -> {
                    return AiEventType.OBJECT_REMOVED;
                }
                case 200000 -> {
                    return AiEventType.FACE_RECOGNITION;
                }
                case 299999 -> {
                    return AiEventType.PPE_DETECTION;
                }
                case 300101, 400000, 400001 -> {
                    return AiEventType.ANPR;
                }
                default -> {
                    // fall through to name-based matching below
                }
            }
        }
        return matchByName(alarmTypeName).orElse(AiEventType.MOTION_DETECTION);
    }

    private static java.util.Optional<AiEventType> matchByName(String name) {
        if (name == null) {
            return java.util.Optional.empty();
        }
        String n = name.toLowerCase(Locale.ROOT);
        if (n.contains("intrusion")) return java.util.Optional.of(AiEventType.INTRUSION_DETECTION);
        if (n.contains("tripwire") || n.contains("cross line") || n.contains("crossline") || n.contains("line crossing")) return java.util.Optional.of(AiEventType.LINE_CROSSING);
        if (n.contains("crowd")) return java.util.Optional.of(AiEventType.CROWD_DENSITY);
        if (n.contains("area people counting") || n.contains("people counting")) return java.util.Optional.of(AiEventType.PEOPLE_COUNTING);
        if (n.contains("vehicle counting")) return java.util.Optional.of(AiEventType.VEHICLE_COUNTING);
        if (n.contains("queue")) return java.util.Optional.of(AiEventType.QUEUE_ANALYTICS);
        if (n.contains("heat map") || n.contains("heatmap")) return java.util.Optional.of(AiEventType.HEAT_MAP);
        if (n.contains("abandon") || n.contains("object placement")) return java.util.Optional.of(AiEventType.OBJECT_ABANDONMENT);
        if (n.contains("missing object") || n.contains("taken away") || n.contains("takenaway") || n.contains("object removal")) return java.util.Optional.of(AiEventType.OBJECT_REMOVED);
        if (n.contains("safety hat") || n.contains("safety helmet") || n.contains("helmet")) return java.util.Optional.of(AiEventType.HELMET_DETECTION);
        if (n.contains("reflective vest") || n.contains("ppe")) return java.util.Optional.of(AiEventType.PPE_DETECTION);
        if (n.contains("stranger") || n.contains("face arming") || n.contains("face recognition")) return java.util.Optional.of(AiEventType.FACE_RECOGNITION);
        if (n.contains("face")) return java.util.Optional.of(AiEventType.FACE_DETECTION);
        if (n.contains("smart motion human") || (n.contains("human") && n.contains("detect"))) return java.util.Optional.of(AiEventType.HUMAN_DETECTION);
        if (n.contains("smart motion vehicle") || n.contains("vehicle detect") || n.contains("vehicle status")) return java.util.Optional.of(AiEventType.VEHICLE_DETECTION);
        if (n.contains("speeding") || n.contains("unlicensed") || n.contains("anpr") || n.contains("license plate")) return java.util.Optional.of(AiEventType.ANPR);
        if (n.contains("fire")) return java.util.Optional.of(AiEventType.FIRE_DETECTION);
        if (n.contains("smoke")) return java.util.Optional.of(AiEventType.SMOKE_DETECTION);
        if (n.contains("loitering") || n.contains("wander")) return java.util.Optional.of(AiEventType.LOITERING_DETECTION);
        if (n.contains("motion")) return java.util.Optional.of(AiEventType.MOTION_DETECTION);
        return java.util.Optional.empty();
    }

    private static Integer parseInt(String value) {
        try {
            return value != null ? Integer.valueOf(value.trim()) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
