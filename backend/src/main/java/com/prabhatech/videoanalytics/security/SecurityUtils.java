package com.prabhatech.videoanalytics.security;

import com.prabhatech.videoanalytics.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UserPrincipal getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("No authenticated user found");
        }
        return principal;
    }

    public static Long getCurrentUserId() {
        return getCurrentPrincipal().getId();
    }
}
