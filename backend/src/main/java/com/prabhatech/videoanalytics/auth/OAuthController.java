package com.prabhatech.videoanalytics.auth;

import com.prabhatech.videoanalytics.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oauth2/authorization")
@RequiredArgsConstructor
public class OAuthController {

    @GetMapping("/{provider}")
    public ResponseEntity<Void> authorize(@PathVariable String provider) {
        if (!provider.equals("google") && !provider.equals("microsoft")) {
            throw new BadRequestException("Unsupported OAuth provider: " + provider);
        }
        throw new BadRequestException("OAuth sign-in for " + provider + " is not configured yet. Add provider credentials on the backend to enable it.");
    }
}
