package com.bookstore.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private long expiresIn;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String refreshToken;

    private boolean requires2Fa;
    private String email;

    public TokenResponse(String accessToken, long expiresIn, String refreshToken) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.refreshToken = refreshToken;
        this.requires2Fa = false;
    }
}
