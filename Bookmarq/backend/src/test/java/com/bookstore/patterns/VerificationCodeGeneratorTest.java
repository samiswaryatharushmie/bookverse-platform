package com.bookstore.patterns;

import com.bookstore.common.util.VerificationCodeGenerator;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class VerificationCodeGeneratorTest {

    @Test
    void alwaysReturnsSameInstance() {
        assertSame(VerificationCodeGenerator.getInstance(), VerificationCodeGenerator.getInstance());
    }

    @Test
    void codesAreSixDigitsAndVary() {
        Set<String> codes = new HashSet<>();
        for (int i = 0; i < 1000; i++) {
            String code = VerificationCodeGenerator.getInstance().generateSixDigitCode();
            assertTrue(code.matches("[0-9]{6}"), "Not a 6-digit code: " + code);
            codes.add(code);
        }
        assertTrue(codes.size() > 950, "Codes should be random, got only " + codes.size() + " distinct");
    }
}
