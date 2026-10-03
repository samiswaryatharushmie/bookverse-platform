-- Update prices to realistic LKR values (roughly USD * 300)
UPDATE books SET price = ROUND(price * 300, 0);
