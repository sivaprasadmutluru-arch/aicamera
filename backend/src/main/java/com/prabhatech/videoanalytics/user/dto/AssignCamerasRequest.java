package com.prabhatech.videoanalytics.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class AssignCamerasRequest {

    @NotNull
    private Set<Long> cameraIds;
}
