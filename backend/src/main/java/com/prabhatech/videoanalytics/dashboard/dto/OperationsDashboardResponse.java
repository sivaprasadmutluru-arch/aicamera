package com.prabhatech.videoanalytics.dashboard.dto;

import com.prabhatech.videoanalytics.aievent.dto.AiEventResponse;
import com.prabhatech.videoanalytics.camera.dto.CameraResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class OperationsDashboardResponse {
    private List<CameraResponse> cameras;
    private List<AiEventResponse> recentEvents;
}
