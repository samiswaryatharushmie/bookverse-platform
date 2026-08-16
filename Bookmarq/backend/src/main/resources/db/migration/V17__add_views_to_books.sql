-- V17: Add views column to books table
ALTER TABLE books ADD views INT NOT NULL DEFAULT 0;
GO
