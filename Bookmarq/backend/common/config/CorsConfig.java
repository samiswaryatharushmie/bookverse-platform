package com.bookstore.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration — explicit origin allowlist, no wildcards.
 *
 * <p>Allowed origins are read from the {@code app.cors.allowed-origins}
 * property (comma-separated). Credentials are enabled for the
 * cookie-based refresh token flow.</p>
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Explicit origin allowlist — never use wildcard with credentials
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "X-Requested-With",
                "Accept", "Origin", "X-CSRF-TOKEN", "X-Idempotency-Key"));

        configuration.setExposedHeaders(List.of(
                "Authorization", "X-Total-Count", "X-Total-Pages"));

        // Required for HttpOnly cookie-based refresh tokens
        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
