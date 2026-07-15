package com.prabhatech.videoanalytics.incident.dto;

import com.prabhatech.videoanalytics.incident.entity.IncidentPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IncidentRequest {

    @NotBlank
    private String title;

    private String description;

    private Long cameraId;

    private IncidentPriority priority = IncidentPriority.MEDIUM;
}
