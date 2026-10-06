package com.bookstore.support.service;

import com.bookstore.support.dto.*;
import com.bookstore.support.entity.Ticket;
import com.bookstore.support.entity.TicketReply;
import com.bookstore.support.repository.TicketReplyRepository;
import com.bookstore.support.repository.TicketRepository;
import com.bookstore.order.entity.Order;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import com.bookstore.user.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportService {

    private final TicketRepository ticketRepository;
    private final TicketReplyRepository ticketReplyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final OrderRepository orderRepository;

    @Transactional
    public TicketDto createTicket(UUID userId, CreateTicketRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setSubject("[" + request.getType() + "] " + request.getSubject());
        
        if (request.getOrderNumber() != null && !request.getOrderNumber().isBlank()) {
            orderRepository.findByOrderNumber(request.getOrderNumber()).ifPresent(ticket::setOrder);
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);

        TicketReply initialReply = new TicketReply();
        initialReply.setTicket(savedTicket);
        initialReply.setUser(user);
        initialReply.setMessage(request.getMessage());
        initialReply.setStaffReply(false);
        ticketReplyRepository.save(initialReply);

        log.info("Simulated Email: Ticket #{} created by {}", savedTicket.getId(), user.getEmail());

        // Notify all staff
        userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("STAFF") || r.getName().equals("ADMIN")))
                .forEach(u -> notificationService.createNotification(
                        u.getId(), 
                        "TICKET_UPDATE", 
                        "New Support Ticket", 
                        "Ticket #" + savedTicket.getId() + " created by " + user.getEmail(),
                        "/admin/support"
                ));

        return TicketDto.fromEntity(savedTicket);
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getUserTickets(UUID userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(TicketDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(TicketDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketDto getTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        return TicketDto.fromEntity(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketReplyDto> getTicketReplies(UUID ticketId) {
        return ticketReplyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(TicketReplyDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketReplyDto addReply(UUID ticketId, UUID userId, CreateReplyRequest request, boolean isStaff) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Security check for users
        if (!isStaff && !ticket.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        TicketReply reply = new TicketReply();
        reply.setTicket(ticket);
        reply.setUser(user);
        reply.setMessage(request.getMessage());
        reply.setStaffReply(isStaff);
        ticketReplyRepository.save(reply);

        if (isStaff) {
            log.info("Simulated Email: New reply to your ticket '{}' from Support. View here: http://localhost:5173/profile/tickets", ticket.getSubject());
            notificationService.createNotification(
                    ticket.getUser().getId(),
                    "TICKET_UPDATE",
                    "New Reply to Ticket",
                    "Support has replied to your ticket: " + ticket.getSubject(),
                    "/profile/tickets"
            );
        } else {
            // Notify all staff
            userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("STAFF") || r.getName().equals("ADMIN")))
                    .forEach(u -> notificationService.createNotification(
                            u.getId(), 
                            "TICKET_UPDATE", 
                            "Customer Replied to Ticket", 
                            "New reply on ticket: " + ticket.getSubject(),
                            "/admin/support"
                    ));
        }

        return TicketReplyDto.fromEntity(reply);
    }

    @Transactional
    public TicketDto updateTicketStatus(UUID ticketId, UpdateTicketStatusRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            ticket.setPriority(request.getPriority());
        }
        
        ticket = ticketRepository.save(ticket);
        return TicketDto.fromEntity(ticket);
    }

    @Transactional
    public void deleteTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        // Delete all replies first
        ticketReplyRepository.deleteAll(ticketReplyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId));
        ticketRepository.delete(ticket);
    }
}
