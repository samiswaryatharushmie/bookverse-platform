package com.bookstore.inventory.service;

import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.repository.BookRepository;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.common.mail.MailService;
import com.bookstore.inventory.entity.RestockNotification;
import com.bookstore.inventory.repository.RestockNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestockNotificationService {

    private final RestockNotificationRepository restockNotificationRepository;
    private final BookRepository bookRepository;
    private final MailService mailService;

    @Transactional
    public void subscribe(UUID bookId, String email) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));

        String normalizedEmail = email.trim().toLowerCase();
        boolean alreadyPending = restockNotificationRepository
                .findByBookIdAndEmailIgnoreCaseAndNotifiedFalse(bookId, normalizedEmail)
                .isPresent();
        if (alreadyPending) {
            return; // idempotent — same as the newsletter subscribe behaviour
        }

        RestockNotification notification = new RestockNotification();
        notification.setBook(book);
        notification.setEmail(normalizedEmail);
        restockNotificationRepository.save(notification);
    }

    /**
     * Emails everyone with a pending request for this book, then marks them notified.
     * Called whenever a book's available stock crosses from 0 (or less) to positive.
     */
    @Transactional
    public void notifySubscribers(UUID bookId) {
        List<RestockNotification> pending = restockNotificationRepository.findByBookIdAndNotifiedFalse(bookId);
        if (pending.isEmpty()) {
            return;
        }

        String title = pending.get(0).getBook().getTitle();
        Instant now = Instant.now();
        for (RestockNotification notification : pending) {
            mailService.send(
                    notification.getEmail(),
                    "\"" + title + "\" is back in stock!",
                    "Good news — \"" + title + "\" is back in stock at Bookmarq.\n\n" +
                            "Grab your copy before it sells out again.\n\n" +
                            "Happy reading,\nThe Bookmarq Team"
            );
            notification.setNotified(true);
            notification.setNotifiedAt(now);
        }
        restockNotificationRepository.saveAll(pending);
        log.info("Sent {} restock notification(s) for book {}", pending.size(), bookId);
    }
}
