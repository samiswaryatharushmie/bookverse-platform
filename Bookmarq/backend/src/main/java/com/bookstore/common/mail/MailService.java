package com.bookstore.common.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Thin wrapper around {@link JavaMailSender} that never lets an SMTP failure
 * bubble up into the caller's transaction — a bounced or unreachable mail
 * server should not fail the business operation that triggered the email.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.mail.enabled:true}")
    private boolean enabled;

    public void send(String to, String subject, String body) {
        if (!enabled) {
            log.info("Mail sending disabled (app.mail.enabled=false) — skipping \"{}\" to {}", subject, to);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
