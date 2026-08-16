CREATE TABLE wishlists (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE wishlist_items (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    wishlist_id UNIQUEIDENTIFIER NOT NULL,
    book_id UNIQUEIDENTIFIER NOT NULL,
    added_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_wishlist_item_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_item_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT uq_wishlist_book UNIQUE (wishlist_id, book_id)
);
