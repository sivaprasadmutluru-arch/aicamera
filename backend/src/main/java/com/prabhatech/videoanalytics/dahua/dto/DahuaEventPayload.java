package com.prabhatech.videoanalytics.dahua.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Real callback payload pushed by the DSS platform's alarm subscription
 * (Dahua_HTTP_API_for_DSS_V8.7 section 3.6.1 - Subscribe to Alarms):
 *
 * <pre>
 * POST callbackUrl
 * {
 *   "callbackType": 1,
 *   "alarmCode": "...", "sourceCode": "...", "sourceName": "...",
 *   "alarmType": "964", "alarmTypeName": "Intrusion(Human)",
 *   "alarmGrade": "1", "alarmStatus": "1", "alarmTime": 1700000000,
 *   "alarmPictures": ["<base64>"], "remark": "...", "eventRemark": "...",
 *   "extData": "{...}", "signature": "..."
 * }
 * </pre>
 *
 * callbackType=1 is the main alarm body; callbackType=2 is an asynchronous
 * linked-image follow-up carrying only alarmCode + alarmPictures.
 */
@Getter
@Setter
public class DahuaEventPayload {
    private Integer callbackType;
    private String alarmCode;
    /** Channel code, format deviceCode$unit$0$index, e.g. "1000001$1$0$0". */
    private String sourceCode;
    private String sourceName;
    /** Numeric alarm type id as a string; see [6.1.7 Alarm Type] dictionary. */
    private String alarmType;
    private String alarmTypeName;
    /** Alarm level: 1 = High, 2 = Medium, 3 = Low. */
    private String alarmGrade;
    /** Alarm status: 1 = Alarm generated, 2 = Alarm cleared. */
    private String alarmStatus;
    /** Unix epoch seconds. */
    private Long alarmTime;
    /** Base64-encoded snapshot images. */
    private List<String> alarmPictures;
    private String remark;
    private String eventRemark;
    private String extData;
    private String signature;
}
