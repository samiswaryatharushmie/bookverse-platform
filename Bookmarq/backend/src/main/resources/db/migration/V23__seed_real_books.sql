-- Clear out the A-Z dummy books
DELETE FROM inventory;
DELETE FROM book_authors;
DELETE FROM books;

-- Insert exactly 26 books (A-Z) with real titles and cover URLs
-- Fetch categories into a temporary table to reuse them
CREATE TABLE #Cats (RowNum INT, CatId UNIQUEIDENTIFIER);
INSERT INTO #Cats (RowNum, CatId)
SELECT ROW_NUMBER() OVER (ORDER BY id), id FROM categories;

DECLARE @TotalCats INT;
SELECT @TotalCats = COUNT(*) FROM #Cats;

CREATE TABLE #NewBooks (
    RowNum INT IDENTITY(1,1),
    Title NVARCHAR(300),
    Isbn NVARCHAR(20),
    Price DECIMAL(19,4),
    AvgRating DECIMAL(3,2),
    RatingCount INT,
    PageCount INT,
    Publisher NVARCHAR(200),
    PublishedDate DATE,
    Description NVARCHAR(MAX)
);

INSERT INTO #NewBooks (Title, Isbn, Price, AvgRating, RatingCount, PageCount, Publisher, PublishedDate, Description) VALUES
('Alice''s Adventures in Wonderland', '9780141321073', 9.99, 4.20, 1000, 120, 'Penguin Classics', '2008-01-01', 'A young girl falls down a rabbit hole into a fantasy world.'),
('Brave New World', '9780060850524', 14.99, 4.50, 2000, 288, 'Harper Perennial', '2006-10-17', 'A dystopian social science fiction novel and cautionary tale.'),
('Catch-22', '9780684833392', 12.99, 4.40, 1500, 453, 'Simon & Schuster', '1999-01-01', 'A satirical war novel by American author Joseph Heller.'),
('Dune', '9780441172719', 18.99, 4.80, 5000, 412, 'Ace Books', '1990-10-01', 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.'),
('Emma', '9780141439587', 11.99, 4.10, 1200, 474, 'Penguin Classics', '2003-01-01', 'Emma Woodhouse is handsome, clever, and rich.'),
('Fahrenheit 451', '9781451673319', 15.99, 4.60, 3000, 158, 'Simon & Schuster', '2012-01-01', 'A dystopian novel by American writer Ray Bradbury.'),
('Great Expectations', '9780141439563', 10.99, 4.30, 1800, 505, 'Penguin Classics', '2003-01-01', 'The coming-of-age story of an orphan named Pip.'),
('Harry Potter and the Sorcerer''s Stone', '9780590353427', 12.99, 4.90, 10000, 309, 'Scholastic', '1998-09-01', 'Harry Potter discovers he is a wizard.'),
('Into the Wild', '9780385486804', 13.99, 4.20, 1100, 207, 'Anchor Books', '1997-01-01', 'The true story of Christopher McCandless.'),
('Jane Eyre', '9780141441146', 11.99, 4.40, 1600, 532, 'Penguin Classics', '2006-01-01', 'A novel by English writer Charlotte Brontë.'),
('Kite Runner', '9781594631931', 16.99, 4.70, 2500, 371, 'Riverhead Books', '2003-01-01', 'The story of Amir, a young boy from the Wazir Akbar Khan district of Kabul.'),
('Lord of the Flies', '9780399501487', 14.99, 4.30, 2200, 224, 'Penguin Books', '2003-01-01', 'A novel by Nobel Prize-winning British author William Golding.'),
('Moby-Dick', '9780142437247', 15.99, 4.00, 1400, 625, 'Penguin Classics', '2003-01-01', 'The sailor Ishmael''s narrative of the obsessive quest of Ahab.'),
('Never Let Me Go', '9781400078776', 14.99, 4.50, 1900, 288, 'Vintage Books', '2005-01-01', 'A dystopian science fiction novel by British author Kazuo Ishiguro.'),
('Of Mice and Men', '9780140177398', 10.99, 4.40, 1700, 107, 'Penguin Books', '1993-01-01', 'A novella written by John Steinbeck.'),
('Pride and Prejudice', '9780141439518', 9.99, 4.60, 3000, 432, 'Penguin Classics', '2002-01-01', 'An 1813 romantic novel of manners written by Jane Austen.'),
('Quiet', '9780307352156', 17.99, 4.30, 1300, 333, 'Crown Publishing', '2012-01-01', 'The Power of Introverts in a World That Can''t Stop Talking.'),
('Rebecca', '9780380730407', 15.99, 4.40, 1500, 384, 'Avon Books', '1998-01-01', 'A gothic novel by English author Dame Daphne du Maurier.'),
('Slaughterhouse-Five', '9780385333849', 14.99, 4.50, 2100, 275, 'Dial Press', '1999-01-01', 'A science fiction-infused anti-war novel by Kurt Vonnegut.'),
('To Kill a Mockingbird', '9780060935467', 12.99, 4.80, 5000, 281, 'Harper Perennial', '2002-01-01', 'A novel by the American author Harper Lee.'),
('Ulysses', '9780679722762', 18.99, 3.90, 800, 736, 'Vintage Books', '1990-01-01', 'A modernist novel by Irish writer James Joyce.'),
('V for Vendetta', '9781401208417', 19.99, 4.70, 2000, 296, 'DC Comics', '2008-01-01', 'A British graphic novel written by Alan Moore.'),
('War and Peace', '9781400079988', 20.99, 4.30, 1000, 1225, 'Vintage Books', '2008-01-01', 'A novel by the Russian author Leo Tolstoy.'),
('Xenocide', '9780812509250', 16.99, 4.10, 1200, 592, 'Tor Books', '1996-01-01', 'A science fiction novel by American writer Orson Scott Card.'),
('Yellowface', '9780063250833', 22.99, 4.20, 800, 336, 'HarperCollins', '2023-05-16', 'A novel about literary theft and racism.'),
('Zookeeper''s Wife', '9780393333064', 15.99, 4.10, 900, 368, 'W. W. Norton', '2008-01-01', 'A non-fiction book by Diane Ackerman.');

INSERT INTO books (id, isbn, title, slug, description, price, language, category_id, cover_url, active, avg_rating, rating_count, page_count, publisher, published_date, created_at, updated_at)
SELECT 
    NEWID(),
    nb.Isbn,
    nb.Title,
    LOWER(REPLACE(REPLACE(REPLACE(nb.Title, ' ', '-'), '''', ''), ':', '')),
    nb.Description,
    nb.Price,
    'en',
    c.CatId,
    'https://covers.openlibrary.org/b/isbn/' + nb.Isbn + '-L.jpg',
    1,
    nb.AvgRating,
    nb.RatingCount,
    nb.PageCount,
    nb.Publisher,
    nb.PublishedDate,
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
