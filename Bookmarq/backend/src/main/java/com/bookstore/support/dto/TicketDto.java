package com.bookstore.support.dto;

import com.bookstore.support.entity.Ticket;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class TicketDto {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String type;
    private String subject;
    private String status;
    private String priority;
    private String orderNumber;
    private Instant createdAt;
    private Instant updatedAt;

    public static TicketDto fromEntity(Ticket ticket) {
        TicketDto dto = new TicketDto();
        dto.setId(ticket.getId());
        dto.setUserId(ticket.getUser().getId());
        dto.setUserEmail(ticket.getUser().getEmail());
        // Extract type from subject if possible, or fallback to 'General'
        if (ticket.getSubject().startsWith("[")) {
            int endIdx = ticket.getSubject().indexOf("]");
            if (endIdx > 0) {
                dto.setType(ticket.getSubject().substring(1, endIdx));
                dto.setSubject(ticket.getSubject().substring(endIdx + 1).trim());
            } else {
                dto.setType("General");
                dto.setSubject(ticket.getSubject());
            }
        } else {
            dto.setType("General");
            dto.setSubject(ticket.getSubject());
        }
        dto.setStatus(ticket.getStatus());
        dto.setPriority(ticket.getPriority());
        dto.setOrderNumber(ticket.getOrder() != null ? ticket.getOrder().getOrderNumber() : null);
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        return dto;
    }
}
