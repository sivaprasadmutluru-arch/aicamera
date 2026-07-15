package com.prabhatech.videoanalytics.auth;

import com.prabhatech.videoanalytics.audit.service.AuditService;
import com.prabhatech.videoanalytics.auth.dto.AuthResponse;
import com.prabhatech.videoanalytics.auth.dto.ForgotPasswordRequest;
import com.prabhatech.videoanalytics.auth.dto.LoginRequest;
import com.prabhatech.videoanalytics.auth.dto.RegisterRequest;
import com.prabhatech.videoanalytics.common.exception.BadRequestException;
import com.prabhatech.videoanalytics.security.UserPrincipal;
import com.prabhatech.videoanalytics.security.jwt.JwtService;
import com.prabhatech.videoanalytics.user.entity.Role;
import com.prabhatech.videoanalytics.user.entity.User;
import com.prabhatech.videoanalytics.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("A user with this email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.VIEWER);
        user.setDepartment(request.getDepartment());
        user.setEnabled(true);
        userRepository.save(user);

        auditService.log(user, "USER_REGISTERED", "User", user.getId(), "New user registered: " + user.getEmail());

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        auditService.log(user, "USER_LOGIN", "User", user.getId(), "User logged in: " + user.getEmail());

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user ->
                auditService.log(user, "PASSWORD_RESET_REQUESTED", "User", user.getId(),
                        "Password reset requested: " + user.getEmail()));
    }
}

