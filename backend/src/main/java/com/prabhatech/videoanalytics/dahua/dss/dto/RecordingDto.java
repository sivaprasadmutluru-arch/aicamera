package com.prabhatech.videoanalytics.dahua.dss.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * One result from the DSS recording search (Dahua_HTTP_API_for_DSS_V8.7
 * section 3.5.1 - Search Recording). {@code recordSource}, {@code recordType},
 * and {@code streamId} must be echoed back unchanged when requesting the
 * playback URL for this recording (section 3.5.4).
 */
@Getter
@AllArgsConstructor
public class RecordingDto {
    private String channelId;
    private String recordSource;
    private String recordType;
    private String streamId;
    private long startTime;
    private long endTime;
    private String recordName;
}
