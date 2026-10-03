-- ============================================================================
-- V22__cleanup_schema_and_data.sql
-- Removes unnecessary columns from books table, deletes all orders,
-- and replaces the book catalog with exactly 26 books (A-Z) covering all categories.
-- ============================================================================

-- 1. Drop unnecessary columns from books table
-- First drop indexes that depend on these columns
DROP INDEX IF EXISTS IX_books_work_key ON books;
DROP INDEX IF EXISTS IX_books_series_name ON books;
DROP INDEX IF EXISTS IX_books_popularity ON books;
DROP INDEX IF EXISTS IX_books_format ON books;

-- Drop constraints dynamically (since SQL Server auto-generates names for DEFAULT constraints)
DECLARE @Sql NVARCHAR(MAX) = '';
SELECT @Sql += 'ALTER TABLE books DROP CONSTRAINT ' + dc.name + ';' + CHAR(13) + CHAR(10)
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID('books')
  AND c.name IN ('format', 'pre_order', 'signed_edition', 'popularity_score', 'featured', 'views');

IF @Sql <> ''
    EXEC sp_executesql @Sql;

ALTER TABLE books DROP CONSTRAINT IF EXISTS CK_books_format;

-- Drop columns
ALTER TABLE books DROP COLUMN format;
ALTER TABLE books DROP COLUMN original_price;
ALTER TABLE books DROP COLUMN member_price;
ALTER TABLE books DROP COLUMN pre_order;
ALTER TABLE books DROP COLUMN release_date;
ALTER TABLE books DROP COLUMN signed_edition;
ALTER TABLE books DROP COLUMN series_name;
ALTER TABLE books DROP COLUMN series_position;
ALTER TABLE books DROP COLUMN series_total;
ALTER TABLE books DROP COLUMN work_key;
ALTER TABLE books DROP COLUMN original_title;
ALTER TABLE books DROP COLUMN translator;
ALTER TABLE books DROP COLUMN reading_level;
ALTER TABLE books DROP COLUMN content_warning;
ALTER TABLE books DROP COLUMN age_rating;
ALTER TABLE books DROP COLUMN popularity_score;

-- Drop from other migrations (V16, V17, V18)
ALTER TABLE books DROP COLUMN IF EXISTS embedding_json;
ALTER TABLE books DROP COLUMN IF EXISTS featured;
ALTER TABLE books DROP COLUMN IF EXISTS views;


-- 2. Clear out order-related data
DELETE FROM invoices;
DELETE FROM refunds;
DELETE FROM payments;
DELETE FROM transaction_ledger;
UPDATE support_tickets SET order_id = NULL;
DELETE FROM order_status_history;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM carts;


-- 3. Clear out book-related data (foreign keys to books)
DELETE FROM wishlist_items;
DELETE FROM curated_shelf_books;
DELETE FROM book_authors;
DELETE FROM inventory;
DELETE FROM stock_movements;
DELETE FROM shipment_items;
DELETE FROM reviews;


-- 4. Delete all existing books
DELETE FROM books;


-- 5. Insert exactly 26 books (A-Z) with real titles and cover URLs
-- Fetch categories into a temporary table to reuse them
CREATE TABLE #Cats (RowNum INT, CatId UNIQUEIDENTIFIER);
INSERT INTO #Cats (RowNum, CatId)
SELECT ROW_NUMBER() OVER (ORDER BY id), id FROM categories;

DECLARE @TotalCats INT;
SELECT @TotalCats = COUNT(*) FROM #Cats;

CREATE TABLE #NewBooks (
    RowNum INT IDENTITY(1,1),
    Title NVARCHAR(300),
    Isbn NVARCHAR(20)
);

INSERT INTO #NewBooks (Title, Isbn) VALUES
('Alice''s Adventures in Wonderland', '9780141321073'),
('Brave New World', '9780060850524'),
('Catch-22', '9780684833392'),
('Dune', '9780441172719'),
('Emma', '9780141439587'),
('Fahrenheit 451', '9781451673319'),
('Great Expectations', '9780141439563'),
('Harry Potter and the Sorcerer''s Stone', '9780590353427'),
('Into the Wild', '9780385486804'),
('Jane Eyre', '9780141441146'),
('Kite Runner', '9781594631931'),
('Lord of the Flies', '9780399501487'),
('Moby-Dick', '9780142437247'),
('Never Let Me Go', '9781400078776'),
('Of Mice and Men', '9780140177398'),
('Pride and Prejudice', '9780141439518'),
('Quiet', '9780307352156'),
('Rebecca', '9780380730407'),
('Slaughterhouse-Five', '9780385333849'),
('To Kill a Mockingbird', '9780060935467'),
('Ulysses', '9780679722762'),
('V for Vendetta', '9781401208417'),
('War and Peace', '9781400079988'),
('Xenocide', '9780812509250'),
('Yellowface', '9780063250833'),
('Zookeeper''s Wife', '9780393333064');

INSERT INTO books (id, isbn, title, slug, description, price, language, category_id, cover_url, active, avg_rating, rating_count, created_at, updated_at)
SELECT 
    NEWID(),
    nb.Isbn,
    nb.Title,
    LOWER(REPLACE(REPLACE(REPLACE(nb.Title, ' ', '-'), '''', ''), ':', '')),
    'Description for ' + nb.Title,
    19.99,
    'en',
    c.CatId,
    'https://covers.openlibrary.org/b/isbn/' + nb.Isbn + '-L.jpg',
    1,
    0.0,
    0,
    SYSUTCDATETIME(),
    SYSUTCDATETIME()
FROM #NewBooks nb
JOIN #Cats c ON c.RowNum = ((nb.RowNum - 1) % @TotalCats) + 1;

DROP TABLE #Cats;
DROP TABLE #NewBooks;

-- Assign author (Just pick the first author for all for simplicity)
INSERT INTO book_authors (book_id, author_id)
SELECT b.id, (SELECT TOP 1 id FROM authors)
FROM books b;

-- Add inventory for the 26 books
INSERT INTO inventory (book_id, quantity_on_hand, quantity_reserved, reorder_level, created_at, updated_at)
SELECT b.id, 50, 0, 10, SYSUTCDATETIME(), SYSUTCDATETIME()
FROM books b;
