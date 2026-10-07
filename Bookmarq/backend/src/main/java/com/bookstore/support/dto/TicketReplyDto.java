package com.bookstore.support.dto;

import com.bookstore.support.entity.TicketReply;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class TicketReplyDto {
    private UUID id;
    private UUID ticketId;
    private UUID userId;
    private String userName;
    private String message;
    private boolean isStaffReply;
    private Instant createdAt;

    public static TicketReplyDto fromEntity(TicketReply reply) {
        TicketReplyDto dto = new TicketReplyDto();
        dto.setId(reply.getId());
        dto.setTicketId(reply.getTicket().getId());
        dto.setUserId(reply.getUser().getId());
        dto.setUserName(reply.getUser().getFirstName() + " " + reply.getUser().getLastName());
        dto.setMessage(reply.getMessage());
        dto.setStaffReply(reply.isStaffReply());
        dto.setCreatedAt(reply.getCreatedAt());
        return dto;
    }
}
