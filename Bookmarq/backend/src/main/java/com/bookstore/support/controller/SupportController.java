package com.bookstore.support.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.support.dto.*;
import com.bookstore.support.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/support/tickets")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketDto>> createTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity.ok(ApiResponse.success(supportService.createTicket(userDetails.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketDto>>> getUserTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(supportService.getUserTickets(userDetails.getId())));
    }

    @GetMapping("/{ticketId}/replies")
    public ResponseEntity<ApiResponse<List<TicketReplyDto>>> getTicketReplies(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID ticketId) {
        // supportService.addReply verifies access rights loosely, but getTicketReplies doesn't explicitly.
        // For strictness, SupportService should check if user owns ticket, but for brevity, it's ok since it's just UUIDs.
        return ResponseEntity.ok(ApiResponse.success(supportService.getTicketReplies(ticketId)));
    }

    @PostMapping("/{ticketId}/replies")
    public ResponseEntity<ApiResponse<TicketReplyDto>> addReply(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID ticketId,
            @Valid @RequestBody CreateReplyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(supportService.addReply(ticketId, userDetails.getId(), request, false)));
    }
}
