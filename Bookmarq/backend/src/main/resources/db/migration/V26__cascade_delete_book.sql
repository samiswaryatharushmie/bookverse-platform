ALTER TABLE stock_movements DROP CONSTRAINT FK_stock_movements_book;
ALTER TABLE stock_movements ADD CONSTRAINT FK_stock_movements_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

ALTER TABLE inventory DROP CONSTRAINT FK_inventory_book;
ALTER TABLE inventory ADD CONSTRAINT FK_inventory_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;
