package com.prabhatech.videoanalytics.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@AllArgsConstructor
public class PeriodReportResponse {
    private LocalDateTime from;
    private LocalDateTime to;
    private long totalAiEvents;
    private long totalIncidents;
    private Map<String, Long> aiEventsByType;
}
