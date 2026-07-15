package com.prabhatech.videoanalytics.dahua.dss.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

/**
 * Common envelope wrapping every DSS API response: {"code": 1000, "desc": "Success", "data": {...}}.
 */
@Getter
@Setter
public class DssApiEnvelope<T> {
    public static final int SUCCESS_CODE = 1000;

    private int code;
    private String desc;
    private T data;

    public boolean isSuccess() {
        return code == SUCCESS_CODE;
    }

    public static DssApiEnvelope<Map<String, Object>> empty() {
        DssApiEnvelope<Map<String, Object>> envelope = new DssApiEnvelope<>();
        envelope.setCode(SUCCESS_CODE);
        return envelope;
    }
}
