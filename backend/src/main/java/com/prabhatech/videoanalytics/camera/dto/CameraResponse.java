package com.prabhatech.videoanalytics.camera.dto;

import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.entity.CameraStatus;
import com.prabhatech.videoanalytics.camera.entity.RecordingStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CameraResponse {
    private final Long id;
    private final String name;
    private final String code;
    private final String ipAddress;
    private final String zone;
    private final String dahuaDeviceId;
    private final String dahuaChannelId;
    private final CameraStatus status;
    private final RecordingStatus recordingStatus;
    private final boolean aiEnabled;
    private final LocalDateTime lastHeartbeatAt;

    public CameraResponse(Camera camera) {
        this.id = camera.getId();
        this.name = camera.getName();
        this.code = camera.getCode();
        this.ipAddress = camera.getIpAddress();
        this.zone = camera.getZone();
        this.dahuaDeviceId = camera.getDahuaDeviceId();
        this.dahuaChannelId = camera.getDahuaChannelId();
        this.status = camera.getStatus();
        this.recordingStatus = camera.getRecordingStatus();
        this.aiEnabled = camera.isAiEnabled();
        this.lastHeartbeatAt = camera.getLastHeartbeatAt();
    }
}
