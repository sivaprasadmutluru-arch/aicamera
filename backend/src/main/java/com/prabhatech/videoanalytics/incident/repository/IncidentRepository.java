package com.prabhatech.videoanalytics.incident.repository;

import com.prabhatech.videoanalytics.incident.entity.Incident;
import com.prabhatech.videoanalytics.incident.entity.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    Page<Incident> findByStatus(IncidentStatus status, Pageable pageable);
    long countByStatus(IncidentStatus status);
    long countByStatusNotIn(java.util.Collection<IncidentStatus> statuses);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT i.priority, COUNT(i) FROM Incident i GROUP BY i.priority")
    List<Object[]> countGroupByPriority();
}
