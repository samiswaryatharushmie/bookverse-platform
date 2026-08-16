-- V9__fill_category_gaps.sql

-- Merge Mystery into Mystery & Thriller
UPDATE books SET category_id = '30000000-0000-0000-0000-000000000004' WHERE category_id = '3eb55736-b134-4fba-b9c2-0722b45d75dd';
DELETE FROM categories WHERE id = '3eb55736-b134-4fba-b9c2-0722b45d75dd';

-- Seed 15 books for Category: Fiction
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT 'fff5325f-1302-4687-93e6-fb7dbb539d17' as id, 'Jenny Han' as name, 'jenny-han-fff5325f' as slug, 'Biography for Jenny Han' as biography UNION ALL
  SELECT '6fb984d0-722f-4e5a-a99a-ee776b524c21' as id, 'Oscar Wilde' as name, 'oscar-wilde-6fb984d0' as slug, 'Biography for Oscar Wilde' as biography UNION ALL
  SELECT 'ef946ef7-c3e1-4305-afc5-f541228373b9' as id, 'Tahereh Mafi' as name, 'tahereh-mafi-ef946ef7' as slug, 'Biography for Tahereh Mafi' as biography UNION ALL
  SELECT 'b3d64adc-113a-487a-b74d-dba09a8950d3' as id, 'Alex Michaelides' as name, 'alex-michaelides-b3d64adc' as slug, 'Biography for Alex Michaelides' as biography UNION ALL
  SELECT '1c64d94d-256f-42fe-b2a6-2183910066b4' as id, 'Mary Shelley' as name, 'mary-shelley-1c64d94d' as slug, 'Biography for Mary Shelley' as biography UNION ALL
  SELECT '0b87f646-620a-4ac4-b3fb-66f45da422ff' as id, 'Holly Black' as name, 'holly-black-0b87f646' as slug, 'Biography for Holly Black' as biography UNION ALL
  SELECT 'ca5119c3-51d8-4d8d-a85e-ecb430864feb' as id, 'Jeff Kinney' as name, 'jeff-kinney-ca5119c3' as slug, 'Biography for Jeff Kinney' as biography UNION ALL
  SELECT '58c6bdbd-391e-4864-95da-2b313279d12c' as id, 'Colleen Hoover' as name, 'colleen-hoover-58c6bdbd' as slug, 'Biography for Colleen Hoover' as biography UNION ALL
  SELECT '5844b89d-f18e-41f7-a144-473da297533f' as id, 'H. G. Wells' as name, 'h-g-wells-5844b89d' as slug, 'Biography for H. G. Wells' as biography UNION ALL
  SELECT '37313787-b0ca-43bc-9be0-24f67b31213f' as id, 'Lauren Roberts' as name, 'lauren-roberts-37313787' as slug, 'Biography for Lauren Roberts' as biography UNION ALL
  SELECT 'fd2fd49f-e0a4-4ba8-914f-d86de38f927f' as id, 'Sheridan Le Fanu' as name, 'sheridan-le-fanu-fd2fd49f' as slug, 'Biography for Sheridan Le Fanu' as biography UNION ALL
  SELECT '0a80a9a3-c14e-47dd-b2b6-8493633ab7eb' as id, 'Dean Koontz' as name, 'dean-koontz-0a80a9a3' as slug, 'Biography for Dean Koontz' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780241753859')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('2494d090-77f5-465f-8154-62544188af5d', '9780241753859', 'The Summer I Turned Pretty Trilogy', 'the-summer-i-turned-pretty-trilogy-2494d090', 'The Summer I Turned Pretty Trilogy by Jenny Han', 2023.00, 'Unknown Publisher', '2009-01-01', 387, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9780241753859-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('2494d090-77f5-465f-8154-62544188af5d', 'fff5325f-1302-4687-93e6-fb7dbb539d17');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9786053243113')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('3464cb74-d676-404e-bcea-5e44477c8e8c', '9786053243113', 'The Picture of Dorian Gray', 'the-picture-of-dorian-gray-3464cb74', 'The Picture of Dorian Gray by Oscar Wilde', 2304.00, 'Unknown Publisher', '1890-01-01', 347, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9786053243113-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('3464cb74-d676-404e-bcea-5e44477c8e8c', '6fb984d0-722f-4e5a-a99a-ee776b524c21');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780062111234')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('a0207707-38ce-47ac-894e-533ae4fb0a99', '9780062111234', 'Shatter Me', 'shatter-me-a0207707', 'Shatter Me by Tahereh Mafi', 2369.00, 'Unknown Publisher', '2011-01-01', 218, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9780062111234-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('a0207707-38ce-47ac-894e-533ae4fb0a99', 'ef946ef7-c3e1-4305-afc5-f541228373b9');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781409181613')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('006cfe1c-d53f-43c8-903c-0979b1ed0515', '9781409181613', 'The Silent Patient', 'the-silent-patient-006cfe1c', 'The Silent Patient by Alex Michaelides', 2068.00, 'Unknown Publisher', '2018-01-01', 313, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781409181613-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('006cfe1c-d53f-43c8-903c-0979b1ed0515', 'b3d64adc-113a-487a-b74d-dba09a8950d3');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781443433181')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('30b2bdba-c35f-45f1-96ca-3be801efea6d', '9781443433181', 'Frankenstein; or, The Modern Prometheus', 'frankenstein-or-the-modern-prometheus-30b2bdba', 'Frankenstein; or, The Modern Prometheus by Mary Shelley', 4166.00, 'Unknown Publisher', '1818-01-01', 589, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781443433181-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('30b2bdba-c35f-45f1-96ca-3be801efea6d', '1c64d94d-256f-42fe-b2a6-2183910066b4');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781955876162')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('d964fe35-c11e-4d4b-8c9b-48da5a59fccc', '9781955876162', 'The Cruel Prince', 'the-cruel-prince-d964fe35', 'The Cruel Prince by Holly Black', 2644.00, 'Unknown Publisher', '2018-01-01', 219, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781955876162-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('d964fe35-c11e-4d4b-8c9b-48da5a59fccc', '0b87f646-620a-4ac4-b3fb-66f45da422ff');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9782021011968')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('903d29bf-01d9-4f5a-b2f3-e328025f5220', '9782021011968', 'Diary of a Wimpy Kid', 'diary-of-a-wimpy-kid-903d29bf', 'Diary of a Wimpy Kid by Jeff Kinney', 4843.00, 'Unknown Publisher', '2007-01-01', 392, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9782021011968-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('903d29bf-01d9-4f5a-b2f3-e328025f5220', 'ca5119c3-51d8-4d8d-a85e-ecb430864feb');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788408258360')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('dd2eb672-28c2-491b-b66a-eb04773b2b44', '9788408258360', 'It Ends With Us', 'it-ends-with-us-dd2eb672', 'It Ends With Us by Colleen Hoover', 3951.00, 'Unknown Publisher', '2012-01-01', 289, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9788408258360-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('dd2eb672-28c2-491b-b66a-eb04773b2b44', '58c6bdbd-391e-4864-95da-2b313279d12c');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781556861581')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('3e755d58-1fd0-4e5b-b6bb-1f29de53f9c8', '9781556861581', 'The Invisible Man', 'the-invisible-man-3e755d58', 'The Invisible Man by H. G. Wells', 3228.00, 'Unknown Publisher', '2000-01-01', 526, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781556861581-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('3e755d58-1fd0-4e5b-b6bb-1f29de53f9c8', '5844b89d-f18e-41f7-a144-473da297533f');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781398529489')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('41fba9d5-7669-421b-9cb8-4260495680d4', '9781398529489', 'Powerless', 'powerless-41fba9d5', 'Powerless by Lauren Roberts', 3316.00, 'Unknown Publisher', '2023-01-01', 555, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781398529489-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('41fba9d5-7669-421b-9cb8-4260495680d4', '37313787-b0ca-43bc-9be0-24f67b31213f');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781539914693')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('24c1b9c0-afaa-4112-adb7-f28811685880', '9781539914693', 'Carmilla', 'carmilla-24c1b9c0', 'Carmilla by Sheridan Le Fanu', 2153.00, 'Unknown Publisher', '1871-01-01', 267, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781539914693-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('24c1b9c0-afaa-4112-adb7-f28811685880', 'fd2fd49f-e0a4-4ba8-914f-d86de38f927f');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781780318578')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('14835840-a61e-4632-8bad-9d6a50a31902', '9781780318578', 'Unravel me', 'unravel-me-14835840', 'Unravel me by Tahereh Mafi', 4224.00, 'Unknown Publisher', '2013-01-01', 282, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781780318578-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('14835840-a61e-4632-8bad-9d6a50a31902', 'ef946ef7-c3e1-4305-afc5-f541228373b9');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9785171001605')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('93bd2053-a29b-4733-a7fa-28737c072c07', '9785171001605', 'The Summer I Turned Pretty', 'the-summer-i-turned-pretty-93bd2053', 'The Summer I Turned Pretty by Jenny Han', 2097.00, 'Unknown Publisher', '2000-01-01', 346, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9785171001605-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('93bd2053-a29b-4733-a7fa-28737c072c07', 'fff5325f-1302-4687-93e6-fb7dbb539d17');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781726017640')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('f84174c0-81fa-4bd1-98a1-405569196a26', '9781726017640', 'The Time Machine', 'the-time-machine-f84174c0', 'The Time Machine by H. G. Wells', 3510.00, 'Unknown Publisher', '1895-01-01', 335, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781726017640-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('f84174c0-81fa-4bd1-98a1-405569196a26', '5844b89d-f18e-41f7-a144-473da297533f');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781436253796')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('2f22d204-bad7-470b-a898-5b9964b5544c', '9781436253796', 'The Eyes of Darkness', 'the-eyes-of-darkness-2f22d204', 'The Eyes of Darkness by Dean Koontz', 3876.00, 'Unknown Publisher', '1981-01-01', 216, '30000000-0000-0000-0000-000000000001', 'https://covers.openlibrary.org/b/isbn/9781436253796-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('2f22d204-bad7-470b-a898-5b9964b5544c', '0a80a9a3-c14e-47dd-b2b6-8493633ab7eb');
END

-- Seed 15 books for Category: Non-Fiction
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT '5b657175-8157-4928-ad11-06b20b29a8f2' as id, 'Joseph Murphy' as name, 'joseph-murphy-5b657175' as slug, 'Biography for Joseph Murphy' as biography UNION ALL
  SELECT '13bbaf9d-8224-4bbc-accb-6444a3399bf5' as id, 'Mark Douglas' as name, 'mark-douglas-13bbaf9d' as slug, 'Biography for Mark Douglas' as biography UNION ALL
  SELECT 'ec222222-0226-4218-a41e-eab923188a1f' as id, 'Marcus Aurelius' as name, 'marcus-aurelius-ec222222' as slug, 'Biography for Marcus Aurelius' as biography UNION ALL
  SELECT '400fa5a9-919e-402b-9aea-58da7d825097' as id, 'Christopher Berry-Dee' as name, 'christopher-berry-dee-400fa5a9' as slug, 'Biography for Christopher Berry-Dee' as biography UNION ALL
  SELECT '2ecfd77d-5e65-4394-b94c-e2e144b1dca6' as id, 'Josepha Sherman' as name, 'josepha-sherman-2ecfd77d' as slug, 'Biography for Josepha Sherman' as biography UNION ALL
  SELECT 'b2946759-664c-4d34-89bf-b868e5668143' as id, 'Leil Lowndes' as name, 'leil-lowndes-b2946759' as slug, 'Biography for Leil Lowndes' as biography UNION ALL
  SELECT '3e996a6e-b087-43cd-8bde-f8fec798dd8d' as id, 'Joshua Foer' as name, 'joshua-foer-3e996a6e' as slug, 'Biography for Joshua Foer' as biography UNION ALL
  SELECT 'e6e4fb08-4d7a-4349-9a8c-c191e9fe11ea' as id, 'Max Brooks' as name, 'max-brooks-e6e4fb08' as slug, 'Biography for Max Brooks' as biography UNION ALL
  SELECT '4a3ba64b-5854-4b16-b8f6-e0bd5cee4cb9' as id, 'Robert Greene' as name, 'robert-greene-4a3ba64b' as slug, 'Biography for Robert Greene' as biography UNION ALL
  SELECT 'ad3520bf-e164-48c5-94d1-9f6d50646f80' as id, 'Claude M. Bristol' as name, 'claude-m-bristol-ad3520bf' as slug, 'Biography for Claude M. Bristol' as biography UNION ALL
  SELECT 'e905eda7-3b66-4dee-8977-0a6c4c2b9ef2' as id, 'Joanna Martine Woolfolk' as name, 'joanna-martine-woolfolk-e905eda7' as slug, 'Biography for Joanna Martine Woolfolk' as biography UNION ALL
  SELECT 'f71eb430-1728-40ce-b234-a707170e74b3' as id, 'Vladimir Il’ich Lenin' as name, 'vladimir-il-ich-lenin-f71eb430' as slug, 'Biography for Vladimir Il’ich Lenin' as biography UNION ALL
  SELECT 'fd3c906b-957b-4690-94e7-8b53b038f4d2' as id, 'Houghton Mifflin Company Staff' as name, 'houghton-mifflin-company-staff-fd3c906b' as slug, 'Biography for Houghton Mifflin Company Staff' as biography UNION ALL
  SELECT '4b37677a-dc07-447a-91d8-a101ef36c70a' as id, 'Mark Kurlansky' as name, 'mark-kurlansky-4b37677a' as slug, 'Biography for Mark Kurlansky' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9789937074391')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('14e76bcd-b53f-40ed-85d0-0adbd8b657a3', '9789937074391', 'The Power of Your Subconscious Mind', 'the-power-of-your-subconscious-mind-14e76bcd', 'The Power of Your Subconscious Mind by Joseph Murphy', 4109.00, 'Unknown Publisher', '1963-01-01', 520, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9789937074391-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('14e76bcd-b53f-40ed-85d0-0adbd8b657a3', '5b657175-8157-4928-ad11-06b20b29a8f2');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781464016882')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('a1fd50ea-4994-4d51-aa78-fe5e446083fc', '9781464016882', 'Trading in the zone', 'trading-in-the-zone-a1fd50ea', 'Trading in the zone by Mark Douglas', 2567.00, 'Unknown Publisher', '2001-01-01', 434, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9781464016882-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('a1fd50ea-4994-4d51-aa78-fe5e446083fc', '13bbaf9d-8224-4bbc-accb-6444a3399bf5');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780865975101')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('c9eaa9b9-9674-46a0-93fc-20a638c342ef', '9780865975101', 'Meditations', 'meditations-c9eaa9b9', 'Meditations by Marcus Aurelius', 3783.00, 'Unknown Publisher', '1626-01-01', 456, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9780865975101-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('c9eaa9b9-9674-46a0-93fc-20a638c342ef', 'ec222222-0226-4218-a41e-eab923188a1f');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781789461152')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9704f2d9-4040-4052-80b8-714fb3cd7917', '9781789461152', 'Talking With Psychopaths and Savages', 'talking-with-psychopaths-and-savages-9704f2d9', 'Talking With Psychopaths and Savages by Christopher Berry-Dee', 3268.00, 'Unknown Publisher', '2019-01-01', 253, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9781789461152-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9704f2d9-4040-4052-80b8-714fb3cd7917', '400fa5a9-919e-402b-9aea-58da7d825097');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781663929426')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('35f85e61-cf2a-4669-a24f-f51b0d5fbcca', '9781663929426', 'Shapes in the Sky', 'shapes-in-the-sky-35f85e61', 'Shapes in the Sky by Josepha Sherman', 4192.00, 'Unknown Publisher', '2003-01-01', 330, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9781663929426-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('35f85e61-cf2a-4669-a24f-f51b0d5fbcca', '2ecfd77d-5e65-4394-b94c-e2e144b1dca6');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780722538074')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('8179b328-61bf-4749-b5cc-16c5ac0eb968', '9780722538074', 'How to Talk to Anyone', 'how-to-talk-to-anyone-8179b328', 'How to Talk to Anyone by Leil Lowndes', 2000.00, 'Unknown Publisher', '1999-01-01', 266, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9780722538074-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('8179b328-61bf-4749-b5cc-16c5ac0eb968', 'b2946759-664c-4d34-89bf-b868e5668143');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780141952277')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('94d3a294-360d-4ce7-9bfe-8c7afae62d7b', '9780141952277', 'Moonwalking with Einstein', 'moonwalking-with-einstein-94d3a294', 'Moonwalking with Einstein by Joshua Foer', 4366.00, 'Unknown Publisher', '2000-01-01', 537, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9780141952277-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('94d3a294-360d-4ce7-9bfe-8c7afae62d7b', '3e996a6e-b087-43cd-8bde-f8fec798dd8d');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788532520647')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('ce984a0d-1be2-4236-a81b-7fe165c0f68c', '9788532520647', 'The Zombie Survival Guide', 'the-zombie-survival-guide-ce984a0d', 'The Zombie Survival Guide by Max Brooks', 2180.00, 'Unknown Publisher', '2003-01-01', 569, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9788532520647-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('ce984a0d-1be2-4236-a81b-7fe165c0f68c', 'e6e4fb08-4d7a-4349-9a8c-c191e9fe11ea');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780670891924')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('e8caa1d5-6a3d-4cdc-9df2-0368591c649c', '9780670891924', 'The Art of Seduction', 'the-art-of-seduction-e8caa1d5', 'The Art of Seduction by Robert Greene', 3317.00, 'Unknown Publisher', '2001-01-01', 473, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9780670891924-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('e8caa1d5-6a3d-4cdc-9df2-0368591c649c', '4a3ba64b-5854-4b16-b8f6-e0bd5cee4cb9');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780671827038')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('54939450-fa1d-4162-8402-4c24225fa6c0', '9780671827038', 'The magic of believing', 'the-magic-of-believing-54939450', 'The magic of believing by Claude M. Bristol', 4181.00, 'Unknown Publisher', '1948-01-01', 313, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9780671827038-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('54939450-fa1d-4162-8402-4c24225fa6c0', 'ad3520bf-e164-48c5-94d1-9f6d50646f80');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781589793774')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('5dc607d2-f524-44c2-b5b1-176a2b8f69f7', '9781589793774', 'The only astrology book you''ll ever need', 'the-only-astrology-book-you-ll-ever-need-5dc607d2', 'The only astrology book you''ll ever need by Joanna Martine Woolfolk', 3358.00, 'Unknown Publisher', '1982-01-01', 355, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9781589793774-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('5dc607d2-f524-44c2-b5b1-176a2b8f69f7', 'e905eda7-3b66-4dee-8977-0a6c4c2b9ef2');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780835103725')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('fba0fbca-f6d6-45cf-9afe-a5c954b7c33a', '9780835103725', 'State and Revolution', 'state-and-revolution-fba0fbca', 'State and Revolution by Vladimir Il’ich Lenin', 4087.00, 'Unknown Publisher', '1900-01-01', 341, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9780835103725-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('fba0fbca-f6d6-45cf-9afe-a5c954b7c33a', 'f71eb430-1728-40ce-b234-a707170e74b3');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788375541038')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('7d697ee7-8897-45b9-9eb6-07953d0d2344', '9788375541038', 'The 48 Laws of Power', 'the-48-laws-of-power-7d697ee7', 'The 48 Laws of Power by Robert Greene', 4065.00, 'Unknown Publisher', '1998-01-01', 518, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9788375541038-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('7d697ee7-8897-45b9-9eb6-07953d0d2344', '4a3ba64b-5854-4b16-b8f6-e0bd5cee4cb9');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780618932542')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('73545bc1-8df3-40df-957f-a0230639f560', '9780618932542', 'Houghton Mifflin Reading Intervention', 'houghton-mifflin-reading-intervention-73545bc1', 'Houghton Mifflin Reading Intervention by Houghton Mifflin Company Staff', 2614.00, 'Unknown Publisher', '2007-01-01', 517, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9780618932542-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('73545bc1-8df3-40df-957f-a0230639f560', 'fd3c906b-957b-4690-94e7-8b53b038f4d2');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780802713735')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('7e2773c1-8bc8-40fb-8681-a87a2bf9c050', '9780802713735', 'Salt', 'salt-7e2773c1', 'Salt by Mark Kurlansky', 4160.00, 'Unknown Publisher', '2002-01-01', 248, '30000000-0000-0000-0000-000000000002', 'https://covers.openlibrary.org/b/isbn/9780802713735-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('7e2773c1-8bc8-40fb-8681-a87a2bf9c050', '4b37677a-dc07-447a-91d8-a101ef36c70a');
END

-- Seed 10 books for Category: Science Fiction
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT 'fffca2a6-3995-4ea6-a587-52124572953e' as id, 'H. G. Wells' as name, 'h-g-wells-fffca2a6' as slug, 'Biography for H. G. Wells' as biography UNION ALL
  SELECT '3de79f60-b055-40f6-8afa-5a653d917bf6' as id, '刘慈欣' as name, '-3de79f60' as slug, 'Biography for 刘慈欣' as biography UNION ALL
  SELECT 'cc7960af-01cb-4d44-b67b-e8fa7efdd46d' as id, 'Dan Simmons' as name, 'dan-simmons-cc7960af' as slug, 'Biography for Dan Simmons' as biography UNION ALL
  SELECT '78facc3a-fc73-4fb2-bae7-82955f669682' as id, 'Isaac Asimov' as name, 'isaac-asimov-78facc3a' as slug, 'Biography for Isaac Asimov' as biography UNION ALL
  SELECT '48c87b03-7aa7-492c-8e7e-d569b5f88b17' as id, 'Аркадий Стругацкий' as name, '-48c87b03' as slug, 'Biography for Аркадий Стругацкий' as biography UNION ALL
  SELECT '9b931ca1-3be7-4b62-85cc-b2e6823757fa' as id, 'Mary Shelley' as name, 'mary-shelley-9b931ca1' as slug, 'Biography for Mary Shelley' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781556861581')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('507af729-4cb5-4122-96d1-635c39f8caf3', '9781556861581', 'The Invisible Man', 'the-invisible-man-507af729', 'The Invisible Man by H. G. Wells', 4798.00, 'Unknown Publisher', '2000-01-01', 291, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9781556861581-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('507af729-4cb5-4122-96d1-635c39f8caf3', 'fffca2a6-3995-4ea6-a587-52124572953e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9787229030933')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('932af4fb-6aba-4619-90d3-7c2ae152a503', '9787229030933', 'Death''s End (The Three-Body Problem Series Book 3)', 'death-s-end-the-three-body-problem-series-book-3-932af4fb', 'Death''s End (The Three-Body Problem Series Book 3) by 刘慈欣', 3115.00, 'Unknown Publisher', '2010-01-01', 279, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9787229030933-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('932af4fb-6aba-4619-90d3-7c2ae152a503', '3de79f60-b055-40f6-8afa-5a653d917bf6');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781491514931')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('2d57212c-85a5-41e4-9972-a2201ac63414', '9781491514931', 'The Fall of Hyperion', 'the-fall-of-hyperion-2d57212c', 'The Fall of Hyperion by Dan Simmons', 3694.00, 'Unknown Publisher', '1990-01-01', 485, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9781491514931-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('2d57212c-85a5-41e4-9972-a2201ac63414', 'cc7960af-01cb-4d44-b67b-e8fa7efdd46d');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780449024973')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('359c645d-6cb6-427e-8a09-457ab3dfa856', '9780449024973', 'The Caves of Steel', 'the-caves-of-steel-359c645d', 'The Caves of Steel by Isaac Asimov', 4495.00, 'Unknown Publisher', '1953-01-01', 324, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9780449024973-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('359c645d-6cb6-427e-8a09-457ab3dfa856', '78facc3a-fc73-4fb2-bae7-82955f669682');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9789685960434')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('acb8bf03-1025-4458-a144-afd4e23f5dd3', '9789685960434', 'The Naked Sun', 'the-naked-sun-acb8bf03', 'The Naked Sun by Isaac Asimov', 2840.00, 'Unknown Publisher', '1954-01-01', 302, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9789685960434-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('acb8bf03-1025-4458-a144-afd4e23f5dd3', '78facc3a-fc73-4fb2-bae7-82955f669682');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780671458423')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('4f0b90c5-94e7-4f89-9212-d5e6999c8c50', '9780671458423', 'Roadside Picnic', 'roadside-picnic-4f0b90c5', 'Roadside Picnic by Аркадий Стругацкий', 4581.00, 'Unknown Publisher', '1978-01-01', 304, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9780671458423-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('4f0b90c5-94e7-4f89-9212-d5e6999c8c50', '48c87b03-7aa7-492c-8e7e-d569b5f88b17');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788804686521')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('eaa852fc-6bd0-4ae9-991c-e1e17052859d', '9788804686521', 'The Dark Forest (The Three-Body Problem Series Book 2)', 'the-dark-forest-the-three-body-problem-series-book-2-eaa852fc', 'The Dark Forest (The Three-Body Problem Series Book 2) by 刘慈欣', 2393.00, 'Unknown Publisher', '2008-01-01', 278, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9788804686521-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('eaa852fc-6bd0-4ae9-991c-e1e17052859d', '3de79f60-b055-40f6-8afa-5a653d917bf6');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9783453318670')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('1b7c733e-6370-4af5-b537-a81b384d72c8', '9783453318670', 'The Foundation Trilogy', 'the-foundation-trilogy-1b7c733e', 'The Foundation Trilogy by Isaac Asimov', 3974.00, 'Unknown Publisher', '1950-01-01', 352, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9783453318670-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('1b7c733e-6370-4af5-b537-a81b384d72c8', '78facc3a-fc73-4fb2-bae7-82955f669682');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781443433181')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('247bf932-2350-4aa0-a606-c0084125074f', '9781443433181', 'Frankenstein; or, The Modern Prometheus', 'frankenstein-or-the-modern-prometheus-247bf932', 'Frankenstein; or, The Modern Prometheus by Mary Shelley', 3157.00, 'Unknown Publisher', '1818-01-01', 425, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9781443433181-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('247bf932-2350-4aa0-a606-c0084125074f', '9b931ca1-3be7-4b62-85cc-b2e6823757fa');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9782843623103')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('72e9295d-be77-4dd3-bd3b-066c094cf4fc', '9782843623103', 'Nightfall', 'nightfall-72e9295d', 'Nightfall by Isaac Asimov', 4786.00, 'Unknown Publisher', '1969-01-01', 241, '30000000-0000-0000-0000-000000000003', 'https://covers.openlibrary.org/b/isbn/9782843623103-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('72e9295d-be77-4dd3-bd3b-066c094cf4fc', '78facc3a-fc73-4fb2-bae7-82955f669682');
END

-- Seed 10 books for Category: Mystery & Thriller
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT 'dea3dba2-6f21-42d0-9c20-b7d75d98d2c3' as id, 'Alex Michaelides' as name, 'alex-michaelides-dea3dba2' as slug, 'Biography for Alex Michaelides' as biography UNION ALL
  SELECT 'a34fae5a-b8d2-4c9e-ab2a-330cf416c19e' as id, 'Freida McFadden' as name, 'freida-mcfadden-a34fae5a' as slug, 'Biography for Freida McFadden' as biography UNION ALL
  SELECT '03e4043b-039f-402f-bb80-db74a76868f9' as id, 'M. L. Rio' as name, 'm-l-rio-03e4043b' as slug, 'Biography for M. L. Rio' as biography UNION ALL
  SELECT '89b2a1d2-4fa0-4afa-9c65-0a16b2b761da' as id, 'Michael Crichton' as name, 'michael-crichton-89b2a1d2' as slug, 'Biography for Michael Crichton' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781409181613')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('f3e406d2-dcf3-47d5-9023-be6138d3c175', '9781409181613', 'The Silent Patient', 'the-silent-patient-f3e406d2', 'The Silent Patient by Alex Michaelides', 3290.00, 'Unknown Publisher', '2018-01-01', 384, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9781409181613-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('f3e406d2-dcf3-47d5-9023-be6138d3c175', 'dea3dba2-6f21-42d0-9c20-b7d75d98d2c3');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788367815888')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9c224e74-a0f5-44f2-844c-f9b4f35df7a5', '9788367815888', 'The Housemaid', 'the-housemaid-9c224e74', 'The Housemaid by Freida McFadden', 2418.00, 'Unknown Publisher', '2022-01-01', 553, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9788367815888-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9c224e74-a0f5-44f2-844c-f9b4f35df7a5', 'a34fae5a-b8d2-4c9e-ab2a-330cf416c19e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781464221361')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('b7687a97-1887-4bbd-b6b8-0bb03e0da5be', '9781464221361', 'Never Lie', 'never-lie-b7687a97', 'Never Lie by Freida McFadden', 3505.00, 'Unknown Publisher', '2022-01-01', 354, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9781464221361-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('b7687a97-1887-4bbd-b6b8-0bb03e0da5be', 'a34fae5a-b8d2-4c9e-ab2a-330cf416c19e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780349132617')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('79b9049c-4f68-4bf1-b07c-6ea61b3d6aa0', '9780349132617', 'The Housemaid''s Secret', 'the-housemaid-s-secret-79b9049c', 'The Housemaid''s Secret by Freida McFadden', 4657.00, 'Unknown Publisher', '2023-01-01', 383, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9780349132617-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('79b9049c-4f68-4bf1-b07c-6ea61b3d6aa0', 'a34fae5a-b8d2-4c9e-ab2a-330cf416c19e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781785656477')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9c27b65c-dec6-4e75-9456-138121472c76', '9781785656477', 'If We Were Villains', 'if-we-were-villains-9c27b65c', 'If We Were Villains by M. L. Rio', 3640.00, 'Unknown Publisher', '2017-01-01', 235, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9781785656477-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9c27b65c-dec6-4e75-9456-138121472c76', '03e4043b-039f-402f-bb80-db74a76868f9');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781464221354')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('15abb097-58bd-47d7-b918-4308dedf5377', '9781464221354', 'The Locked Door', 'the-locked-door-15abb097', 'The Locked Door by Freida McFadden', 2967.00, 'Unknown Publisher', '2021-01-01', 565, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9781464221354-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('15abb097-58bd-47d7-b918-4308dedf5377', 'a34fae5a-b8d2-4c9e-ab2a-330cf416c19e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781420519426')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('bbbf47dd-41d6-47da-988d-1af506b8eabc', '9781420519426', 'The Inmate', 'the-inmate-bbbf47dd', 'The Inmate by Freida McFadden', 3826.00, 'Unknown Publisher', '2022-01-01', 247, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9781420519426-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('bbbf47dd-41d6-47da-988d-1af506b8eabc', 'a34fae5a-b8d2-4c9e-ab2a-330cf416c19e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781532902949')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('692e72c5-3f75-48a0-91b0-aaf43364f61e', '9781532902949', 'Brain Damage', 'brain-damage-692e72c5', 'Brain Damage by Freida McFadden', 4322.00, 'Unknown Publisher', '2016-01-01', 328, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9781532902949-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('692e72c5-3f75-48a0-91b0-aaf43364f61e', 'a34fae5a-b8d2-4c9e-ab2a-330cf416c19e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781500420536')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('92170629-72a5-4048-ac0e-f50a17c3e6d8', '9781500420536', 'Suicide Med', 'suicide-med-92170629', 'Suicide Med by Freida McFadden', 4428.00, 'Unknown Publisher', '2014-01-01', 376, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9781500420536-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('92170629-72a5-4048-ac0e-f50a17c3e6d8', 'a34fae5a-b8d2-4c9e-ab2a-330cf416c19e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780375402975')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('52c8bd3d-fc01-4cc6-9677-670e1d366478', '9780375402975', 'Congo', 'congo-52c8bd3d', 'Congo by Michael Crichton', 2452.00, 'Unknown Publisher', '1980-01-01', 446, '30000000-0000-0000-0000-000000000004', 'https://covers.openlibrary.org/b/isbn/9780375402975-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('52c8bd3d-fc01-4cc6-9677-670e1d366478', '89b2a1d2-4fa0-4afa-9c65-0a16b2b761da');
END

-- Seed 15 books for Category: Biography
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT '044400a6-0754-43e7-a332-0afc51885056' as id, 'A. P. J. Abdul Kalam' as name, 'a-p-j-abdul-kalam-044400a6' as slug, 'Biography for A. P. J. Abdul Kalam' as biography UNION ALL
  SELECT '75af2ff1-b49e-4230-81cb-d963063d1d8c' as id, 'Anne Frank' as name, 'anne-frank-75af2ff1' as slug, 'Biography for Anne Frank' as biography UNION ALL
  SELECT '88200530-d5a5-43cd-9de7-c167317fe065' as id, 'Yogananda Paramahansa' as name, 'yogananda-paramahansa-88200530' as slug, 'Biography for Yogananda Paramahansa' as biography UNION ALL
  SELECT '5d50253f-bdcb-492f-b21f-7c44ed868c93' as id, 'Jennette McCurdy' as name, 'jennette-mccurdy-5d50253f' as slug, 'Biography for Jennette McCurdy' as biography UNION ALL
  SELECT '487334bb-d6c3-4d26-b39e-941000afc3c1' as id, 'Tara Westover' as name, 'tara-westover-487334bb' as slug, 'Biography for Tara Westover' as biography UNION ALL
  SELECT '6e657cb6-c200-499e-8077-c216d6e2e057' as id, 'Hunter S. Thompson' as name, 'hunter-s-thompson-6e657cb6' as slug, 'Biography for Hunter S. Thompson' as biography UNION ALL
  SELECT '5123a98c-5eed-4b14-a735-ecd8b4d822de' as id, 'Robert L. Heilbroner' as name, 'robert-l-heilbroner-5123a98c' as slug, 'Biography for Robert L. Heilbroner' as biography UNION ALL
  SELECT '3f352105-832b-4d3a-8916-fd26ca229230' as id, 'Frederick Douglass' as name, 'frederick-douglass-3f352105' as slug, 'Biography for Frederick Douglass' as biography UNION ALL
  SELECT '8ee19266-0fa3-4147-913f-f1a59022bb71' as id, 'Marjane Satrapi' as name, 'marjane-satrapi-8ee19266' as slug, 'Biography for Marjane Satrapi' as biography UNION ALL
  SELECT '39452367-c65b-4344-a7d1-197626b4fceb' as id, '村上春樹' as name, '-39452367' as slug, 'Biography for 村上春樹' as biography UNION ALL
  SELECT 'f525f1cd-cfc6-4eba-ae29-b2de4fd1d7f4' as id, 'Patti Smith' as name, 'patti-smith-f525f1cd' as slug, 'Biography for Patti Smith' as biography UNION ALL
  SELECT '7b7dd659-2987-4cb0-ba12-26812c6a4ead' as id, 'Trevor Noah' as name, 'trevor-noah-7b7dd659' as slug, 'Biography for Trevor Noah' as biography UNION ALL
  SELECT 'fa310244-7a83-4ce4-b2e4-bd60e7a55922' as id, 'Iceberg Slim' as name, 'iceberg-slim-fa310244' as slug, 'Biography for Iceberg Slim' as biography UNION ALL
  SELECT '83b2fbbb-9c1c-45c8-8037-0192be2ee1cb' as id, 'Ben Carson' as name, 'ben-carson-83b2fbbb' as slug, 'Biography for Ben Carson' as biography UNION ALL
  SELECT 'cbebb273-9536-481c-b1dc-2a72e9301524' as id, 'Paul Kalanithi' as name, 'paul-kalanithi-cbebb273' as slug, 'Biography for Paul Kalanithi' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788173715181')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('1ffddcb0-47da-437a-a665-5693e3c428c6', '9788173715181', 'Wings of Fire', 'wings-of-fire-1ffddcb0', 'Wings of Fire by A. P. J. Abdul Kalam', 4927.00, 'Unknown Publisher', '1999-01-01', 566, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9788173715181-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('1ffddcb0-47da-437a-a665-5693e3c428c6', '044400a6-0754-43e7-a332-0afc51885056');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9789389567953')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('b55348ba-0d5a-4421-a659-e7fe59ba7e86', '9789389567953', 'The Diary of a Young Girl- Anne Frank', 'the-diary-of-a-young-girl-anne-frank-b55348ba', 'The Diary of a Young Girl- Anne Frank by Anne Frank', 2538.00, 'Unknown Publisher', '2001-01-01', 505, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9789389567953-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('b55348ba-0d5a-4421-a659-e7fe59ba7e86', '75af2ff1-b49e-4230-81cb-d963063d1d8c');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788121618793')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('339fb198-a65d-4b16-87a5-684df7b2ed78', '9788121618793', 'Autobiography of a Yogi', 'autobiography-of-a-yogi-339fb198', 'Autobiography of a Yogi by Yogananda Paramahansa', 3006.00, 'Unknown Publisher', '1946-01-01', 541, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9788121618793-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('339fb198-a65d-4b16-87a5-684df7b2ed78', '88200530-d5a5-43cd-9de7-c167317fe065');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781797147963')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('fb2d680c-811d-46cb-bfa4-139a92739cc8', '9781797147963', 'I''m Glad My Mom Died', 'i-m-glad-my-mom-died-fb2d680c', 'I''m Glad My Mom Died by Jennette McCurdy', 2638.00, 'Unknown Publisher', '2022-01-01', 445, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9781797147963-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('fb2d680c-811d-46cb-bfa4-139a92739cc8', '5d50253f-bdcb-492f-b21f-7c44ed868c93');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9783462050127')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('50543dea-debd-4609-bbe0-ee2ea101f0fb', '9783462050127', 'Educated', 'educated-50543dea', 'Educated by Tara Westover', 2334.00, 'Unknown Publisher', '2018-01-01', 299, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9783462050127-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('50543dea-debd-4609-bbe0-ee2ea101f0fb', '487334bb-d6c3-4d26-b39e-941000afc3c1');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781417665884')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('2913c86c-d10d-469b-85e3-318001b798f2', '9781417665884', 'Fear and Loathing in Las Vegas', 'fear-and-loathing-in-las-vegas-2913c86c', 'Fear and Loathing in Las Vegas by Hunter S. Thompson', 4645.00, 'Unknown Publisher', '1971-01-01', 339, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9781417665884-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('2913c86c-d10d-469b-85e3-318001b798f2', '6e657cb6-c200-499e-8077-c216d6e2e057');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780671213268')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('fdcabcf8-66cd-4055-aa02-0c2ffb5be675', '9780671213268', 'The worldly philosophers', 'the-worldly-philosophers-fdcabcf8', 'The worldly philosophers by Robert L. Heilbroner', 4900.00, 'Unknown Publisher', '1953-01-01', 272, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9780671213268-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('fdcabcf8-66cd-4055-aa02-0c2ffb5be675', '5123a98c-5eed-4b14-a735-ecd8b4d822de');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781915054814')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('dec77aa3-57a7-43a1-ae01-25359ebd7b06', '9781915054814', 'Narrative of the life of Frederick Douglass', 'narrative-of-the-life-of-frederick-douglass-dec77aa3', 'Narrative of the life of Frederick Douglass by Frederick Douglass', 4926.00, 'Unknown Publisher', '1845-01-01', 534, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9781915054814-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('dec77aa3-57a7-43a1-ae01-25359ebd7b06', '3f352105-832b-4d3a-8916-fd26ca229230');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781417640416')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('e3f6eadb-51a6-4be8-bc0b-c0995151fd4b', '9781417640416', 'Persepolis 1 & 2', 'persepolis-1-2-e3f6eadb', 'Persepolis 1 & 2 by Marjane Satrapi', 3387.00, 'Unknown Publisher', '2003-01-01', 535, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9781417640416-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('e3f6eadb-51a6-4be8-bc0b-c0995151fd4b', '8ee19266-0fa3-4147-913f-f1a59022bb71');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9783442739455')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('656035c4-cd51-4da9-8cf9-3c42b3e83698', '9783442739455', '走ることについて語るときに僕の語ること', '-656035c4', '走ることについて語るときに僕の語ること by 村上春樹', 4767.00, 'Unknown Publisher', '2006-01-01', 271, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9783442739455-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('656035c4-cd51-4da9-8cf9-3c42b3e83698', '39452367-c65b-4344-a7d1-197626b4fceb');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780747548409')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('94a8e4d1-6e43-4411-a927-2556525f00b3', '9780747548409', 'Just Kids', 'just-kids-94a8e4d1', 'Just Kids by Patti Smith', 4102.00, 'Unknown Publisher', '2006-01-01', 369, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9780747548409-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('94a8e4d1-6e43-4411-a927-2556525f00b3', 'f525f1cd-cfc6-4eba-ae29-b2de4fd1d7f4');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9783896675903')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('1a8130c0-0b8b-4b11-af09-b9a7786a6793', '9783896675903', 'Born a Crime', 'born-a-crime-1a8130c0', 'Born a Crime by Trevor Noah', 4657.00, 'Unknown Publisher', '2016-01-01', 292, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9783896675903-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('1a8130c0-0b8b-4b11-af09-b9a7786a6793', '7b7dd659-2987-4cb0-ba12-26812c6a4ead');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781847673329')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('02c8de51-64ab-41ae-bb4f-2983797e2680', '9781847673329', 'Pimp', 'pimp-02c8de51', 'Pimp by Iceberg Slim', 2389.00, 'Unknown Publisher', '1967-01-01', 351, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9781847673329-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('02c8de51-64ab-41ae-bb4f-2983797e2680', 'fa310244-7a83-4ce4-b2e4-bd60e7a55922');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780310295549')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('6b1acc83-8863-4425-8a08-0f84449f38ad', '9780310295549', 'Gifted hands', 'gifted-hands-6b1acc83', 'Gifted hands by Ben Carson', 3444.00, 'Unknown Publisher', '1990-01-01', 283, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9780310295549-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('6b1acc83-8863-4425-8a08-0f84449f38ad', '83b2fbbb-9c1c-45c8-8037-0192be2ee1cb');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781847923677')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('6f7f6cf3-efd4-4dd5-b911-2bc1c345b314', '9781847923677', 'When Breath Becomes Air', 'when-breath-becomes-air-6f7f6cf3', 'When Breath Becomes Air by Paul Kalanithi', 2130.00, 'Unknown Publisher', '2016-01-01', 237, '30000000-0000-0000-0000-000000000005', 'https://covers.openlibrary.org/b/isbn/9781847923677-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('6f7f6cf3-efd4-4dd5-b911-2bc1c345b314', 'cbebb273-9536-481c-b1dc-2a72e9301524');
END

-- Seed 15 books for Category: Technology
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT '667f4d38-8656-4d5f-a55b-01ad58f84860' as id, 'Ashlee Vance' as name, 'ashlee-vance-667f4d38' as slug, 'Biography for Ashlee Vance' as biography UNION ALL
  SELECT 'fa57be71-88d0-46fa-a6cb-084ba4b6a5e4' as id, 'Hannah Fry' as name, 'hannah-fry-fa57be71' as slug, 'Biography for Hannah Fry' as biography UNION ALL
  SELECT '83faaa1d-de5b-473f-84fe-7d73752d7f7e' as id, 'Blake Crouch' as name, 'blake-crouch-83faaa1d' as slug, 'Biography for Blake Crouch' as biography UNION ALL
  SELECT '553ef37e-fa31-46d6-b834-33e47f3bb1f0' as id, 'Cal Newport' as name, 'cal-newport-553ef37e' as slug, 'Biography for Cal Newport' as biography UNION ALL
  SELECT 'f2d5846e-46cb-4289-93c2-3b8a3fe8e52f' as id, 'Dave Eggers' as name, 'dave-eggers-f2d5846e' as slug, 'Biography for Dave Eggers' as biography UNION ALL
  SELECT 'd7851a1a-6ce0-452b-a7d3-54067d37c2a8' as id, 'William Gibson' as name, 'william-gibson-d7851a1a' as slug, 'Biography for William Gibson' as biography UNION ALL
  SELECT '5e2486ef-e137-4b14-835e-2276612a4ac5' as id, 'Sio-Iong Ao' as name, 'sio-iong-ao-5e2486ef' as slug, 'Biography for Sio-Iong Ao' as biography UNION ALL
  SELECT '9f9d1534-53f1-4264-aad4-b8294b44dee2' as id, 'Geoffrey A. Moore' as name, 'geoffrey-a-moore-9f9d1534' as slug, 'Biography for Geoffrey A. Moore' as biography UNION ALL
  SELECT '5fbc998c-4054-46dc-88ad-457ea33d6bcc' as id, 'E. F. Schumacher' as name, 'e-f-schumacher-5fbc998c' as slug, 'Biography for E. F. Schumacher' as biography UNION ALL
  SELECT 'b858fb7a-6420-46f5-b75a-ce02af6e868a' as id, 'Neal Stephenson' as name, 'neal-stephenson-b858fb7a' as slug, 'Biography for Neal Stephenson' as biography UNION ALL
  SELECT '8745eb59-edee-4009-96b0-8fafab2bde0a' as id, 'Hungry Minds' as name, 'hungry-minds-8745eb59' as slug, 'Biography for Hungry Minds' as biography UNION ALL
  SELECT 'dd231ec1-b02c-4a05-a384-1ebf28f7442b' as id, 'Theodore Kaczynski' as name, 'theodore-kaczynski-dd231ec1' as slug, 'Biography for Theodore Kaczynski' as biography UNION ALL
  SELECT '909d4a1f-4d81-4b91-8220-7216656c6aac' as id, 'Arthur C. Clarke' as name, 'arthur-c-clarke-909d4a1f' as slug, 'Biography for Arthur C. Clarke' as biography UNION ALL
  SELECT '9640c392-9b72-4993-bd76-6f9bd4685bdb' as id, 'Kevin Kelly' as name, 'kevin-kelly-9640c392' as slug, 'Biography for Kevin Kelly' as biography UNION ALL
  SELECT '4b3a89ed-6472-4704-ab57-a6cac6647a2a' as id, 'Max Tegmark' as name, 'max-tegmark-4b3a89ed' as slug, 'Biography for Max Tegmark' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780241430903')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('ab09bb1a-4722-45cd-a800-a0a5bee7d7d3', '9780241430903', 'Elon Musk', 'elon-musk-ab09bb1a', 'Elon Musk by Ashlee Vance', 3998.00, 'Unknown Publisher', '2013-01-01', 490, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780241430903-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('ab09bb1a-4722-45cd-a800-a0a5bee7d7d3', '667f4d38-8656-4d5f-a55b-01ad58f84860');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781784163068')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('debce5f0-2a7d-4193-813d-ea3b870278a3', '9781784163068', 'Hello world', 'hello-world-debce5f0', 'Hello world by Hannah Fry', 2636.00, 'Unknown Publisher', '2018-01-01', 541, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9781784163068-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('debce5f0-2a7d-4193-813d-ea3b870278a3', 'fa57be71-88d0-46fa-a6cb-084ba4b6a5e4');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788416858217')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('da33dff5-e5fb-46be-b302-e583e998fc81', '9788416858217', 'Dark Matter', 'dark-matter-da33dff5', 'Dark Matter by Blake Crouch', 4974.00, 'Unknown Publisher', '2016-01-01', 207, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9788416858217-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('da33dff5-e5fb-46be-b302-e583e998fc81', '83faaa1d-de5b-473f-84fe-7d73752d7f7e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780525536543')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('b16c14c6-e230-42bf-a24c-a75750b55081', '9780525536543', 'Digital Minimalism', 'digital-minimalism-b16c14c6', 'Digital Minimalism by Cal Newport', 2563.00, 'Unknown Publisher', '2019-01-01', 523, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780525536543-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('b16c14c6-e230-42bf-a24c-a75750b55081', '553ef37e-fa31-46d6-b834-33e47f3bb1f0');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780241146484')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9b39aa39-6030-4391-b749-59e1e2cbadf9', '9780241146484', 'The Circle', 'the-circle-9b39aa39', 'The Circle by Dave Eggers', 3541.00, 'Unknown Publisher', '2013-01-01', 305, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780241146484-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9b39aa39-6030-4391-b749-59e1e2cbadf9', 'f2d5846e-46cb-4289-93c2-3b8a3fe8e52f');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9789752109872')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9c7a952b-dff0-4f3a-94de-aa5d0a9827e3', '9789752109872', 'All Tomorrow''s Parties', 'all-tomorrow-s-parties-9c7a952b', 'All Tomorrow''s Parties by William Gibson', 2731.00, 'Unknown Publisher', '1999-01-01', 358, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9789752109872-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9c7a952b-dff0-4f3a-94de-aa5d0a9827e3', 'd7851a1a-6ce0-452b-a7d3-54067d37c2a8');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9789811039492')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('8f592c72-5c9f-4baa-8300-3ff32363c0f5', '9789811039492', 'Transactions on Engineering Technologies', 'transactions-on-engineering-technologies-8f592c72', 'Transactions on Engineering Technologies by Sio-Iong Ao', 2048.00, 'Unknown Publisher', '2013-01-01', 226, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9789811039492-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('8f592c72-5c9f-4baa-8300-3ff32363c0f5', '5e2486ef-e137-4b14-835e-2276612a4ac5');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781841120638')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('d90c832c-bb7f-4615-bdcf-793ea1579b76', '9781841120638', 'Crossing the Chasm', 'crossing-the-chasm-d90c832c', 'Crossing the Chasm by Geoffrey A. Moore', 2819.00, 'Unknown Publisher', '1991-01-01', 379, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9781841120638-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('d90c832c-bb7f-4615-bdcf-793ea1579b76', '9f9d1534-53f1-4264-aad4-b8294b44dee2');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780061361227')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9daa37db-2a73-4829-84eb-ee3d66b50f2c', '9780061361227', 'Small Is Beautiful', 'small-is-beautiful-9daa37db', 'Small Is Beautiful by E. F. Schumacher', 2028.00, 'Unknown Publisher', '1905-01-01', 532, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780061361227-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9daa37db-2a73-4829-84eb-ee3d66b50f2c', '5fbc998c-4054-46dc-88ad-457ea33d6bcc');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780802198570')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('b1aca2dd-48d3-4046-8dfb-7829c9703757', '9780802198570', 'Zodiac', 'zodiac-b1aca2dd', 'Zodiac by Neal Stephenson', 3516.00, 'Unknown Publisher', '1988-01-01', 401, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780802198570-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('b1aca2dd-48d3-4046-8dfb-7829c9703757', 'b858fb7a-6420-46f5-b75a-ce02af6e868a');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780578377452')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('a30bbcb6-1325-44ee-bfe1-0b3c9735323d', '9780578377452', 'The Book', 'the-book-a30bbcb6', 'The Book by Hungry Minds', 4849.00, 'Unknown Publisher', '2022-01-01', 530, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780578377452-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('a30bbcb6-1325-44ee-bfe1-0b3c9735323d', '8745eb59-edee-4009-96b0-8fafab2bde0a');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9782910386078')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('c5c88400-6be7-4834-9aca-b3f70c3a6b39', '9782910386078', 'Industrial Society and Its Future', 'industrial-society-and-its-future-c5c88400', 'Industrial Society and Its Future by Theodore Kaczynski', 3245.00, 'Unknown Publisher', '1995-01-01', 433, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9782910386078-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('c5c88400-6be7-4834-9aca-b3f70c3a6b39', 'dd231ec1-b02c-4a05-a384-1ebf28f7442b');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780330280686')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('06585702-1f75-479c-bdc0-da8696d958ad', '9780330280686', 'Profiles of the future', 'profiles-of-the-future-06585702', 'Profiles of the future by Arthur C. Clarke', 4569.00, 'Unknown Publisher', '1962-01-01', 595, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780330280686-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('06585702-1f75-479c-bdc0-da8696d958ad', '909d4a1f-4d81-4b91-8220-7216656c6aac');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780670022151')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('f4dc80d7-0f32-49e8-8a02-00bfb4d6af71', '9780670022151', 'What technology wants', 'what-technology-wants-f4dc80d7', 'What technology wants by Kevin Kelly', 2649.00, 'Unknown Publisher', '2010-01-01', 594, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780670022151-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('f4dc80d7-0f32-49e8-8a02-00bfb4d6af71', '9640c392-9b72-4993-bd76-6f9bd4685bdb');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780451485076')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('ba613bd5-13e3-4934-829d-b5c456c3ac69', '9780451485076', 'Life 3.0', 'life-3-0-ba613bd5', 'Life 3.0 by Max Tegmark', 4267.00, 'Unknown Publisher', '2017-01-01', 521, '30000000-0000-0000-0000-000000000006', 'https://covers.openlibrary.org/b/isbn/9780451485076-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('ba613bd5-13e3-4934-829d-b5c456c3ac69', '4b3a89ed-6472-4704-ab57-a6cac6647a2a');
END

-- Seed 15 books for Category: Children
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT '093dd944-cc75-4cc1-8115-de1d488cce59' as id, 'Roald Dahl' as name, 'roald-dahl-093dd944' as slug, 'Biography for Roald Dahl' as biography UNION ALL
  SELECT 'e2c5f211-5368-4e54-9633-91cff4540b2c' as id, 'Edith Nesbit' as name, 'edith-nesbit-e2c5f211' as slug, 'Biography for Edith Nesbit' as biography UNION ALL
  SELECT 'decb669b-b35d-4f10-8ab0-9cd8d322145c' as id, 'Steven Banks' as name, 'steven-banks-decb669b' as slug, 'Biography for Steven Banks' as biography UNION ALL
  SELECT '7ebb5068-01e9-4aa6-8e35-c4d665e9126e' as id, 'RH Disney' as name, 'rh-disney-7ebb5068' as slug, 'Biography for RH Disney' as biography UNION ALL
  SELECT 'd22ed2a0-b3c6-499f-aca7-010834f41ff7' as id, 'Amanda Haley' as name, 'amanda-haley-d22ed2a0' as slug, 'Biography for Amanda Haley' as biography UNION ALL
  SELECT '788b2a95-0798-4372-b1aa-59e94397bcfd' as id, 'DK Publishing' as name, 'dk-publishing-788b2a95' as slug, 'Biography for DK Publishing' as biography UNION ALL
  SELECT '461762f1-aee2-4125-9b44-06bb1d6d0442' as id, 'Sharleen Collicott' as name, 'sharleen-collicott-461762f1' as slug, 'Biography for Sharleen Collicott' as biography UNION ALL
  SELECT '5fc009b2-16e7-4cb6-b95c-ad5c858a61e4' as id, 'Margery Williams Bianco' as name, 'margery-williams-bianco-5fc009b2' as slug, 'Biography for Margery Williams Bianco' as biography UNION ALL
  SELECT '415904f1-a0f3-4fee-a5d3-cb557d7b411c' as id, 'Robert Lawrence Stine' as name, 'robert-lawrence-stine-415904f1' as slug, 'Biography for Robert Lawrence Stine' as biography UNION ALL
  SELECT '9d484d56-ee24-46a0-815b-b019d5533d4c' as id, 'Ruskin Bond' as name, 'ruskin-bond-9d484d56' as slug, 'Biography for Ruskin Bond' as biography UNION ALL
  SELECT '0d980841-1747-44eb-a28f-1d3dd598838c' as id, 'Sam McBratney' as name, 'sam-mcbratney-0d980841' as slug, 'Biography for Sam McBratney' as biography UNION ALL
  SELECT 'f63f3d40-f017-4b82-bf4d-b888492be787' as id, 'Tahereh Mafi' as name, 'tahereh-mafi-f63f3d40' as slug, 'Biography for Tahereh Mafi' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780141318271')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('334abed4-bd3c-4399-886a-74f1e27d0943', '9780141318271', 'Fantastic Mr Fox', 'fantastic-mr-fox-334abed4', 'Fantastic Mr Fox by Roald Dahl', 2350.00, 'Unknown Publisher', '1970-01-01', 366, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780141318271-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('334abed4-bd3c-4399-886a-74f1e27d0943', '093dd944-cc75-4cc1-8115-de1d488cce59');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781981247165')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('ded81351-544c-4f06-9408-6268fca001b0', '9781981247165', 'The Book of Dragons', 'the-book-of-dragons-ded81351', 'The Book of Dragons by Edith Nesbit', 4012.00, 'Unknown Publisher', '1973-01-01', 410, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9781981247165-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('ded81351-544c-4f06-9408-6268fca001b0', 'e2c5f211-5368-4e54-9633-91cff4540b2c');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780141322636')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('bd204b34-5d85-40bf-bf19-2f97d586e6e1', '9780141322636', 'James and the Giant Peach', 'james-and-the-giant-peach-bd204b34', 'James and the Giant Peach by Roald Dahl', 3617.00, 'Unknown Publisher', '1961-01-01', 239, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780141322636-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('bd204b34-5d85-40bf-bf19-2f97d586e6e1', '093dd944-cc75-4cc1-8115-de1d488cce59');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780689863172')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('b7411ac7-5a5f-4ee6-97a3-554539baba44', '9780689863172', 'Love Potion', 'love-potion-b7411ac7', 'Love Potion by Steven Banks', 4103.00, 'Unknown Publisher', '2003-01-01', 418, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780689863172-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('b7411ac7-5a5f-4ee6-97a3-554539baba44', 'decb669b-b35d-4f10-8ab0-9cd8d322145c');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780736423298')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('428f298b-9d1b-4e14-9b9a-76883878c940', '9780736423298', 'Chicken Little (Read-Aloud Storybook)', 'chicken-little-read-aloud-storybook-428f298b', 'Chicken Little (Read-Aloud Storybook) by RH Disney', 2416.00, 'Unknown Publisher', '2005-01-01', 459, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780736423298-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('428f298b-9d1b-4e14-9b9a-76883878c940', '7ebb5068-01e9-4aa6-8e35-c4d665e9126e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781402727184')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('a23fccda-16dd-4275-ac92-29b1a0341815', '9781402727184', 'Ready, Alice?', 'ready-alice-a23fccda', 'Ready, Alice? by Amanda Haley', 3387.00, 'Unknown Publisher', '2005-01-01', 467, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9781402727184-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('a23fccda-16dd-4275-ac92-29b1a0341815', 'd22ed2a0-b3c6-499f-aca7-010834f41ff7');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780789485137')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9fb55814-c9cf-4a2e-83dc-17e919d57f16', '9780789485137', 'First Day at Gymnastics', 'first-day-at-gymnastics-9fb55814', 'First Day at Gymnastics by DK Publishing', 2566.00, 'Unknown Publisher', '2002-01-01', 316, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780789485137-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9fb55814-c9cf-4a2e-83dc-17e919d57f16', '788b2a95-0798-4372-b1aa-59e94397bcfd');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780060002008')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('160ad8ff-1e2a-4fa4-89e9-a5c7d26eb787', '9780060002008', 'Mildred and Sam', 'mildred-and-sam-160ad8ff', 'Mildred and Sam by Sharleen Collicott', 4441.00, 'Unknown Publisher', '2002-01-01', 494, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780060002008-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('160ad8ff-1e2a-4fa4-89e9-a5c7d26eb787', '461762f1-aee2-4125-9b44-06bb1d6d0442');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788585490683')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('4879154a-7b32-4867-86ec-b15acee3b594', '9788585490683', 'The Twits', 'the-twits-4879154a', 'The Twits by Roald Dahl', 2895.00, 'Unknown Publisher', '1967-01-01', 304, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9788585490683-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('4879154a-7b32-4867-86ec-b15acee3b594', '093dd944-cc75-4cc1-8115-de1d488cce59');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780370324203')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('cb56783a-fadb-4a06-b045-a3c9c6f4c82d', '9780370324203', 'The Classic Tale of the Velveteen Rabbit', 'the-classic-tale-of-the-velveteen-rabbit-cb56783a', 'The Classic Tale of the Velveteen Rabbit by Margery Williams Bianco', 2780.00, 'Unknown Publisher', '1900-01-01', 318, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780370324203-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('cb56783a-fadb-4a06-b045-a3c9c6f4c82d', '5fc009b2-16e7-4cb6-b95c-ad5c858a61e4');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9783785530030')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('057d9c3b-52f7-441d-8011-fce9c6043a25', '9783785530030', 'Fear Street - Sunburn', 'fear-street-sunburn-057d9c3b', 'Fear Street - Sunburn by Robert Lawrence Stine', 3371.00, 'Unknown Publisher', '1993-01-01', 551, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9783785530030-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('057d9c3b-52f7-441d-8011-fce9c6043a25', '415904f1-a0f3-4fee-a5d3-cb557d7b411c');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780241023242')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('17657c4e-18e1-4914-935b-de9f5e5b9fa5', '9780241023242', 'The Blue Umbrella', 'the-blue-umbrella-17657c4e', 'The Blue Umbrella by Ruskin Bond', 2322.00, 'Unknown Publisher', '1974-01-01', 504, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780241023242-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('17657c4e-18e1-4914-935b-de9f5e5b9fa5', '9d484d56-ee24-46a0-815b-b019d5533d4c');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9783737360883')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('d6d1bf24-3383-40d3-89a1-fc0430ab3bf7', '9783737360883', 'Guess How Much I Love You', 'guess-how-much-i-love-you-d6d1bf24', 'Guess How Much I Love You by Sam McBratney', 3127.00, 'Unknown Publisher', '1994-01-01', 427, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9783737360883-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('d6d1bf24-3383-40d3-89a1-fc0430ab3bf7', '0d980841-1747-44eb-a28f-1d3dd598838c');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780062676443')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('453d55d3-2153-4d70-97dc-2a96c7eee1e3', '9780062676443', 'Imagine Me', 'imagine-me-453d55d3', 'Imagine Me by Tahereh Mafi', 2863.00, 'Unknown Publisher', '2020-01-01', 307, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780062676443-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('453d55d3-2153-4d70-97dc-2a96c7eee1e3', 'f63f3d40-f017-4b82-bf4d-b888492be787');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780606053099')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('d60408b4-7016-443f-a62c-7646b7d29c21', '9780606053099', 'George''s Marvelous Medicine', 'george-s-marvelous-medicine-d60408b4', 'George''s Marvelous Medicine by Roald Dahl', 3951.00, 'Unknown Publisher', '1981-01-01', 310, '30000000-0000-0000-0000-000000000007', 'https://covers.openlibrary.org/b/isbn/9780606053099-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('d60408b4-7016-443f-a62c-7646b7d29c21', '093dd944-cc75-4cc1-8115-de1d488cce59');
END

-- Seed 15 books for Category: Academic
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT '76f32a7c-1dcc-4f14-89ee-e23632b7f3c1' as id, 'Sönke Ahrens' as name, 's-nke-ahrens-76f32a7c' as slug, 'Biography for Sönke Ahrens' as biography UNION ALL
  SELECT '30af46fb-3718-443e-94e2-4255b7e6d76e' as id, 'Stuart Greene' as name, 'stuart-greene-30af46fb' as slug, 'Biography for Stuart Greene' as biography UNION ALL
  SELECT 'b582f3e5-4f01-414e-a370-0f564cae3fc9' as id, 'S. G. Naoum' as name, 's-g-naoum-b582f3e5' as slug, 'Biography for S. G. Naoum' as biography UNION ALL
  SELECT '8ef2e152-df7e-498a-9823-a02804b97e84' as id, 'James D. Lester, Sr.' as name, 'james-d-lester-sr-8ef2e152' as slug, 'Biography for James D. Lester, Sr.' as biography UNION ALL
  SELECT '18271043-ed2c-45bf-b614-08246e93e9c0' as id, 'Umberto Eco' as name, 'umberto-eco-18271043' as slug, 'Biography for Umberto Eco' as biography UNION ALL
  SELECT '3e46de5e-f76b-42d0-b1ea-a6c2fd85491a' as id, 'Armando Asti Vera' as name, 'armando-asti-vera-3e46de5e' as slug, 'Biography for Armando Asti Vera' as biography UNION ALL
  SELECT '9daef94e-b20a-4777-907f-8fb3630ea168' as id, 'Dale H. Schunk' as name, 'dale-h-schunk-9daef94e' as slug, 'Biography for Dale H. Schunk' as biography UNION ALL
  SELECT '956982da-4381-4c92-abb9-52d1afd66cf5' as id, 'Alan Meyers' as name, 'alan-meyers-956982da' as slug, 'Biography for Alan Meyers' as biography UNION ALL
  SELECT 'b0008199-fa27-482c-b4df-dbce71593c79' as id, 'John Williams' as name, 'john-williams-b0008199' as slug, 'Biography for John Williams' as biography UNION ALL
  SELECT '4749c6f3-0ee2-4175-8396-d51ea3c2a688' as id, 'Yvonne N. Bui' as name, 'yvonne-n-bui-4749c6f3' as slug, 'Biography for Yvonne N. Bui' as biography UNION ALL
  SELECT 'e4baa7e4-2cdc-4443-ab88-15433e8068f5' as id, 'Joan Bolker' as name, 'joan-bolker-e4baa7e4' as slug, 'Biography for Joan Bolker' as biography UNION ALL
  SELECT '82a2e3da-9ac0-48a3-a477-995e578d8065' as id, 'Ken Bain' as name, 'ken-bain-82a2e3da' as slug, 'Biography for Ken Bain' as biography UNION ALL
  SELECT '43d112c6-26d2-4c69-8b97-972848fe1c63' as id, 'Meredith D. Gall' as name, 'meredith-d-gall-43d112c6' as slug, 'Biography for Meredith D. Gall' as biography UNION ALL
  SELECT '77b92139-4da5-44e4-9286-c15fea9b0245' as id, 'David Starkey' as name, 'david-starkey-77b92139' as slug, 'Biography for David Starkey' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788197022272')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('675cb9bd-ed64-4b51-bb80-285dedf1bf97', '9788197022272', 'How to Take Smart Notes', 'how-to-take-smart-notes-675cb9bd', 'How to Take Smart Notes by Sönke Ahrens', 4545.00, 'Unknown Publisher', '2017-01-01', 581, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9788197022272-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('675cb9bd-ed64-4b51-bb80-285dedf1bf97', '76f32a7c-1dcc-4f14-89ee-e23632b7f3c1');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780312697846')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('6ce60fe1-5c37-41f2-994d-fd58e4bab280', '9780312697846', 'From inquiry to academic writing', 'from-inquiry-to-academic-writing-6ce60fe1', 'From inquiry to academic writing by Stuart Greene', 3538.00, 'Unknown Publisher', '2008-01-01', 456, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9780312697846-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('6ce60fe1-5c37-41f2-994d-fd58e4bab280', '30af46fb-3718-443e-94e2-4255b7e6d76e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781135872328')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('73dfd601-293d-469b-b396-477afeaa4086', '9781135872328', 'Dissertation research and writing for construction students', 'dissertation-research-and-writing-for-construction-students-73dfd601', 'Dissertation research and writing for construction students by S. G. Naoum', 2282.00, 'Unknown Publisher', '1998-01-01', 376, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9781135872328-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('73dfd601-293d-469b-b396-477afeaa4086', 'b582f3e5-4f01-414e-a370-0f564cae3fc9');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780321993212')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('7dd1c390-d34a-4ef5-acd5-81dc58c0ab24', '9780321993212', 'Writing research papers', 'writing-research-papers-7dd1c390', 'Writing research papers by James D. Lester, Sr.', 4479.00, 'Unknown Publisher', '1967-01-01', 340, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9780321993212-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('7dd1c390-d34a-4ef5-acd5-81dc58c0ab24', '8ef2e152-df7e-498a-9823-a02804b97e84');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780312692322')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('72d70d9e-3356-40b0-a099-130708247ac6', '9780312692322', 'From inquiry to academic writing', 'from-inquiry-to-academic-writing-72d70d9e', 'From inquiry to academic writing by Stuart Greene', 2494.00, 'Unknown Publisher', '2012-01-01', 312, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9780312692322-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('72d70d9e-3356-40b0-a099-130708247ac6', '30af46fb-3718-443e-94e2-4255b7e6d76e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788474328967')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('b5121062-2f52-4dc6-bcee-6fb0d02c6465', '9788474328967', 'Cómo se hace una tesis', 'c-mo-se-hace-una-tesis-b5121062', 'Cómo se hace una tesis by Umberto Eco', 3721.00, 'Unknown Publisher', '1977-01-01', 502, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9788474328967-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('b5121062-2f52-4dc6-bcee-6fb0d02c6465', '18271043-ed2c-45bf-b614-08246e93e9c0');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788416230792')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('be839bd9-b08f-4eee-b09e-5b78f07e5fef', '9788416230792', 'Metodología de la investigación', 'metodolog-a-de-la-investigaci-n-be839bd9', 'Metodología de la investigación by Armando Asti Vera', 2664.00, 'Unknown Publisher', '1968-01-01', 393, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9788416230792-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('be839bd9-b08f-4eee-b09e-5b78f07e5fef', '3e46de5e-f76b-42d0-b1ea-a6c2fd85491a');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781136826726')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('4442f26e-85c7-45c3-8500-7d228f29307c', '9781136826726', 'Motivation and self-regulated learning', 'motivation-and-self-regulated-learning-4442f26e', 'Motivation and self-regulated learning by Dale H. Schunk', 2147.00, 'Unknown Publisher', '2007-01-01', 287, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9781136826726-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('4442f26e-85c7-45c3-8500-7d228f29307c', '9daef94e-b20a-4777-907f-8fb3630ea168');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780131408883')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('43a9bcd2-b20a-424e-8399-0dac013ad92c', '9780131408883', 'Gateways to Academic Writing', 'gateways-to-academic-writing-43a9bcd2', 'Gateways to Academic Writing by Alan Meyers', 4654.00, 'Unknown Publisher', '2004-01-01', 241, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9780131408883-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('43a9bcd2-b20a-424e-8399-0dac013ad92c', '956982da-4381-4c92-abb9-52d1afd66cf5');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9783862312801')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('f7327141-b7ca-4444-b57f-5d7a348169d6', '9783862312801', 'Stoner', 'stoner-f7327141', 'Stoner by John Williams', 4438.00, 'Unknown Publisher', '1965-01-01', 533, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9783862312801-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('f7327141-b7ca-4444-b57f-5d7a348169d6', 'b0008199-fa27-482c-b4df-dbce71593c79');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781412957106')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('aa2f6c64-a58e-41e4-8e0c-bf021eabe0f0', '9781412957106', 'How to write a master''s thesis', 'how-to-write-a-master-s-thesis-aa2f6c64', 'How to write a master''s thesis by Yvonne N. Bui', 2589.00, 'Unknown Publisher', '2009-01-01', 344, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9781412957106-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('aa2f6c64-a58e-41e4-8e0c-bf021eabe0f0', '4749c6f3-0ee2-4175-8396-d51ea3c2a688');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780805048919')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9ae7f617-3bd3-48e6-89d7-c1421788bc2e', '9780805048919', 'Writing your dissertation in fifteen minutes a day', 'writing-your-dissertation-in-fifteen-minutes-a-day-9ae7f617', 'Writing your dissertation in fifteen minutes a day by Joan Bolker', 3738.00, 'Unknown Publisher', '1998-01-01', 257, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9780805048919-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9ae7f617-3bd3-48e6-89d7-c1421788bc2e', 'e4baa7e4-2cdc-4443-ab88-15433e8068f5');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780674067479')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('556373b0-514e-40e0-9296-e0db25974fd8', '9780674067479', 'What the best college students do', 'what-the-best-college-students-do-556373b0', 'What the best college students do by Ken Bain', 4137.00, 'Unknown Publisher', '2012-01-01', 390, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9780674067479-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('556373b0-514e-40e0-9296-e0db25974fd8', '82a2e3da-9ac0-48a3-a477-995e578d8065');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780801303852')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('61de1db2-80e4-4e92-9d6c-ff47fdba5bab', '9780801303852', 'Educational research', 'educational-research-61de1db2', 'Educational research by Meredith D. Gall', 4565.00, 'Unknown Publisher', '1963-01-01', 242, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9780801303852-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('61de1db2-80e4-4e92-9d6c-ff47fdba5bab', '43d112c6-26d2-4c69-8b97-972848fe1c63');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781554815098')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('4862c322-4172-4a71-add5-88f449fea3bf', '9781554815098', 'Academic Writing Now', 'academic-writing-now-4862c322', 'Academic Writing Now by David Starkey', 2521.00, 'Unknown Publisher', '2015-01-01', 232, '30000000-0000-0000-0000-000000000008', 'https://covers.openlibrary.org/b/isbn/9781554815098-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('4862c322-4172-4a71-add5-88f449fea3bf', '77b92139-4da5-44e4-9286-c15fea9b0245');
END

-- Seed 5 books for Category: Romance
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT '00f5f41e-3e4a-4ff9-a4a5-618cb97a61e3' as id, 'Rithvik Singh' as name, 'rithvik-singh-00f5f41e' as slug, 'Biography for Rithvik Singh' as biography UNION ALL
  SELECT '9b609ee1-eb8f-4b90-9b65-dbf2f94f69d2' as id, 'Tahereh Mafi' as name, 'tahereh-mafi-9b609ee1' as slug, 'Biography for Tahereh Mafi' as biography UNION ALL
  SELECT '7c0577c7-e94c-4c52-92a9-44ea6e47508e' as id, 'Laura Nowlin' as name, 'laura-nowlin-7c0577c7' as slug, 'Biography for Laura Nowlin' as biography UNION ALL
  SELECT '1fa61135-efce-4a99-9c63-b40f0aff4a5e' as id, 'Paulo Coelho' as name, 'paulo-coelho-1fa61135' as slug, 'Biography for Paulo Coelho' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780143469131')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('d4eb20e3-eca0-4b62-98df-b8c654e58390', '9780143469131', 'I Don''t Love You Anymore', 'i-don-t-love-you-anymore-d4eb20e3', 'I Don''t Love You Anymore by Rithvik Singh', 4002.00, 'Unknown Publisher', '2024-01-01', 456, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9780143469131-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('d4eb20e3-eca0-4b62-98df-b8c654e58390', '00f5f41e-3e4a-4ff9-a4a5-618cb97a61e3');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781780318578')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('d7548bfc-609e-47a1-8bbc-0b93f7d91097', '9781780318578', 'Unravel me', 'unravel-me-d7548bfc', 'Unravel me by Tahereh Mafi', 3772.00, 'Unknown Publisher', '2013-01-01', 423, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9781780318578-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('d7548bfc-609e-47a1-8bbc-0b93f7d91097', '9b609ee1-eb8f-4b90-9b65-dbf2f94f69d2');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781402277849')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('401d138c-a59d-4f0c-9f11-cbe630385770', '9781402277849', 'If He Had Been With Me', 'if-he-had-been-with-me-401d138c', 'If He Had Been With Me by Laura Nowlin', 2885.00, 'Unknown Publisher', '2013-01-01', 431, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9781402277849-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('401d138c-a59d-4f0c-9f11-cbe630385770', '7c0577c7-e94c-4c52-92a9-44ea6e47508e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780062111234')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('b2f5d2a0-1ded-4a41-8671-a8c5b1edbded', '9780062111234', 'Shatter Me', 'shatter-me-b2f5d2a0', 'Shatter Me by Tahereh Mafi', 2634.00, 'Unknown Publisher', '2011-01-01', 498, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9780062111234-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('b2f5d2a0-1ded-4a41-8671-a8c5b1edbded', '9b609ee1-eb8f-4b90-9b65-dbf2f94f69d2');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780007712984')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('a35ca473-e131-4f80-88ea-3026290ac2ea', '9780007712984', 'Eleven Minutes', 'eleven-minutes-a35ca473', 'Eleven Minutes by Paulo Coelho', 4724.00, 'Unknown Publisher', '2003-01-01', 319, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9780007712984-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('a35ca473-e131-4f80-88ea-3026290ac2ea', '1fa61135-efce-4a99-9c63-b40f0aff4a5e');
END

-- Seed 5 books for Category: History
INSERT INTO authors (id, name, slug, biography)
SELECT a.id, a.name, a.slug, a.biography FROM (
  SELECT '2e0cdbe9-b5e3-4298-bffb-b28ef3725479' as id, 'Will Durant' as name, 'will-durant-2e0cdbe9' as slug, 'Biography for Will Durant' as biography UNION ALL
  SELECT 'a9d972b1-c059-4763-b124-795f6a48be9e' as id, 'Winston S. Churchill' as name, 'winston-s-churchill-a9d972b1' as slug, 'Biography for Winston S. Churchill' as biography UNION ALL
  SELECT '8392a368-4cc9-476e-b133-7a8510454916' as id, 'Jerry H. Bentley' as name, 'jerry-h-bentley-8392a368' as slug, 'Biography for Jerry H. Bentley' as biography UNION ALL
  SELECT 'f7a2db48-0d11-4399-bf9a-3e4b176d8693' as id, 'R. R. Palmer' as name, 'r-r-palmer-f7a2db48' as slug, 'Biography for R. R. Palmer' as biography UNION ALL
  SELECT '1e77d80f-1bb7-406c-8d6f-f6efff2ef3a8' as id, 'Peter Frankopan' as name, 'peter-frankopan-1e77d80f' as slug, 'Biography for Peter Frankopan' as biography
) a
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9788418741524')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('b1383a87-d06a-46a2-98e3-9453ac169f9f', '9788418741524', 'The Lessons of History', 'the-lessons-of-history-b1383a87', 'The Lessons of History by Will Durant', 3753.00, 'Unknown Publisher', '1968-01-01', 207, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9788418741524-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('b1383a87-d06a-46a2-98e3-9453ac169f9f', '2e0cdbe9-b5e3-4298-bffb-b28ef3725479');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781472520890')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('4b226eeb-3563-45a3-9851-b8c68d5649e5', '9781472520890', 'The Second World War', 'the-second-world-war-4b226eeb', 'The Second World War by Winston S. Churchill', 4882.00, 'Unknown Publisher', '1948-01-01', 371, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9781472520890-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('4b226eeb-3563-45a3-9851-b8c68d5649e5', 'a9d972b1-c059-4763-b124-795f6a48be9e');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780072957549')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('76af9252-21c2-4e4d-9737-13097924259c', '9780072957549', 'Traditions & encounters', 'traditions-encounters-76af9252', 'Traditions & encounters by Jerry H. Bentley', 4792.00, 'Unknown Publisher', '1999-01-01', 449, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9780072957549-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('76af9252-21c2-4e4d-9737-13097924259c', '8392a368-4cc9-476e-b133-7a8510454916');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780394335964')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('e1530bad-bd0f-4bfd-a8d7-341a50c84f2d', '9780394335964', 'A history of the modern world', 'a-history-of-the-modern-world-e1530bad', 'A history of the modern world by R. R. Palmer', 4506.00, 'Unknown Publisher', '1950-01-01', 544, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9780394335964-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('e1530bad-bd0f-4bfd-a8d7-341a50c84f2d', 'f7a2db48-0d11-4399-bf9a-3e4b176d8693');
END

IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9781408839966')
BEGIN
  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
  ('9e92fcb0-83f4-44bb-bc52-3e83b9806c45', '9781408839966', 'The Silk Roads', 'the-silk-roads-9e92fcb0', 'The Silk Roads by Peter Frankopan', 4888.00, 'Unknown Publisher', '2015-01-01', 529, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9781408839966-L.jpg');
  INSERT INTO book_authors (book_id, author_id) VALUES
  ('9e92fcb0-83f4-44bb-bc52-3e83b9806c45', '1e77d80f-1bb7-406c-8d6f-f6efff2ef3a8');
END

