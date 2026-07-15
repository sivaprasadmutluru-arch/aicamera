package com.prabhatech.videoanalytics.user.service;

import com.prabhatech.videoanalytics.camera.entity.Camera;
import com.prabhatech.videoanalytics.camera.repository.CameraRepository;
import com.prabhatech.videoanalytics.common.exception.ResourceNotFoundException;
import com.prabhatech.videoanalytics.user.dto.AssignCamerasRequest;
import com.prabhatech.videoanalytics.user.dto.UpdateUserRequest;
import com.prabhatech.videoanalytics.user.dto.UserResponse;
import com.prabhatech.videoanalytics.user.entity.User;
import com.prabhatech.videoanalytics.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final CameraRepository cameraRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::new).toList();
    }

    public UserResponse getUser(Long id) {
        return new UserResponse(findUserOrThrow(id));
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserOrThrow(id);
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        return new UserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse assignCameras(Long id, AssignCamerasRequest request) {
        User user = findUserOrThrow(id);
        Set<Camera> cameras = new HashSet<>(cameraRepository.findAllById(request.getCameraIds()));
        user.setAssignedCameras(cameras);
        return new UserResponse(userRepository.save(user));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
