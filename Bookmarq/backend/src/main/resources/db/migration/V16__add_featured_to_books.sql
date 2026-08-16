-- Add featured column to books table
ALTER TABLE books ADD featured BIT NOT NULL DEFAULT 0;
GO

-- Mark the first 12 books as featured so the homepage tunnel has real covers
UPDATE books
SET featured = 1
WHERE id IN (
    SELECT TOP 12 id FROM books ORDER BY created_at ASC
);
GO
