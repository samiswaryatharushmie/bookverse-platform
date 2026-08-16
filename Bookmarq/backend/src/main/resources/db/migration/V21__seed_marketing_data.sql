IF EXISTS (SELECT * FROM sysobjects WHERE name='promotion_redemptions' and xtype='U')
BEGIN
    ALTER TABLE promotion_redemptions DROP CONSTRAINT FK_promotion_redemptions_promo;
    DROP TABLE promotion_redemptions;
END
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='promotions' and xtype='U')
BEGIN
    DROP TABLE promotions;
END
GO

CREATE TABLE promotions (
    code NVARCHAR(50) PRIMARY KEY,
    discount_percentage DECIMAL(5,2) NOT NULL,
    active BIT NOT NULL CONSTRAINT DF_promotions_active DEFAULT 1,
    start_date DATE,
    end_date DATE,
    usage_count INT NOT NULL CONSTRAINT DF_promotions_usage_count DEFAULT 0,
    max_usage INT NOT NULL CONSTRAINT DF_promotions_max_usage DEFAULT 100,
    banner_text NVARCHAR(255),
    banner_active BIT NOT NULL CONSTRAINT DF_promotions_banner_active DEFAULT 0
);
GO

-- Seed Sample Promotions
INSERT INTO promotions (code, discount_percentage, max_usage, usage_count, active, start_date, end_date, banner_active, banner_text)
VALUES
('SUMMER25', 25.00, 100, 12, 1, '2020-01-01', '2027-08-31', 1, '☀️ Get 25% off all books this summer with code SUMMER25!'),
('WELCOME10', 10.00, 1000, 45, 1, '2020-01-01', '2028-12-31', 0, NULL);
GO

-- Seed Sample Reviews
-- We need some existing books and users. We'll use subqueries to get valid IDs.
-- Assuming admin user is seeded (email: admin@bookstore.com)
DECLARE @UserId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM users WHERE email = 'admin@bookstore.com');

-- If no admin exists, just pick the first user
IF @UserId IS NULL
BEGIN
    SET @UserId = (SELECT TOP 1 id FROM users);
END

-- Pick top 3 popular books
DECLARE @Book1 UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM books ORDER BY created_at DESC);
DECLARE @Book2 UNIQUEIDENTIFIER = (SELECT id FROM books ORDER BY created_at DESC OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY);
DECLARE @Book3 UNIQUEIDENTIFIER = (SELECT id FROM books ORDER BY created_at DESC OFFSET 2 ROWS FETCH NEXT 1 ROWS ONLY);

-- Insert reviews if we found a user
IF @UserId IS NOT NULL
BEGIN
    INSERT INTO reviews (id, user_id, book_id, rating, title, body, status, created_at, updated_at)
    VALUES
    (NEWID(), @UserId, @Book1, 5, 'Masterpiece', 'An absolute masterpiece! I couldn''t put it down. The character development is phenomenal.', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (NEWID(), @UserId, @Book2, 5, 'Highly recommended', 'Highly recommended! A fascinating journey from start to finish.', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (NEWID(), @UserId, @Book3, 3, 'Okay', 'It was okay. Interesting premise but the execution was lacking.', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
END
GO
