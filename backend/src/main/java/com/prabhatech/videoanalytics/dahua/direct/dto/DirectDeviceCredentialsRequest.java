package com.prabhatech.videoanalytics.dahua.direct.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Credentials for a direct camera/NVR CGI connection, supplied per-request
 * rather than persisted (the Camera entity does not store device passwords).
 */
@Getter
@Setter
public class DirectDeviceCredentialsRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    /** Video channel number for snapshot capture; defaults to 1. */
    private int channel = 1;
}
