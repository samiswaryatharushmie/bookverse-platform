CREATE TABLE restock_notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    book_id UNIQUEIDENTIFIER NOT NULL,
    email NVARCHAR(255) NOT NULL,
    notified BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    notified_at DATETIME2 NULL,
    CONSTRAINT fk_restock_notification_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX ix_restock_notifications_book_pending ON restock_notifications(book_id) WHERE notified = 0;

-- Prevent the same email from queuing up more than one pending request per book.
CREATE UNIQUE INDEX ux_restock_notifications_book_email_pending ON restock_notifications(book_id, email) WHERE notified = 0;
