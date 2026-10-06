package com.bookstore.user.service;

import com.bookstore.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Records failed login attempts in their own transaction so the increment
 * survives even when the calling login flow rolls back after authentication
 * fails (a plain @Transactional method on AuthService would roll this back
 * along with everything else, since the auth failure re-throws).
 */
@Service
@RequiredArgsConstructor
public class LoginSecurityService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailedLogin(String email) {
        // A single atomic UPDATE (not load-then-save) so concurrent failed attempts
        // from the same user -- e.g. a brute-force burst -- can't race and undercount.
        userRepository.incrementFailedLoginCount(
                email, MAX_FAILED_ATTEMPTS, Instant.now().plus(LOCKOUT_MINUTES, ChronoUnit.MINUTES));
    }
}
