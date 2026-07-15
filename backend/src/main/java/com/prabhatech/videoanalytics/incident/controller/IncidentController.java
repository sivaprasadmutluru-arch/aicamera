package com.prabhatech.videoanalytics.incident.controller;

import com.prabhatech.videoanalytics.common.response.ApiResponse;
import com.prabhatech.videoanalytics.common.response.PageResponse;
import com.prabhatech.videoanalytics.incident.dto.IncidentRequest;
import com.prabhatech.videoanalytics.incident.dto.IncidentResponse;
import com.prabhatech.videoanalytics.incident.dto.ResolveIncidentRequest;
import com.prabhatech.videoanalytics.incident.entity.IncidentStatus;
import com.prabhatech.videoanalytics.incident.service.IncidentService;
import com.prabhatech.videoanalytics.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    public ResponseEntity<ApiResponse<IncidentResponse>> createIncident(@Valid @RequestBody IncidentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Incident created", incidentService.createIncident(request, userId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<IncidentResponse>>> getIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @PageableDefault(size = 25) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(incidentService.getIncidents(status, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncident(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getIncident(id)));
    }

    @PatchMapping("/{id}/assign/{userId}")
    public ResponseEntity<ApiResponse<IncidentResponse>> assign(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Incident assigned", incidentService.assign(id, userId)));
    }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<ApiResponse<IncidentResponse>> updateStatus(
            @PathVariable Long id, @PathVariable IncidentStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Incident status updated", incidentService.updateStatus(id, status)));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<IncidentResponse>> resolve(
            @PathVariable Long id, @RequestBody ResolveIncidentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Incident resolved", incidentService.resolve(id, request)));
    }
}
