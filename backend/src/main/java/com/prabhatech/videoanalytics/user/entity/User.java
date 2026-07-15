package com.prabhatech.videoanalytics.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String department;

    @Column(nullable = false)
    private boolean enabled = true;

    private LocalDateTime lastLoginAt;

    /**
     * Camera-level access restriction: empty set means the user can see all cameras
     * (subject to role). Non-empty set restricts an operator/viewer to specific cameras.
     */
    @ManyToMany
    @JoinTable(
            name = "user_camera_access",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "camera_id")
    )
    private Set<Camera> assignedCameras = new HashSet<>();
}
