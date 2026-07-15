package com.prabhatech.videoanalytics.user.dto;

import com.prabhatech.videoanalytics.user.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
public class UserResponse {
    private final Long id;
    private final String fullName;
    private final String email;
    private final String role;
    private final String department;
    private final boolean enabled;
    private final LocalDateTime lastLoginAt;
    private final Set<Long> assignedCameraIds;

    public UserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.department = user.getDepartment();
        this.enabled = user.isEnabled();
        this.lastLoginAt = user.getLastLoginAt();
        this.assignedCameraIds = user.getAssignedCameras().stream()
                .map(camera -> camera.getId())
                .collect(Collectors.toSet());
    }
}
