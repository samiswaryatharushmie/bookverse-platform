-- V30: Correct the authors and categories of the seeded catalogue.
-- V23/V24 linked every book to the first row of the authors table ("Frank Herbert")
-- and assigned categories round-robin, so book pages showed the wrong author and genre.
-- This migration only touches the books listed below (matched by title), creates any
-- missing authors, and is safe to run on a database where some books were deleted.

DECLARE @Map TABLE (Title NVARCHAR(300), Author NVARCHAR(200), AuthorSlug NVARCHAR(220), Category NVARCHAR(100));

INSERT INTO @Map (Title, Author, AuthorSlug, Category) VALUES
(N'Alice''s Adventures in Wonderland', N'Lewis Carroll',      N'lewis-carroll',      N'Children'),
(N'Brave New World',                   N'Aldous Huxley',      N'aldous-huxley',      N'Science Fiction'),
(N'Catch-22',                          N'Joseph Heller',      N'joseph-heller',      N'Fiction'),
(N'Dune',                              N'Frank Herbert',      N'frank-herbert',      N'Science Fiction'),
(N'Emma',                              N'Jane Austen',        N'jane-austen',        N'Romance'),
(N'Fahrenheit 451',                    N'Ray Bradbury',       N'ray-bradbury',       N'Science Fiction'),
(N'Great Expectations',                N'Charles Dickens',    N'charles-dickens',    N'Fiction'),
(N'Harry Potter and the Sorcerer''s Stone', N'J.K. Rowling',  N'jk-rowling',         N'Fantasy'),
(N'Into the Wild',                     N'Jon Krakauer',       N'jon-krakauer',       N'Biography'),
(N'Jane Eyre',                         N'Charlotte Brontë',   N'charlotte-bronte',   N'Romance'),
(N'Kite Runner',                       N'Khaled Hosseini',    N'khaled-hosseini',    N'Fiction'),
(N'Lord of the Flies',                 N'William Golding',    N'william-golding',    N'Fiction'),
(N'Moby-Dick',                         N'Herman Melville',    N'herman-melville',    N'Fiction'),
(N'Never Let Me Go',                   N'Kazuo Ishiguro',     N'kazuo-ishiguro',     N'Science Fiction'),
(N'Of Mice and Men',                   N'John Steinbeck',     N'john-steinbeck',     N'Fiction'),
(N'Pride and Prejudice',               N'Jane Austen',        N'jane-austen',        N'Romance'),
(N'Quiet',                             N'Susan Cain',         N'susan-cain',         N'Non-Fiction'),
(N'Rebecca',                           N'Daphne du Maurier',  N'daphne-du-maurier',  N'Mystery & Thriller'),
(N'Slaughterhouse-Five',               N'Kurt Vonnegut',      N'kurt-vonnegut',      N'Science Fiction'),
(N'To Kill a Mockingbird',             N'Harper Lee',         N'harper-lee',         N'Fiction'),
(N'Ulysses',                           N'James Joyce',        N'james-joyce',        N'Fiction'),
(N'V for Vendetta',                    N'Alan Moore',         N'alan-moore',         N'Science Fiction'),
(N'V for Vendetta',                    N'David Lloyd',        N'david-lloyd',        N'Science Fiction'),
(N'War and Peace',                     N'Leo Tolstoy',        N'leo-tolstoy',        N'Fiction'),
(N'Xenocide',                          N'Orson Scott Card',   N'orson-scott-card',   N'Science Fiction'),
(N'Yellowface',                        N'R. F. Kuang',        N'r-f-kuang',          N'Fiction');

-- 1. Create authors that do not exist yet (matched by name, then by slug)
INSERT INTO authors (name, slug)
SELECT DISTINCT m.Author, m.AuthorSlug
FROM @Map m
WHERE NOT EXISTS (SELECT 1 FROM authors a WHERE a.name = m.Author)
  AND NOT EXISTS (SELECT 1 FROM authors a WHERE a.slug = m.AuthorSlug);

-- 2. Resolve each mapping row to one author id (prefer an exact name match)
DECLARE @Resolved TABLE (Title NVARCHAR(300), AuthorId UNIQUEIDENTIFIER);
INSERT INTO @Resolved (Title, AuthorId)
SELECT m.Title,
       COALESCE(
           (SELECT TOP 1 a.id FROM authors a WHERE a.name = m.Author ORDER BY a.created_at, a.id),
           (SELECT TOP 1 a.id FROM authors a WHERE a.slug = m.AuthorSlug))
FROM @Map m;

-- 3. Replace the author links of the mapped books only
DELETE ba
FROM book_authors ba
JOIN books b ON b.id = ba.book_id
WHERE b.title IN (SELECT Title FROM @Map);

INSERT INTO book_authors (book_id, author_id)
SELECT DISTINCT b.id, r.AuthorId
FROM books b
JOIN @Resolved r ON r.Title = b.title
WHERE r.AuthorId IS NOT NULL;

-- 4. Set the correct category (skipped if the category no longer exists)
UPDATE b
SET b.category_id = c.id,
    b.updated_at  = SYSUTCDATETIME()
FROM books b
JOIN (SELECT DISTINCT Title, Category FROM @Map) m ON m.Title = b.title
JOIN categories c ON c.name = m.Category;
