package com.prabhatech.videoanalytics.aievent.repository;

import com.prabhatech.videoanalytics.aievent.entity.AiEvent;
import com.prabhatech.videoanalytics.aievent.entity.AiEventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface AiEventRepository extends JpaRepository<AiEvent, Long>, JpaSpecificationExecutor<AiEvent> {

    long countByDetectedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByEventTypeAndDetectedAtBetween(AiEventType eventType, LocalDateTime start, LocalDateTime end);

    Page<AiEvent> findByCameraIdOrderByDetectedAtDesc(Long cameraId, Pageable pageable);

    @Query("SELECT e.eventType, COUNT(e) FROM AiEvent e WHERE e.detectedAt BETWEEN :start AND :end GROUP BY e.eventType")
    List<Object[]> countGroupByEventType(LocalDateTime start, LocalDateTime end);
}
