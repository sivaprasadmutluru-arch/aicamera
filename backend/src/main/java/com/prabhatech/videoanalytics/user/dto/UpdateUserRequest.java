package com.prabhatech.videoanalytics.user.dto;

import com.prabhatech.videoanalytics.user.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {
    private String fullName;
    private Role role;
    private String department;
    private Boolean enabled;
}
