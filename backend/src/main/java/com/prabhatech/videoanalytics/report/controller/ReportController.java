package com.prabhatech.videoanalytics.report.controller;

import com.prabhatech.videoanalytics.camera.dto.CameraResponse;
import com.prabhatech.videoanalytics.common.response.ApiResponse;
import com.prabhatech.videoanalytics.report.dto.PeriodReportResponse;
import com.prabhatech.videoanalytics.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> daily() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDailyReport()));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> weekly() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getWeeklyReport()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> monthly() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMonthlyReport()));
    }

    @GetMapping("/ai-events")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> aiEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAiEventsReport(from, to)));
    }

    @GetMapping("/devices")
    public ResponseEntity<ApiResponse<List<CameraResponse>>> devices() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDeviceReport()));
    }
}
