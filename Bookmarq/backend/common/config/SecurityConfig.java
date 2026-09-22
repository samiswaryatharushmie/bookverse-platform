package com.bookstore.common.config;

import com.bookstore.common.security.JwtAuthFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import lombok.RequiredArgsConstructor;

/**
 * Security configuration — default-deny posture.
 *
 * <p>Implements IEEE/ACM Ethics Principle 6 (profession): follows OWASP
 * best practices for authentication, session management, and security headers.</p>
 *
 * <p>Phase 1 allows only health check and Swagger endpoints.
 * Each module will register its own endpoint permissions as it is built.</p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /** Public endpoints that do not require authentication. */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/actuator/health",
            "/actuator/info",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "/webjars/**"
    };

    /** Public read-only endpoints (GET only). */
    private static final String[] PUBLIC_GET_ENDPOINTS = {
            "/api/books/**",
            "/api/categories/**",
            "/api/authors/**",
            "/api/banners/**",
            "/api/reviews/**",
            "/api/promotions/active-banner",
            "/api/admin/inventory/*/stock",
            "/uploads/**"
    };

    /** Auth endpoints (register, login, refresh, password reset). */
    private static final String[] AUTH_ENDPOINTS = {
            "/api/auth/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Stateless JWT — no HTTP sessions
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // CSRF: disabled for stateless JWT endpoints.
                // Will be selectively enabled for the cookie-based refresh endpoint in Phase 2.
                .csrf(AbstractHttpConfigurer::disable)

                // Security headers — OWASP recommended
                .headers(headers -> headers
                        .contentTypeOptions(contentType -> {})  // X-Content-Type-Options: nosniff
                        .frameOptions(frame -> frame.deny())     // X-Frame-Options: DENY
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000))       // HSTS: 1 year
                        .referrerPolicy(referrer ->
                                referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        .contentSecurityPolicy(csp ->
                                csp.policyDirectives(
                                        "default-src 'self' http://localhost:8080; " +
                                        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                                        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                                        "font-src 'self' https://fonts.gstatic.com; " +
                                        "img-src 'self' data: blob: http://localhost:8080 https://placehold.co https://covers.openlibrary.org; " +
                                        "connect-src 'self' http://localhost:8080; " +
                                        "frame-ancestors 'none'"))
                )

                // Authorization rules — default deny
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(AUTH_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                        .requestMatchers("/api/newsletter/subscribe").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/restock-notifications").permitAll()

                        // Admin endpoints
                        .requestMatchers("/api/admin/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "STAFF")

                        // Staff endpoints
                        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * BCrypt password encoder with strength 12.
     * Higher strength = more computation = more resistant to brute force.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
}
