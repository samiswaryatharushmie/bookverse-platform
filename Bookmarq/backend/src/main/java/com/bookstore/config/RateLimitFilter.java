package com.bookstore.config;

import com.bookstore.common.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private Bucket createNewBucket() {
        // 10 requests per minute
        Bandwidth limit = Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket resolveBucket(String ip) {
        return cache.computeIfAbsent(ip, k -> createNewBucket());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        String path = request.getRequestURI();
        // /api/auth/refresh (and logout) are not credential-guessing attack surfaces -- refresh
        // requires an already-valid HttpOnly refresh-token cookie, and fires automatically on
        // every full page load/navigation when no in-memory access token is present. Counting it
        // against the same brute-force bucket as login/register can lock a legitimate, actively
        // browsing user out of their own session after nothing more than routine navigation.
        boolean isRateLimited = path.startsWith("/api/auth/")
                && !path.equals("/api/auth/refresh")
                && !path.equals("/api/auth/logout");
        if (isRateLimited) {
            // Use the socket address only. X-Forwarded-For is set by the client, so trusting it
            // would let an attacker send a different fake IP on every request and never hit the limit.
            // If the app is later deployed behind a reverse proxy, set
            // server.forward-headers-strategy=native so getRemoteAddr() returns the real client IP
            // taken from the proxy's headers.
            String ip = request.getRemoteAddr();

            Bucket bucket = resolveBucket(ip);
            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                ApiResponse<Void> body = ApiResponse.error("RATE_LIMITED", "Too many requests. Please wait a moment and try again.");
                response.getWriter().write(objectMapper.writeValueAsString(body));
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
