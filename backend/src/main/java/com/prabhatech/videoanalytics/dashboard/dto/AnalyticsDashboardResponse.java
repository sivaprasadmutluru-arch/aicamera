package com.prabhatech.videoanalytics.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class AnalyticsDashboardResponse {
    private Map<String, Long> aiEventsByType;
    private Map<String, Long> incidentsByStatus;
    private Map<String, Long> incidentsByPriority;
}
