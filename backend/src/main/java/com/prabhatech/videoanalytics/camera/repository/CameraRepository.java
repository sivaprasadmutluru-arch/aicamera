package com.prabhatech.videoanalytics.camera.repository;

import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.entity.CameraStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CameraRepository extends JpaRepository<Camera, Long> {
    Optional<Camera> findByCode(String code);
    Optional<Camera> findByDahuaChannelId(String dahuaChannelId);
    long countByStatus(CameraStatus status);
}
