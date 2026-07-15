package com.prabhatech.videoanalytics.camera.service;

import com.prabhatech.videoanalytics.camera.dto.CameraRequest;
import com.prabhatech.videoanalytics.camera.dto.CameraResponse;
import com.prabhatech.videoanalytics.camera.dto.UpdateCameraStatusRequest;
import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.entity.CameraStatus;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.common.exception.BadRequestException;
import com.prabhatech.videoanalytics.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CameraService {

    private final CameraRepository cameraRepository;

    public List<CameraResponse> getAllCameras() {
        return cameraRepository.findAll().stream().map(CameraResponse::new).toList();
    }

    public CameraResponse getCamera(Long id) {
        return new CameraResponse(findOrThrow(id));
    }

    @Transactional
    public CameraResponse createCamera(CameraRequest request) {
        if (cameraRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("A camera with code '" + request.getCode() + "' already exists");
        }
        Camera camera = new Camera();
        applyRequest(camera, request);
        return new CameraResponse(cameraRepository.save(camera));
    }

    @Transactional
    public CameraResponse updateCamera(Long id, CameraRequest request) {
        Camera camera = findOrThrow(id);
        applyRequest(camera, request);
        return new CameraResponse(cameraRepository.save(camera));
    }

    @Transactional
    public CameraResponse updateStatus(Long id, UpdateCameraStatusRequest request) {
        Camera camera = findOrThrow(id);
        if (request.getStatus() != null) {
            camera.setStatus(request.getStatus());
            camera.setLastHeartbeatAt(LocalDateTime.now());
        }
        if (request.getRecordingStatus() != null) {
            camera.setRecordingStatus(request.getRecordingStatus());
        }
        return new CameraResponse(cameraRepository.save(camera));
    }

    @Transactional
    public void deleteCamera(Long id) {
        cameraRepository.delete(findOrThrow(id));
    }

    public long countByStatus(CameraStatus status) {
        return cameraRepository.countByStatus(status);
    }

    private void applyRequest(Camera camera, CameraRequest request) {
        camera.setName(request.getName());
        camera.setCode(request.getCode());
        camera.setIpAddress(request.getIpAddress());
        camera.setZone(request.getZone());
        camera.setDahuaDeviceId(request.getDahuaDeviceId());
        camera.setDahuaChannelId(request.getDahuaChannelId());
        camera.setAiEnabled(request.isAiEnabled());
    }

    private Camera findOrThrow(Long id) {
        return cameraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found with id: " + id));
    }
}
