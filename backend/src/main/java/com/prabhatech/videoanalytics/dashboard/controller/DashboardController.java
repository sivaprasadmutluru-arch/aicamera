package com.prabhatech.videoanalytics.dashboard.controller;

import com.prabhatech.videoanalytics.common.response.ApiResponse;
import com.prabhatech.videoanalytics.dashboard.dto.AnalyticsDashboardResponse;
import com.prabhatech.videoanalytics.dashboard.dto.ExecutiveDashboardResponse;
import com.prabhatech.videoanalytics.dashboard.dto.OperationsDashboardResponse;
import com.prabhatech.videoanalytics.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/executive")
    public ResponseEntity<ApiResponse<ExecutiveDashboardResponse>> executive() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getExecutiveDashboard()));
    }

    @GetMapping("/operations")
    public ResponseEntity<ApiResponse<OperationsDashboardResponse>> operations() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getOperationsDashboard()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsDashboardResponse>> analytics() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAnalyticsDashboard()));
    }
}
