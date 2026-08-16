UPDATE books SET cover_url = CONCAT('https://covers.openlibrary.org/b/isbn/', REPLACE(isbn, '-', ''), '-L.jpg') WHERE cover_url LIKE '%placehold.co%';
