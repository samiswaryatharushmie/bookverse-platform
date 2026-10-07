package com.bookstore;

import com.bookstore.security.JwtService;
import com.bookstore.user.dto.LoginRequest;
import com.bookstore.user.entity.Role;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.RoleRepository;
import com.bookstore.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private String userToken;

    @BeforeEach
    void setup() {
        userRepository.findByEmail("test@customer.com").ifPresent(userRepository::delete);

        Role userRole = roleRepository.findByName("USER").orElseGet(() -> {
            Role r = new Role();
            r.setName("USER");
            return roleRepository.save(r);
        });

        testUser = new User();
        testUser.setEmail("test@customer.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setPasswordHash(passwordEncoder.encode("Password123!"));
        testUser.addRole(userRole);
        testUser = userRepository.save(testUser);

        com.bookstore.security.CustomUserDetails userDetails = new com.bookstore.security.CustomUserDetails(testUser);
        userToken = jwtService.generateToken(userDetails);
    }

    @Test
    void customerCannotReachAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void lockedAccountCannotLogIn() throws Exception {
        // Lock the account manually
        testUser.setFailedLoginCount(5);
        testUser.setLockedUntil(Instant.now().plus(15, ChronoUnit.MINUTES));
        userRepository.save(testUser);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@customer.com");
        loginRequest.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().is(423)); // Should fail with 423 LOCKED because account is locked
    }
}
