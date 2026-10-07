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
@RequestMapping("/api/staff/tickets")
@RequiredArgsConstructor
public class StaffSupportController {

    private final SupportService supportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketDto>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success(supportService.getAllTickets()));
    }

    @GetMapping("/{ticketId}/replies")
    public ResponseEntity<ApiResponse<List<TicketReplyDto>>> getTicketReplies(
            @PathVariable UUID ticketId) {
        return ResponseEntity.ok(ApiResponse.success(supportService.getTicketReplies(ticketId)));
    }

    @PostMapping("/{ticketId}/replies")
    public ResponseEntity<ApiResponse<TicketReplyDto>> addStaffReply(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID ticketId,
            @Valid @RequestBody CreateReplyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(supportService.addReply(ticketId, userDetails.getId(), request, true)));
    }

    @PutMapping("/{ticketId}/status")
    public ResponseEntity<ApiResponse<TicketDto>> updateTicketStatus(
            @PathVariable UUID ticketId,
            @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(supportService.updateTicketStatus(ticketId, request)));
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable UUID ticketId) {
        supportService.deleteTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(null, "Ticket deleted successfully"));
    }
}
