package com.prabhatech.videoanalytics.aievent.repository;

import com.prabhatech.videoanalytics.aievent.entity.AiEvent;
import com.prabhatech.videoanalytics.aievent.entity.AiEventType;
import com.prabhatech.videoanalytics.aievent.entity.EventSeverity;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public final class AiEventSpecifications {

    private AiEventSpecifications() {
    }

    public static Specification<AiEvent> withFilters(
            Long cameraId, AiEventType eventType, EventSeverity severity,
            LocalDateTime from, LocalDateTime to, Boolean acknowledged) {

        return (root, query, cb) -> {
            var predicate = cb.conjunction();
            if (cameraId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("camera").get("id"), cameraId));
            }
            if (eventType != null) {
                predicate = cb.and(predicate, cb.equal(root.get("eventType"), eventType));
            }
            if (severity != null) {
                predicate = cb.and(predicate, cb.equal(root.get("severity"), severity));
            }
            if (from != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("detectedAt"), from));
            }
            if (to != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("detectedAt"), to));
            }
            if (acknowledged != null) {
                predicate = cb.and(predicate, cb.equal(root.get("acknowledged"), acknowledged));
            }
            return predicate;
        };
    }
}
