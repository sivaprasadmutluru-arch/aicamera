package com.prabhatech.videoanalytics.camera.dto;

import com.prabhatech.videoanalytics.camera.entity.CameraStatus;
import com.prabhatech.videoanalytics.camera.entity.RecordingStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCameraStatusRequest {
    private CameraStatus status;
    private RecordingStatus recordingStatus;
}
