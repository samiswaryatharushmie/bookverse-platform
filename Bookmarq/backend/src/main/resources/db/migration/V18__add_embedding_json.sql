-- Add embedding_json column to books table for Hybrid Search
ALTER TABLE books
ADD embedding_json NVARCHAR(MAX);
