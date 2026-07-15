package com.prabhatech.videoanalytics.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ExecutiveDashboardResponse {
    private long totalCameras;
    private long onlineCameras;
    private long offlineCameras;
    private long aiEventsToday;
    private long activeIncidents;
    private long alertsToday;
    private long totalUsers;
}
