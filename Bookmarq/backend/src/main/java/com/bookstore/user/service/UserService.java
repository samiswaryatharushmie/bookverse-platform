package com.bookstore.user.service;

import com.bookstore.user.dto.AddressDto;
import com.bookstore.user.dto.UpdateProfileRequest;
import com.bookstore.user.dto.UserDto;
import com.bookstore.user.entity.Address;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.AddressRepository;
import com.bookstore.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final com.bookstore.user.repository.RoleRepository roleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public UserDto getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        
        userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    public List<AddressDto> getUserAddresses(UUID userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto addAddress(UUID userId, AddressDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Address address = new Address();
        address.setUser(user);
        updateAddressEntity(address, request);
        
        if (request.isDefault()) {
            clearDefaultAddresses(userId);
            address.setDefault(true);
        }
        
        addressRepository.save(address);
        return mapToDto(address);
    }

    @Transactional
    public AddressDto updateAddress(UUID userId, UUID addressId, AddressDto request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
                
        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        
        updateAddressEntity(address, request);
        
        if (request.isDefault() && !address.isDefault()) {
            clearDefaultAddresses(userId);
            address.setDefault(true);
        } else if (!request.isDefault()) {
            address.setDefault(false);
        }
        
        address.setUpdatedAt(Instant.now());
        addressRepository.save(address);
        return mapToDto(address);
    }

    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
                
        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        
        addressRepository.delete(address);
    }

    private void clearDefaultAddresses(UUID userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }

    private void updateAddressEntity(Address address, AddressDto dto) {
        address.setLabel(dto.getLabel());
        address.setLine1(dto.getLine1());
        address.setLine2(dto.getLine2());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setPostalCode(dto.getPostalCode());
        address.setCountry(dto.getCountry());
    }

    private AddressDto mapToDto(Address address) {
        AddressDto dto = new AddressDto();
        dto.setId(address.getId());
        dto.setLabel(address.getLabel());
        dto.setLine1(address.getLine1());
        dto.setLine2(address.getLine2());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setDefault(address.isDefault());
        return dto;
    }

    // Admin Methods
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserDto> searchUsers(String query, String status) {
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String s = (status != null && !status.trim().isEmpty()) ? status.trim() : null;
        return userRepository.searchUsers(q, s).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUserAccount(UUID userId) {
        // Verify the user exists first
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        // Delete all dependent data in FK-safe order (pass UUID directly — MSSQL uniqueidentifier compatible)
        jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM support_tickets WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM support_tickets WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM reviews WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM carts WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM wishlist_items WHERE wishlist_id IN (SELECT id FROM wishlists WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM wishlists WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM addresses WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM user_roles WHERE user_id = ?", userId);
        
        // Delete orders and all their dependencies
        jdbcTemplate.update("DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM support_tickets WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?))", userId);
        jdbcTemplate.update("DELETE FROM support_tickets WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM orders WHERE user_id = ?", userId);
        
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId);
    }

    @Transactional
    public UserDto createStaffAccount(com.bookstore.user.dto.CreateStaffRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        for (String roleName : request.getRoles()) {
            com.bookstore.user.entity.Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
            user.addRole(role);
        }
        userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateUserRoles(UUID userId, java.util.Set<String> roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.getRoles().clear();
        for (String roleName : roles) {
            com.bookstore.user.entity.Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
            user.addRole(role);
        }
        userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    @Transactional
    public void updateUserStatus(UUID userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }
}
