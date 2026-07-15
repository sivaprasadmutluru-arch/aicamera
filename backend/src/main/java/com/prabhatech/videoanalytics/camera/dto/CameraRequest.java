package com.prabhatech.videoanalytics.camera.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CameraRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private String ipAddress;
    private String zone;
    private String dahuaDeviceId;
    private String dahuaChannelId;
    private boolean aiEnabled;
}
