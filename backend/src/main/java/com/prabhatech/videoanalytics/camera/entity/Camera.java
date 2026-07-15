package com.prabhatech.videoanalytics.camera.entity;

import com.prabhatech.videoanalytics.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "cameras")
public class Camera extends BaseEntity {

    @Column(nullable = false)
    private String name;

    /** Unique identifier / channel code as registered in the Dahua VMS. */
    @Column(nullable = false, unique = true)
    private String code;

    private String ipAddress;

    private String zone;

    /** Device id of the parent NVR/DSS as known to Dahua VMS, if any. */
    private String dahuaDeviceId;

    private String dahuaChannelId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CameraStatus status = CameraStatus.OFFLINE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordingStatus recordingStatus = RecordingStatus.NOT_RECORDING;

    private boolean aiEnabled = false;

    private LocalDateTime lastHeartbeatAt;
}
