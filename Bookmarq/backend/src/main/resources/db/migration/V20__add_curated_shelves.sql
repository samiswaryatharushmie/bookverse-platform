CREATE TABLE curated_shelves (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(100) NOT NULL,
    slug NVARCHAR(120) NOT NULL UNIQUE,
    description NVARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by NVARCHAR(100),
    updated_by NVARCHAR(100)
);

CREATE TABLE curated_shelf_books (
    shelf_id UNIQUEIDENTIFIER NOT NULL,
    book_id UNIQUEIDENTIFIER NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (shelf_id, book_id),
    CONSTRAINT fk_shelf_books_shelf FOREIGN KEY (shelf_id) REFERENCES curated_shelves(id) ON DELETE CASCADE,
    CONSTRAINT fk_shelf_books_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
GO

-- Seed some default shelves using fixed GUIDs to avoid batch scope issues
INSERT INTO curated_shelves (id, title, slug, description, sort_order) VALUES 
('11111111-1111-1111-1111-111111111111', 'Summer Sci-Fi & Fantasy', 'summer-sci-fi', 'Escape into these epic worlds this summer.', 1),
('22222222-2222-2222-2222-222222222222', 'Staff Picks: Modern Masterpieces', 'staff-picks', 'Our team''s favorite contemporary reads.', 2),
('33333333-3333-3333-3333-333333333333', 'Award Winners', 'award-winners', 'Critically acclaimed and decorated literature.', 3);

-- Insert top books into summer shelf
INSERT INTO curated_shelf_books (shelf_id, book_id, sort_order)
SELECT TOP 6 '11111111-1111-1111-1111-111111111111', id, ROW_NUMBER() OVER (ORDER BY popularity_score DESC)
FROM books WHERE format = 'HARDCOVER' AND (slug LIKE '%dune%' OR slug LIKE '%foundation%' OR slug LIKE '%neuromancer%' OR slug LIKE '%hobbit%' OR slug LIKE '%ring%');

-- Insert top books into staff picks
INSERT INTO curated_shelf_books (shelf_id, book_id, sort_order)
SELECT TOP 6 '22222222-2222-2222-2222-222222222222', id, ROW_NUMBER() OVER (ORDER BY popularity_score DESC)
FROM books WHERE format = 'HARDCOVER' AND (slug LIKE '%mockingbird%' OR slug LIKE '%gatsby%' OR slug LIKE '%1984%');

-- Insert top books into award winners
INSERT INTO curated_shelf_books (shelf_id, book_id, sort_order)
SELECT TOP 6 '33333333-3333-3333-3333-333333333333', id, ROW_NUMBER() OVER (ORDER BY popularity_score DESC)
FROM books WHERE format = 'HARDCOVER' AND (slug LIKE '%blood-meridian%' OR slug LIKE '%beloved%' OR slug LIKE '%hundred-years%');
