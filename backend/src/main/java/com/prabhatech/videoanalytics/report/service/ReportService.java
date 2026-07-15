package com.prabhatech.videoanalytics.report.service;

import com.prabhatech.videoanalytics.aievent.repository.AiEventRepository;
import com.prabhatech.videoanalytics.camera.dto.CameraResponse;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.incident.repository.IncidentRepository;
import com.prabhatech.videoanalytics.report.dto.PeriodReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AiEventRepository aiEventRepository;
    private final IncidentRepository incidentRepository;
    private final CameraRepository cameraRepository;

    public PeriodReportResponse getDailyReport() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        return buildReport(start, LocalDateTime.now());
    }

    public PeriodReportResponse getWeeklyReport() {
        LocalDateTime start = LocalDate.now().minusDays(6).atStartOfDay();
        return buildReport(start, LocalDateTime.now());
    }

    public PeriodReportResponse getMonthlyReport() {
        LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        return buildReport(start, LocalDateTime.now());
    }

    public PeriodReportResponse getAiEventsReport(LocalDateTime from, LocalDateTime to) {
        return buildReport(from, to);
    }

    public List<CameraResponse> getDeviceReport() {
        return cameraRepository.findAll().stream().map(CameraResponse::new).toList();
    }

    private PeriodReportResponse buildReport(LocalDateTime from, LocalDateTime to) {
        long totalAiEvents = aiEventRepository.countByDetectedAtBetween(from, to);
        long totalIncidents = incidentRepository.countByCreatedAtBetween(from, to);

        Map<String, Long> byType = new LinkedHashMap<>();
        for (Object[] row : aiEventRepository.countGroupByEventType(from, to)) {
            byType.put(row[0].toString(), (Long) row[1]);
        }

        return new PeriodReportResponse(from, to, totalAiEvents, totalIncidents, byType);
    }
}
