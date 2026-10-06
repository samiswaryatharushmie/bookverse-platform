package com.bookstore.user.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.user.dto.*;
import com.bookstore.user.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered. Please check your email for your verification code."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@Valid @RequestBody Verify2FaRequest request) {
        // Reusing Verify2FaRequest since it has email and code fields
        authService.verifyEmail(request.getEmail(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokens = authService.login(request);

        if (tokens.isRequires2Fa()) {
            return ResponseEntity.ok()
                    .body(ApiResponse.success(tokens, "2FA required"));
        }

        ResponseCookie cookie = buildCookie(tokens.getRefreshToken(), 7 * 24 * 60 * 60);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(tokens, "Login successful"));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<ApiResponse<TokenResponse>> verifyTwoFactor(@Valid @RequestBody Verify2FaRequest request) {
        TokenResponse tokens = authService.verifyTwoFactor(request.getEmail(), request.getCode());

        ResponseCookie cookie = buildCookie(tokens.getRefreshToken(), 7 * 24 * 60 * 60);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(tokens, "Login successful"));
    }

    @PostMapping("/toggle-2fa")
    public ResponseEntity<ApiResponse<Boolean>> toggleTwoFactor(@AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isEnabled = authService.toggleTwoFactor(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(isEnabled, "2FA status updated"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(HttpServletRequest request) {
        String refreshToken = extractRefreshToken(request);
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("UNAUTHORIZED", "Refresh token missing"));
        }

        try {
            TokenResponse tokens = authService.refresh(refreshToken);
            ResponseCookie cookie = buildCookie(tokens.getRefreshToken(), 7 * 24 * 60 * 60);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(ApiResponse.success(tokens, "Token refreshed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("UNAUTHORIZED", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        String refreshToken = extractRefreshToken(request);
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        ResponseCookie cookie = buildCookie("", 0); // Clear cookie
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success("Logout successful"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("If the email is registered, a 6-digit password reset code has been printed to the terminal."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    private String extractRefreshToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            Optional<Cookie> cookie = Arrays.stream(request.getCookies())
                    .filter(c -> "refresh_token".equals(c.getName()))
                    .findFirst();
            if (cookie.isPresent()) {
                return cookie.get().getValue();
            }
        }
        return null;
    }

    private ResponseCookie buildCookie(String token, long maxAgeSecs) {
        return ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(false) // For local development
                .path("/api/auth/refresh")
                .maxAge(maxAgeSecs)
                .sameSite("Strict")
                .build();
    }
}
