package com.prabhatech.videoanalytics.aievent.controller;

import com.prabhatech.videoanalytics.aievent.dto.AiEventRequest;
import com.prabhatech.videoanalytics.aievent.dto.AiEventResponse;
import com.prabhatech.videoanalytics.aievent.entity.AiEventType;
import com.prabhatech.videoanalytics.aievent.entity.EventSeverity;
import com.prabhatech.videoanalytics.aievent.service.AiEventService;
import com.prabhatech.videoanalytics.common.response.ApiResponse;
import com.prabhatech.videoanalytics.common.response.PageResponse;
import com.prabhatech.videoanalytics.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/ai-events")
@RequiredArgsConstructor
public class AiEventController {

    private final AiEventService aiEventService;

    @PostMapping
    public ResponseEntity<ApiResponse<AiEventResponse>> ingestEvent(@Valid @RequestBody AiEventRequest request) {
        return ResponseEntity.ok(ApiResponse.success("AI event recorded", aiEventService.ingestEvent(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AiEventResponse>>> searchEvents(
            @RequestParam(required = false) Long cameraId,
            @RequestParam(required = false) AiEventType eventType,
            @RequestParam(required = false) EventSeverity severity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Boolean acknowledged,
            @PageableDefault(size = 25) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(
                aiEventService.searchEvents(cameraId, eventType, severity, from, to, acknowledged, pageable))));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<AiEventResponse>> acknowledge(@PathVariable Long id) {
        String acknowledgedBy = SecurityUtils.getCurrentPrincipal().getEmail();
        return ResponseEntity.ok(ApiResponse.success("Event acknowledged", aiEventService.acknowledge(id, acknowledgedBy)));
    }
}
