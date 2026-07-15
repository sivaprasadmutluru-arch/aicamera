package com.prabhatech.videoanalytics.dahua.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Shape of a device/channel record as returned by the Dahua VMS device API.
 * Field names follow the generic Dahua REST/ICC convention; adjust to match
 * the exact VMS/DSS/ICC product variant deployed at the client site.
 */
@Getter
@Setter
public class DahuaDeviceDto {
    private String deviceId;
    private String deviceName;
    private String channelId;
    private String channelName;
    private String ipAddress;
    private String status;
}
