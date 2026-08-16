-- Insert missing inventory records for existing books
INSERT INTO inventory (book_id)
SELECT id
FROM books b
WHERE NOT EXISTS (
    SELECT 1 FROM inventory i WHERE i.book_id = b.id
);
