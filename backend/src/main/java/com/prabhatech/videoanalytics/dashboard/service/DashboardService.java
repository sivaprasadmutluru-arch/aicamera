package com.prabhatech.videoanalytics.dashboard.service;

import com.prabhatech.videoanalytics.aievent.dto.AiEventResponse;
import com.prabhatech.videoanalytics.aievent.repository.AiEventRepository;
import com.prabhatech.videoanalytics.camera.dto.CameraResponse;
import com.prabhatech.videoanalytics.camera.entity.CameraStatus;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.dashboard.dto.AnalyticsDashboardResponse;
import com.prabhatech.videoanalytics.dashboard.dto.ExecutiveDashboardResponse;
import com.prabhatech.videoanalytics.dashboard.dto.OperationsDashboardResponse;
import com.prabhatech.videoanalytics.incident.repository.IncidentRepository;
import com.prabhatech.videoanalytics.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final CameraRepository cameraRepository;
    private final AiEventRepository aiEventRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public ExecutiveDashboardResponse getExecutiveDashboard() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long total = cameraRepository.count();
        long online = cameraRepository.countByStatus(CameraStatus.ONLINE);
        long offline = cameraRepository.countByStatus(CameraStatus.OFFLINE);
        long eventsToday = aiEventRepository.countByDetectedAtBetween(startOfDay, endOfDay);
        long activeIncidents = incidentRepository.countByStatusNotIn(
                java.util.List.of(com.prabhatech.videoanalytics.incident.entity.IncidentStatus.RESOLVED,
                        com.prabhatech.videoanalytics.incident.entity.IncidentStatus.CLOSED));

        return new ExecutiveDashboardResponse(total, online, offline, eventsToday, activeIncidents, eventsToday, userRepository.count());
    }

    public OperationsDashboardResponse getOperationsDashboard() {
        var cameras = cameraRepository.findAll().stream().map(CameraResponse::new).toList();
        var recentEvents = aiEventRepository
                .findAll(PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "detectedAt")))
                .map(AiEventResponse::new)
                .getContent();
        return new OperationsDashboardResponse(cameras, recentEvents);
    }

    public AnalyticsDashboardResponse getAnalyticsDashboard() {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        Map<String, Long> eventsByType = new LinkedHashMap<>();
        for (Object[] row : aiEventRepository.countGroupByEventType(startOfMonth, now)) {
            eventsByType.put(row[0].toString(), (Long) row[1]);
        }

        Map<String, Long> incidentsByStatus = new LinkedHashMap<>();
        for (Object[] row : incidentRepository.countGroupByStatus()) {
            incidentsByStatus.put(row[0].toString(), (Long) row[1]);
        }

        Map<String, Long> incidentsByPriority = new LinkedHashMap<>();
        for (Object[] row : incidentRepository.countGroupByPriority()) {
            incidentsByPriority.put(row[0].toString(), (Long) row[1]);
        }

        return new AnalyticsDashboardResponse(eventsByType, incidentsByStatus, incidentsByPriority);
    }
}
