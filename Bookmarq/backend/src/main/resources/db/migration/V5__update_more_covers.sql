UPDATE books SET cover_url = '/uploads/foundation_cover.png' WHERE id = '50000000-0000-0000-0000-000000000002';
UPDATE books SET cover_url = '/uploads/hitchhikers_cover.png' WHERE id = '50000000-0000-0000-0000-000000000003';
UPDATE books SET cover_url = '/uploads/orient_express_cover.png' WHERE id = '50000000-0000-0000-0000-000000000006';
UPDATE books SET cover_url = '/uploads/shining_cover.png' WHERE id = '50000000-0000-0000-0000-000000000008';
UPDATE books SET cover_url = '/uploads/alchemist_cover.png' WHERE id = '50000000-0000-0000-0000-000000000013';
UPDATE books SET cover_url = '/uploads/animal_farm_cover.png' WHERE id = '50000000-0000-0000-0000-000000000014';

-- For the rest of the books, set a beautiful placeholder image from an external service
UPDATE books SET cover_url = 'https://placehold.co/400x600/151311/f4ecd8?text=Book+Cover' WHERE cover_url IS NULL;
