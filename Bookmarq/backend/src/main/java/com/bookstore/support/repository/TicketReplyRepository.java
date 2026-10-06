package com.bookstore.support.repository;

import com.bookstore.support.entity.TicketReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketReplyRepository extends JpaRepository<TicketReply, UUID> {
    List<TicketReply> findByTicketIdOrderByCreatedAtAsc(UUID ticketId);
}
