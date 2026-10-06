package com.bookstore.common.util;

import java.security.SecureRandom;

/**
 * Singleton pattern: one shared generator for the 6-digit one-time codes
 * (email verification, 2FA login, password reset).
 *
 * VIVA NOTE: the old code created a new java.util.Random for every code.
 * java.util.Random is predictable, so an attacker who sees a few codes could
 * work out the next ones. This class keeps a single SecureRandom
 * (cryptographically strong and thread-safe) shared across the application.
 * getInstance() is synchronized so concurrent requests cannot create two instances.
 */
public class VerificationCodeGenerator {

    // Step 2: the single shared instance
    private static VerificationCodeGenerator instance;

    private final SecureRandom secureRandom = new SecureRandom();

    // Step 1: private constructor prevents "new VerificationCodeGenerator()" elsewhere
    private VerificationCodeGenerator() {}

    // Step 3: global access point
    public static synchronized VerificationCodeGenerator getInstance() {
        if (instance == null) {
            instance = new VerificationCodeGenerator();
        }
        return instance;
    }

    /** Returns a zero-padded 6-digit code, e.g. "042917". */
    public String generateSixDigitCode() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }
}
