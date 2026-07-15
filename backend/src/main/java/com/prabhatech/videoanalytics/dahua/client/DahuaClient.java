package com.prabhatech.videoanalytics.dahua.client;

import com.prabhatech.videoanalytics.dahua.dto.DahuaDeviceDto;

import java.util.List;

public interface DahuaClient {

    /** Authenticates against the Dahua VMS REST API and returns a session token. */
    String login();

    /** Retrieves the current list of registered cameras/channels from the VMS. */
    List<DahuaDeviceDto> fetchDevices(String sessionToken);
}
