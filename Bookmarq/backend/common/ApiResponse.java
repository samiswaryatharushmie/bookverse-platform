package com.bookstore.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * Standard API response wrapper.
 *
 * <p>Every endpoint returns this structure for consistency.
 * Error responses use the {@code error} and {@code details} fields
 * while successful responses populate {@code data}.</p>
 *
 * @param <T> the type of the response payload
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private String error;
    private Object details;
    private Instant timestamp;

    public ApiResponse() {
        this.timestamp = Instant.now();
    }

    public ApiResponse(boolean success, String message, T data, String error, Object details) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
        this.details = details;
        this.timestamp = Instant.now();
    }

    // ── Getters and Setters ──────────────────────────────────

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public Object getDetails() { return details; }
    public void setDetails(Object details) { this.details = details; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    // ── Static factories ─────────────────────────────────────

    /** Convenience factory for success responses. */
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.data = data;
        return response;
    }

    /** Convenience factory for success responses with a message. */
    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.data = data;
        response.message = message;
        return response;
    }

    /** Convenience factory for error responses. */
    public static <T> ApiResponse<T> error(String error, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.error = error;
        response.message = message;
        return response;
    }

    /** Convenience factory for error responses with details. */
    public static <T> ApiResponse<T> error(String error, String message, Object details) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.error = error;
        response.message = message;
        response.details = details;
        return response;
    }
}
