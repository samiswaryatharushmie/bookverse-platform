-- ============================================================================
-- V1__baseline.sql
-- Bookstore database baseline — creates all tables for Modules 1–6.
-- Database: Microsoft SQL Server 2022
-- PKs: UNIQUEIDENTIFIER with NEWSEQUENTIALID()
-- Money: DECIMAL(19,4)
-- Timestamps: DATETIME2
-- ============================================================================

-- ─── MODULE 1: Users & Authentication ──────────────────────────────────────

CREATE TABLE roles (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    name        NVARCHAR(50)     NOT NULL,
    description NVARCHAR(255)    NULL,
    created_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_roles PRIMARY KEY (id),
    CONSTRAINT UQ_roles_name UNIQUE (name)
);

CREATE TABLE users (
    id                 UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    email              NVARCHAR(255)    NOT NULL,
    password_hash      NVARCHAR(255)    NOT NULL,
    first_name         NVARCHAR(100)    NOT NULL,
    last_name          NVARCHAR(100)    NOT NULL,
    phone              NVARCHAR(20)     NULL,
    status             NVARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    failed_login_count INT              NOT NULL DEFAULT 0,
    locked_until       DATETIME2        NULL,
    created_at         DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at         DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_users PRIMARY KEY (id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT CK_users_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ANONYMISED'))
);

CREATE TABLE user_roles (
    user_id UNIQUEIDENTIFIER NOT NULL,
    role_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT FK_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    user_id       UNIQUEIDENTIFIER NOT NULL,
    token_hash    NVARCHAR(512)    NOT NULL,
    family_id     UNIQUEIDENTIFIER NOT NULL,
    expires_at    DATETIME2        NOT NULL,
    revoked       BIT              NOT NULL DEFAULT 0,
    revoked_at    DATETIME2        NULL,
    created_at    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT FK_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IX_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IX_refresh_tokens_family_id ON refresh_tokens(family_id);

CREATE TABLE password_reset_tokens (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    user_id    UNIQUEIDENTIFIER NOT NULL,
    token_hash NVARCHAR(512)    NOT NULL,
    expires_at DATETIME2        NOT NULL,
    used       BIT              NOT NULL DEFAULT 0,
    created_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT FK_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE addresses (
    id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    user_id      UNIQUEIDENTIFIER NOT NULL,
    label        NVARCHAR(50)     NULL,
    line1        NVARCHAR(255)    NOT NULL,
    line2        NVARCHAR(255)    NULL,
    city         NVARCHAR(100)    NOT NULL,
    state        NVARCHAR(100)    NULL,
    postal_code  NVARCHAR(20)     NOT NULL,
    country      NVARCHAR(100)    NOT NULL DEFAULT 'Sri Lanka',
    is_default   BIT              NOT NULL DEFAULT 0,
    created_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_addresses PRIMARY KEY (id),
    CONSTRAINT FK_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IX_addresses_user_id ON addresses(user_id);


-- ─── MODULE 2: Book Catalog & Search ───────────────────────────────────────

CREATE TABLE categories (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    name        NVARCHAR(100)    NOT NULL,
    slug        NVARCHAR(120)    NOT NULL,
    description NVARCHAR(500)    NULL,
    parent_id   UNIQUEIDENTIFIER NULL,
    sort_order  INT              NOT NULL DEFAULT 0,
    active      BIT              NOT NULL DEFAULT 1,
    created_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_categories PRIMARY KEY (id),
    CONSTRAINT UQ_categories_slug UNIQUE (slug),
    CONSTRAINT FK_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);
CREATE INDEX IX_categories_parent_id ON categories(parent_id);

CREATE TABLE authors (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    name       NVARCHAR(200)    NOT NULL,
    slug       NVARCHAR(220)    NOT NULL,
    biography  NVARCHAR(MAX)    NULL,
    photo_url  NVARCHAR(500)    NULL,
    created_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_authors PRIMARY KEY (id),
    CONSTRAINT UQ_authors_slug UNIQUE (slug)
);

CREATE TABLE books (
    id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    isbn           NVARCHAR(20)     NOT NULL,
    title          NVARCHAR(300)    NOT NULL,
    slug           NVARCHAR(350)    NOT NULL,
    description    NVARCHAR(MAX)    NULL,
    price          DECIMAL(19,4)    NOT NULL,
    cover_url      NVARCHAR(500)    NULL,
    publisher      NVARCHAR(200)    NULL,
    published_date DATE             NULL,
    page_count     INT              NULL,
    language       NVARCHAR(10)     NOT NULL DEFAULT 'en',
    category_id    UNIQUEIDENTIFIER NULL,
    active         BIT              NOT NULL DEFAULT 1,
    avg_rating     DECIMAL(3,2)     NOT NULL DEFAULT 0.00,
    rating_count   INT              NOT NULL DEFAULT 0,
    created_at     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_books PRIMARY KEY (id),
    CONSTRAINT UQ_books_isbn UNIQUE (isbn),
    CONSTRAINT UQ_books_slug UNIQUE (slug),
    CONSTRAINT FK_books_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT CK_books_price CHECK (price >= 0)
);
CREATE INDEX IX_books_title ON books(title);
CREATE INDEX IX_books_isbn ON books(isbn);
CREATE INDEX IX_books_category_id ON books(category_id);
CREATE INDEX IX_books_active ON books(active);

CREATE TABLE book_authors (
    book_id   UNIQUEIDENTIFIER NOT NULL,
    author_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_book_authors PRIMARY KEY (book_id, author_id),
    CONSTRAINT FK_book_authors_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT FK_book_authors_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);


-- ─── MODULE 3: Shopping Cart & Orders ──────────────────────────────────────

CREATE TABLE carts (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    user_id    UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_carts PRIMARY KEY (id),
    CONSTRAINT FK_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_carts_user UNIQUE (user_id)
);

CREATE TABLE cart_items (
    id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    cart_id             UNIQUEIDENTIFIER NOT NULL,
    book_id             UNIQUEIDENTIFIER NOT NULL,
    quantity            INT              NOT NULL DEFAULT 1,
    unit_price_snapshot DECIMAL(19,4)    NOT NULL,
    created_at          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_cart_items PRIMARY KEY (id),
    CONSTRAINT FK_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT FK_cart_items_book FOREIGN KEY (book_id) REFERENCES books(id),
    CONSTRAINT UQ_cart_items_cart_book UNIQUE (cart_id, book_id),
    CONSTRAINT CK_cart_items_quantity CHECK (quantity > 0)
);

CREATE TABLE orders (
    id                         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    order_number               NVARCHAR(30)     NOT NULL,
    user_id                    UNIQUEIDENTIFIER NOT NULL,
    status                     NVARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    subtotal                   DECIMAL(19,4)    NOT NULL,
    discount_total             DECIMAL(19,4)    NOT NULL DEFAULT 0,
    tax_total                  DECIMAL(19,4)    NOT NULL DEFAULT 0,
    shipping_fee               DECIMAL(19,4)    NOT NULL DEFAULT 0,
    grand_total                DECIMAL(19,4)    NOT NULL,
    shipping_address_snapshot  NVARCHAR(MAX)    NULL,
    promotion_id               UNIQUEIDENTIFIER NULL,
    notes                      NVARCHAR(500)    NULL,
    created_at                 DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at                 DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_orders PRIMARY KEY (id),
    CONSTRAINT UQ_orders_number UNIQUE (order_number),
    CONSTRAINT FK_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT CK_orders_status CHECK (status IN (
        'PENDING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'))
);
CREATE INDEX IX_orders_user_id ON orders(user_id);
CREATE INDEX IX_orders_status ON orders(status);
CREATE INDEX IX_orders_created_at ON orders(created_at);

CREATE TABLE order_items (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    order_id   UNIQUEIDENTIFIER NOT NULL,
    book_id    UNIQUEIDENTIFIER NOT NULL,
    quantity   INT              NOT NULL,
    unit_price DECIMAL(19,4)    NOT NULL,
    total      DECIMAL(19,4)    NOT NULL,
    CONSTRAINT PK_order_items PRIMARY KEY (id),
    CONSTRAINT FK_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_order_items_book FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE order_status_history (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    order_id   UNIQUEIDENTIFIER NOT NULL,
    old_status NVARCHAR(20)     NULL,
    new_status NVARCHAR(20)     NOT NULL,
    changed_by UNIQUEIDENTIFIER NULL,
    note       NVARCHAR(500)    NULL,
    created_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_order_status_history PRIMARY KEY (id),
    CONSTRAINT FK_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE INDEX IX_order_status_history_order_id ON order_status_history(order_id);


-- ─── MODULE 4: Payments & Finance ──────────────────────────────────────────

CREATE TABLE payments (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    order_id        UNIQUEIDENTIFIER NOT NULL,
    provider        NVARCHAR(50)     NOT NULL DEFAULT 'STRIPE',
    provider_ref    NVARCHAR(255)    NULL,
    amount          DECIMAL(19,4)    NOT NULL,
    currency        NVARCHAR(3)      NOT NULL DEFAULT 'USD',
    status          NVARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    idempotency_key NVARCHAR(255)    NOT NULL,
    created_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_payments PRIMARY KEY (id),
    CONSTRAINT FK_payments_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT UQ_payments_idempotency UNIQUE (idempotency_key),
    CONSTRAINT CK_payments_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'))
);
CREATE INDEX IX_payments_order_id ON payments(order_id);

CREATE TABLE invoices (
    id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    invoice_number NVARCHAR(30)     NOT NULL,
    order_id       UNIQUEIDENTIFIER NOT NULL,
    issued_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    pdf_path       NVARCHAR(500)    NULL,
    created_at     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_invoices PRIMARY KEY (id),
    CONSTRAINT UQ_invoices_number UNIQUE (invoice_number),
    CONSTRAINT FK_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE refunds (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    payment_id  UNIQUEIDENTIFIER NOT NULL,
    amount      DECIMAL(19,4)    NOT NULL,
    reason      NVARCHAR(500)    NOT NULL,
    status      NVARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    provider_ref NVARCHAR(255)   NULL,
    processed_by UNIQUEIDENTIFIER NULL,
    created_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_refunds PRIMARY KEY (id),
    CONSTRAINT FK_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
    CONSTRAINT CK_refunds_status CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSED', 'REJECTED'))
);

-- Append-only ledger — NO UPDATE OR DELETE permitted by application code.
-- Enforced via application-layer @PreAuthorize and repository restrictions.
CREATE TABLE transaction_ledger (
    id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    entry_type   NVARCHAR(30)     NOT NULL,
    debit        DECIMAL(19,4)    NOT NULL DEFAULT 0,
    credit       DECIMAL(19,4)    NOT NULL DEFAULT 0,
    reference_id UNIQUEIDENTIFIER NULL,
    description  NVARCHAR(500)    NULL,
    created_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by   UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_transaction_ledger PRIMARY KEY (id),
    CONSTRAINT CK_ledger_entry_type CHECK (entry_type IN (
        'SALE', 'REFUND', 'TAX', 'SHIPPING', 'DISCOUNT', 'ADJUSTMENT'))
);
CREATE INDEX IX_transaction_ledger_created_at ON transaction_ledger(created_at);
CREATE INDEX IX_transaction_ledger_reference_id ON transaction_ledger(reference_id);


-- ─── MODULE 5: Inventory & Warehouse ───────────────────────────────────────

CREATE TABLE inventory (
    id                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    book_id           UNIQUEIDENTIFIER NOT NULL,
    quantity_on_hand  INT              NOT NULL DEFAULT 0,
    quantity_reserved INT              NOT NULL DEFAULT 0,
    reorder_level     INT              NOT NULL DEFAULT 10,
    row_version       ROWVERSION       NOT NULL,
    created_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_inventory PRIMARY KEY (id),
    CONSTRAINT FK_inventory_book FOREIGN KEY (book_id) REFERENCES books(id),
    CONSTRAINT UQ_inventory_book UNIQUE (book_id),
    CONSTRAINT CK_inventory_on_hand CHECK (quantity_on_hand >= 0),
    CONSTRAINT CK_inventory_reserved CHECK (quantity_reserved >= 0)
);

-- Append-only movement log.
CREATE TABLE stock_movements (
    id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    book_id       UNIQUEIDENTIFIER NOT NULL,
    movement_type NVARCHAR(10)     NOT NULL,
    quantity      INT              NOT NULL,
    reason        NVARCHAR(500)    NULL,
    reference_id  UNIQUEIDENTIFIER NULL,
    performed_by  UNIQUEIDENTIFIER NULL,
    created_at    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_stock_movements PRIMARY KEY (id),
    CONSTRAINT FK_stock_movements_book FOREIGN KEY (book_id) REFERENCES books(id),
    CONSTRAINT CK_stock_movements_type CHECK (movement_type IN ('IN', 'OUT', 'ADJUST', 'RETURN')),
    CONSTRAINT CK_stock_movements_quantity CHECK (quantity > 0)
);
CREATE INDEX IX_stock_movements_book_id ON stock_movements(book_id);
CREATE INDEX IX_stock_movements_created_at ON stock_movements(created_at);

CREATE TABLE suppliers (
    id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    name         NVARCHAR(200)    NOT NULL,
    contact_name NVARCHAR(200)    NULL,
    email        NVARCHAR(255)    NULL,
    phone        NVARCHAR(20)     NULL,
    address      NVARCHAR(500)    NULL,
    active       BIT              NOT NULL DEFAULT 1,
    created_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_suppliers PRIMARY KEY (id)
);

CREATE TABLE shipments (
    id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    supplier_id    UNIQUEIDENTIFIER NOT NULL,
    status         NVARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    tracking_number NVARCHAR(100)   NULL,
    expected_date  DATE             NULL,
    received_date  DATE             NULL,
    received_by    UNIQUEIDENTIFIER NULL,
    notes          NVARCHAR(500)    NULL,
    created_at     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_shipments PRIMARY KEY (id),
    CONSTRAINT FK_shipments_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT CK_shipments_status CHECK (status IN ('PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'))
);

CREATE TABLE shipment_items (
    id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    shipment_id      UNIQUEIDENTIFIER NOT NULL,
    book_id          UNIQUEIDENTIFIER NOT NULL,
    quantity_expected INT             NOT NULL,
    quantity_received INT             NULL,
    CONSTRAINT PK_shipment_items PRIMARY KEY (id),
    CONSTRAINT FK_shipment_items_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    CONSTRAINT FK_shipment_items_book FOREIGN KEY (book_id) REFERENCES books(id)
);


-- ─── MODULE 6: Marketing, Reviews & Customer Support ───────────────────────

CREATE TABLE promotions (
    id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    code             NVARCHAR(50)     NOT NULL,
    type             NVARCHAR(10)     NOT NULL,
    value            DECIMAL(19,4)    NOT NULL,
    starts_at        DATETIME2        NOT NULL,
    ends_at          DATETIME2        NOT NULL,
    usage_limit      INT              NULL,
    used_count       INT              NOT NULL DEFAULT 0,
    min_order_amount DECIMAL(19,4)    NOT NULL DEFAULT 0,
    description      NVARCHAR(500)    NULL,
    active           BIT              NOT NULL DEFAULT 1,
    created_at       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_promotions PRIMARY KEY (id),
    CONSTRAINT UQ_promotions_code UNIQUE (code),
    CONSTRAINT CK_promotions_type CHECK (type IN ('PERCENT', 'FIXED')),
    CONSTRAINT CK_promotions_value CHECK (value > 0)
);

CREATE TABLE promotion_redemptions (
    id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    promotion_id UNIQUEIDENTIFIER NOT NULL,
    user_id      UNIQUEIDENTIFIER NOT NULL,
    order_id     UNIQUEIDENTIFIER NOT NULL,
    discount     DECIMAL(19,4)    NOT NULL,
    created_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_promotion_redemptions PRIMARY KEY (id),
    CONSTRAINT FK_promotion_redemptions_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    CONSTRAINT FK_promotion_redemptions_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_promotion_redemptions_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE banners (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    title       NVARCHAR(200)    NOT NULL,
    image_url   NVARCHAR(500)    NOT NULL,
    link_url    NVARCHAR(500)    NULL,
    sort_order  INT              NOT NULL DEFAULT 0,
    starts_at   DATETIME2        NULL,
    ends_at     DATETIME2        NULL,
    active      BIT              NOT NULL DEFAULT 1,
    created_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_banners PRIMARY KEY (id)
);

CREATE TABLE newsletter_subscribers (
    id                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    email             NVARCHAR(255)    NOT NULL,
    confirmed         BIT              NOT NULL DEFAULT 0,
    unsubscribe_token NVARCHAR(255)    NOT NULL,
    confirmed_at      DATETIME2        NULL,
    created_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_newsletter_subscribers PRIMARY KEY (id),
    CONSTRAINT UQ_newsletter_email UNIQUE (email)
);

CREATE TABLE reviews (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    book_id    UNIQUEIDENTIFIER NOT NULL,
    user_id    UNIQUEIDENTIFIER NOT NULL,
    rating     INT              NOT NULL,
    title      NVARCHAR(200)    NULL,
    body       NVARCHAR(MAX)    NULL,
    status     NVARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    created_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_reviews PRIMARY KEY (id),
    CONSTRAINT FK_reviews_book FOREIGN KEY (book_id) REFERENCES books(id),
    CONSTRAINT FK_reviews_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT UQ_reviews_book_user UNIQUE (book_id, user_id),
    CONSTRAINT CK_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT CK_reviews_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);
CREATE INDEX IX_reviews_book_id ON reviews(book_id);
CREATE INDEX IX_reviews_status ON reviews(status);

CREATE TABLE support_tickets (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    user_id    UNIQUEIDENTIFIER NOT NULL,
    subject    NVARCHAR(300)    NOT NULL,
    status     NVARCHAR(20)     NOT NULL DEFAULT 'OPEN',
    priority   NVARCHAR(10)     NOT NULL DEFAULT 'MEDIUM',
    order_id   UNIQUEIDENTIFIER NULL,
    created_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_support_tickets PRIMARY KEY (id),
    CONSTRAINT FK_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_support_tickets_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT CK_tickets_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    CONSTRAINT CK_tickets_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'))
);
CREATE INDEX IX_support_tickets_user_id ON support_tickets(user_id);

CREATE TABLE ticket_messages (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    ticket_id  UNIQUEIDENTIFIER NOT NULL,
    sender_id  UNIQUEIDENTIFIER NOT NULL,
    body       NVARCHAR(MAX)    NOT NULL,
    is_staff   BIT              NOT NULL DEFAULT 0,
    created_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_ticket_messages PRIMARY KEY (id),
    CONSTRAINT FK_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT FK_ticket_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id)
);
CREATE INDEX IX_ticket_messages_ticket_id ON ticket_messages(ticket_id);


-- ─── CROSS-CUTTING: Audit Log ──────────────────────────────────────────────

CREATE TABLE audit_log (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    actor_id    UNIQUEIDENTIFIER NULL,
    action      NVARCHAR(100)    NOT NULL,
    entity_type NVARCHAR(100)    NOT NULL,
    entity_id   NVARCHAR(100)    NULL,
    before_json NVARCHAR(MAX)    NULL,
    after_json  NVARCHAR(MAX)    NULL,
    ip          NVARCHAR(45)     NULL,
    user_agent  NVARCHAR(500)    NULL,
    created_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_audit_log PRIMARY KEY (id)
);
CREATE INDEX IX_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX IX_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IX_audit_log_created_at ON audit_log(created_at);
