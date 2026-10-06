package com.bookstore.user.service;

import com.bookstore.common.mail.MailService;
import com.bookstore.common.util.VerificationCodeGenerator;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.security.JwtService;
import com.bookstore.user.dto.*;
import com.bookstore.user.entity.PasswordResetToken;
import com.bookstore.user.entity.RefreshToken;
import com.bookstore.user.entity.Role;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.PasswordResetTokenRepository;
import com.bookstore.user.repository.RefreshTokenRepository;
import com.bookstore.user.repository.RoleRepository;
import com.bookstore.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;
    private final LoginSecurityService loginSecurityService;

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role userRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new IllegalStateException("Default role USER not found. Database not seeded."));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.addRole(userRole);

        String verificationCode = VerificationCodeGenerator.getInstance().generateSixDigitCode();
        user.setEmailVerificationCode(verificationCode);
        user.setEmailVerificationExpiry(Instant.now().plus(24, ChronoUnit.HOURS));

        userRepository.save(user);

        mailService.send(
                user.getEmail(),
                "Verify your Bookmarq account",
                "Welcome to Bookmarq!\n\n" +
                        "Your email verification code is: " + verificationCode + "\n\n" +
                        "This code expires in 24 hours.\n\n" +
                        "If you didn't create this account, you can safely ignore this email."
        );
    }

    @Transactional
    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }
        if (user.getEmailVerificationCode() == null || !user.getEmailVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }
        if (user.getEmailVerificationExpiry() == null || user.getEmailVerificationExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new IllegalStateException("User not found after successful authentication"));

            if (!user.isEmailVerified()) {
                throw new IllegalArgumentException("Please verify your email before logging in.");
            }

            if (user.getFailedLoginCount() > 0) {
                user.setFailedLoginCount(0);
                user.setLockedUntil(null);
                userRepository.save(user);
            }

            if (user.isTwoFactorEnabled()) {
                String code = VerificationCodeGenerator.getInstance().generateSixDigitCode();
                user.setTwoFactorCode(code);
                user.setTwoFactorExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));
                userRepository.save(user);

                mailService.send(
                        user.getEmail(),
                        "Your Bookmarq login code",
                        "Your one-time login code is: " + code + "\n\n" +
                                "This code expires in 10 minutes.\n\n" +
                                "If you didn't attempt to log in, please secure your account."
                );

                TokenResponse response = new TokenResponse();
                response.setRequires2Fa(true);
                response.setEmail(user.getEmail());
                return response;
            }

            return createTokenResponse(userDetails, user);
        } catch (Exception e) {
            loginSecurityService.recordFailedLogin(request.getEmail());
            throw e;
        }
    }

    private TokenResponse createTokenResponse(CustomUserDetails userDetails, User user) {
        String accessToken = jwtService.generateToken(userDetails);

        String rawRefreshToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(rawRefreshToken);
        
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setFamilyId(UUID.randomUUID());
        refreshToken.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);

        return new TokenResponse(accessToken, 900000L, rawRefreshToken); // 15 min
    }

    @Transactional
    public TokenResponse verifyTwoFactor(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isTwoFactorEnabled()) {
            throw new IllegalArgumentException("2FA is not enabled for this user");
        }

        if (user.getTwoFactorCode() == null || !user.getTwoFactorCode().equals(code)) {
            throw new IllegalArgumentException("Invalid 2FA code");
        }

        if (user.getTwoFactorExpiry() == null || user.getTwoFactorExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("2FA code has expired");
        }

        // Clear code after successful verification
        user.setTwoFactorCode(null);
        user.setTwoFactorExpiry(null);
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        return createTokenResponse(userDetails, user);
    }

    @Transactional
    public boolean toggleTwoFactor(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setTwoFactorEnabled(!user.isTwoFactorEnabled());
        userRepository.save(user);
        return user.isTwoFactorEnabled();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String rawCode = VerificationCodeGenerator.getInstance().generateSixDigitCode();
            String tokenHash = hashToken(rawCode);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setTokenHash(tokenHash);
            resetToken.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
            passwordResetTokenRepository.save(resetToken);

            mailService.send(
                    user.getEmail(),
                    "Reset your Bookmarq password",
                    "Your password reset code is: " + rawCode + "\n\n" +
                            "This code expires in 1 hour.\n\n" +
                            "If you didn't request a password reset, you can safely ignore this email."
            );
        });
    }

    @Transactional
    public TokenResponse refresh(String rawRefreshToken) {
        String tokenHash = hashToken(rawRefreshToken);
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            refreshTokenRepository.revokeTokenFamily(refreshToken.getFamilyId(), Instant.now());
            throw new IllegalArgumentException("Refresh token is revoked");
        }
        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token is expired");
        }

        User user = refreshToken.getUser();
        CustomUserDetails userDetails = new CustomUserDetails(user);

        String newAccessToken = jwtService.generateToken(userDetails);

        String newRawRefreshToken = UUID.randomUUID().toString();
        String newTokenHash = hashToken(newRawRefreshToken);

        refreshToken.setRevoked(true);
        refreshToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(refreshToken);

        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setUser(user);
        newRefreshToken.setTokenHash(newTokenHash);
        newRefreshToken.setFamilyId(refreshToken.getFamilyId());
        newRefreshToken.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(newRefreshToken);

        return new TokenResponse(newAccessToken, 900000L, newRawRefreshToken); // 15 min
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        String tokenHash = hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        
        // Revoke all existing sessions
        refreshTokenRepository.revokeAllUserTokens(user.getId(), Instant.now());
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect old password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke all existing sessions
        refreshTokenRepository.revokeAllUserTokens(user.getId(), Instant.now());
    }
}
