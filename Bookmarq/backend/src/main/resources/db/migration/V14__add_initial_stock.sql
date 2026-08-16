-- Add an initial stock to all books that currently have 0 stock
UPDATE inventory
SET quantity_on_hand = 50
WHERE quantity_on_hand = 0;
