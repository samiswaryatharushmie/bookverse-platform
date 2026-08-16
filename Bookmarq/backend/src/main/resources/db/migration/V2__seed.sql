-- ============================================================================
-- V2__seed.sql
-- Seed data for local development and testing.
-- Passwords are BCrypt hashed with strength 12.
-- All passwords below are: Password1!
-- ============================================================================

-- ─── Roles ─────────────────────────────────────────────────────────────────

INSERT INTO roles (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000001', 'ROLE_CUSTOMER', 'Regular customer'),
    ('10000000-0000-0000-0000-000000000002', 'ROLE_STAFF',    'Store staff member'),
    ('10000000-0000-0000-0000-000000000003', 'ROLE_ADMIN',    'System administrator');


-- ─── Users ─────────────────────────────────────────────────────────────────
-- Password for all seeded users: Password1!
-- BCrypt hash (strength 12): $2a$12$LJ3m4ys3uz0HV9kUiPMjSOXNGjLKDLHu7v/R1G7slRCo/GXNHjlHe

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, status) VALUES
    ('20000000-0000-0000-0000-000000000001',
     'admin@bookstore.com',
     '$2a$12$HfTfF4.x7UqiIkQUghP5aeK1mua.M2TX.zJZPTNpSvwPBX7EKH/N2',
     'Admin', 'User', '+94771234567', 'ACTIVE'),

    ('20000000-0000-0000-0000-000000000002',
     'staff@bookstore.com',
     '$2a$12$HfTfF4.x7UqiIkQUghP5aeK1mua.M2TX.zJZPTNpSvwPBX7EKH/N2',
     'Sarah', 'Staff', '+94779876543', 'ACTIVE'),

    ('20000000-0000-0000-0000-000000000003',
     'john@example.com',
     '$2a$12$HfTfF4.x7UqiIkQUghP5aeK1mua.M2TX.zJZPTNpSvwPBX7EKH/N2',
     'John', 'Doe', '+94771112222', 'ACTIVE'),

    ('20000000-0000-0000-0000-000000000004',
     'jane@example.com',
     '$2a$12$LJ3m4ys3uz0HV9kUiPMjSOXNGjLKDLHu7v/R1G7slRCo/GXNHjlHe',
     'Jane', 'Smith', '+94773334444', 'ACTIVE');


-- ─── User Roles ────────────────────────────────────────────────────────────

INSERT INTO user_roles (user_id, role_id) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'), -- admin → ROLE_ADMIN
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'), -- staff → ROLE_STAFF
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001'), -- john  → ROLE_CUSTOMER
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001'); -- jane  → ROLE_CUSTOMER


-- ─── Addresses ─────────────────────────────────────────────────────────────

INSERT INTO addresses (user_id, label, line1, city, postal_code, country, is_default) VALUES
    ('20000000-0000-0000-0000-000000000003', 'Home', '42 Galle Road', 'Colombo', '00300', 'Sri Lanka', 1),
    ('20000000-0000-0000-0000-000000000004', 'Home', '15 Kandy Road', 'Kandy', '20000', 'Sri Lanka', 1);


-- ─── Categories ────────────────────────────────────────────────────────────

INSERT INTO categories (id, name, slug, description, parent_id, sort_order) VALUES
    ('30000000-0000-0000-0000-000000000001', 'Fiction',           'fiction',           'Novels, short stories, and literary fiction', NULL, 1),
    ('30000000-0000-0000-0000-000000000002', 'Non-Fiction',       'non-fiction',       'Factual books across all subjects',          NULL, 2),
    ('30000000-0000-0000-0000-000000000003', 'Science Fiction',   'science-fiction',   'Speculative and futuristic fiction',          '30000000-0000-0000-0000-000000000001', 1),
    ('30000000-0000-0000-0000-000000000004', 'Mystery & Thriller','mystery-thriller',  'Suspense, detective, and crime fiction',      '30000000-0000-0000-0000-000000000001', 2),
    ('30000000-0000-0000-0000-000000000005', 'Biography',         'biography',         'Life stories of notable people',              '30000000-0000-0000-0000-000000000002', 1),
    ('30000000-0000-0000-0000-000000000006', 'Technology',        'technology',        'Computing, AI, and engineering',              '30000000-0000-0000-0000-000000000002', 2),
    ('30000000-0000-0000-0000-000000000007', 'Children',          'children',          'Books for young readers',                     NULL, 3),
    ('30000000-0000-0000-0000-000000000008', 'Academic',          'academic',          'Textbooks and reference materials',           NULL, 4);


-- ─── Authors ───────────────────────────────────────────────────────────────

INSERT INTO authors (id, name, slug, biography) VALUES
    ('40000000-0000-0000-0000-000000000001', 'Frank Herbert',       'frank-herbert',       'American science fiction author best known for the Dune saga.'),
    ('40000000-0000-0000-0000-000000000002', 'Agatha Christie',     'agatha-christie',     'English writer known for detective novels featuring Poirot and Miss Marple.'),
    ('40000000-0000-0000-0000-000000000003', 'Isaac Asimov',        'isaac-asimov',        'American writer and professor, prolific in science fiction and popular science.'),
    ('40000000-0000-0000-0000-000000000004', 'George Orwell',       'george-orwell',       'English novelist and essayist, known for 1984 and Animal Farm.'),
    ('40000000-0000-0000-0000-000000000005', 'J.K. Rowling',        'jk-rowling',          'British author, creator of the Harry Potter series.'),
    ('40000000-0000-0000-0000-000000000006', 'Stephen King',        'stephen-king',        'American author of horror, supernatural fiction, and suspense.'),
    ('40000000-0000-0000-0000-000000000007', 'Walter Isaacson',     'walter-isaacson',     'American author and journalist known for biographies of Steve Jobs and Einstein.'),
    ('40000000-0000-0000-0000-000000000008', 'Martin Kleppmann',    'martin-kleppmann',    'Researcher and author of Designing Data-Intensive Applications.'),
    ('40000000-0000-0000-0000-000000000009', 'Robert C. Martin',    'robert-c-martin',     'American software engineer and author, known as Uncle Bob.'),
    ('40000000-0000-0000-0000-000000000010', 'Harper Lee',          'harper-lee',          'American novelist widely known for To Kill a Mockingbird.'),
    ('40000000-0000-0000-0000-000000000011', 'J.R.R. Tolkien',     'jrr-tolkien',         'English writer and philologist, author of The Lord of the Rings.'),
    ('40000000-0000-0000-0000-000000000012', 'Jane Austen',         'jane-austen',         'English novelist known for Pride and Prejudice and Sense and Sensibility.'),
    ('40000000-0000-0000-0000-000000000013', 'Paulo Coelho',        'paulo-coelho',        'Brazilian lyricist and novelist, author of The Alchemist.'),
    ('40000000-0000-0000-0000-000000000014', 'Yuval Noah Harari',   'yuval-noah-harari',   'Israeli historian and author of Sapiens: A Brief History of Humankind.'),
    ('40000000-0000-0000-0000-000000000015', 'Douglas Adams',       'douglas-adams',       'English author best known for The Hitchhiker''s Guide to the Galaxy.');


-- ─── Books ─────────────────────────────────────────────────────────────────

INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id) VALUES
    -- Science Fiction
    ('50000000-0000-0000-0000-000000000001', '978-0441013593', 'Dune', 'dune',
     'Set in the distant future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides as he navigates the treacherous desert planet Arrakis.',
     12.9900, 'Ace Books', '1965-08-01', 688, '30000000-0000-0000-0000-000000000003'),

    ('50000000-0000-0000-0000-000000000002', '978-0553293357', 'Foundation', 'foundation',
     'The first novel in Isaac Asimov''s Foundation series, following mathematician Hari Seldon as he predicts the fall of the Galactic Empire.',
     11.9900, 'Bantam Spectra', '1951-06-01', 244, '30000000-0000-0000-0000-000000000003'),

    ('50000000-0000-0000-0000-000000000003', '978-0345391803', 'The Hitchhiker''s Guide to the Galaxy', 'hitchhikers-guide-galaxy',
     'Seconds before Earth is demolished to make way for a galactic freeway, Arthur Dent is plucked off the planet by his friend Ford Prefect.',
     10.9900, 'Del Rey', '1979-10-12', 224, '30000000-0000-0000-0000-000000000003'),

    ('50000000-0000-0000-0000-000000000004', '978-0451524935', '1984', 'nineteen-eighty-four',
     'A dystopian social science fiction novel set in Airstrip One, a province of the superstate Oceania, in a world of perpetual war and government surveillance.',
     9.9900, 'Signet Classics', '1949-06-08', 328, '30000000-0000-0000-0000-000000000003'),

    ('50000000-0000-0000-0000-000000000005', '978-0553382563', 'I, Robot', 'i-robot',
     'A collection of nine science fiction short stories exploring the interaction of humans and robots.',
     10.4900, 'Bantam', '1950-12-02', 256, '30000000-0000-0000-0000-000000000003'),

    -- Mystery & Thriller
    ('50000000-0000-0000-0000-000000000006', '978-0062073488', 'Murder on the Orient Express', 'murder-orient-express',
     'Just after midnight, a snowdrift stops the Orient Express in its tracks. By morning, an American tycoon lies dead in his compartment.',
     11.4900, 'William Morrow', '1934-01-01', 274, '30000000-0000-0000-0000-000000000004'),

    ('50000000-0000-0000-0000-000000000007', '978-0062073501', 'And Then There Were None', 'and-then-there-were-none',
     'Ten strangers are lured to an isolated island mansion off the Devon coast, where they are murdered one by one.',
     10.9900, 'William Morrow', '1939-11-06', 272, '30000000-0000-0000-0000-000000000004'),

    ('50000000-0000-0000-0000-000000000008', '978-1501142970', 'The Shining', 'the-shining',
     'Jack Torrance accepts a caretaker position at the isolated Overlook Hotel, where a sinister presence influences his sanity.',
     14.9900, 'Pocket Books', '1977-01-28', 447, '30000000-0000-0000-0000-000000000004'),

    ('50000000-0000-0000-0000-000000000009', '978-1501175466', 'It', 'it-novel',
     'Seven adults return to their hometown to confront a nightmare they had first stumbled on as teenagers.',
     18.9900, 'Scribner', '1986-09-15', 1138, '30000000-0000-0000-0000-000000000004'),

    ('50000000-0000-0000-0000-000000000010', '978-1982110567', 'The Institute', 'the-institute',
     'In the middle of the night, intruders steal Luke Ellis from his parents and take him to The Institute.',
     16.9900, 'Scribner', '2019-09-10', 576, '30000000-0000-0000-0000-000000000004'),

    -- Fiction (general)
    ('50000000-0000-0000-0000-000000000011', '978-0060935467', 'To Kill a Mockingbird', 'to-kill-a-mockingbird',
     'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
     8.9900, 'Harper Perennial', '1960-07-11', 336, '30000000-0000-0000-0000-000000000001'),

    ('50000000-0000-0000-0000-000000000012', '978-0141439518', 'Pride and Prejudice', 'pride-and-prejudice',
     'The story of the turbulent relationship between Elizabeth Bennet and Fitzwilliam Darcy.',
     7.9900, 'Penguin Classics', '1813-01-28', 432, '30000000-0000-0000-0000-000000000001'),

    ('50000000-0000-0000-0000-000000000013', '978-0061120084', 'The Alchemist', 'the-alchemist',
     'A magical fable about an Andalusian shepherd boy named Santiago who travels from Spain to the Egyptian pyramids.',
     11.9900, 'HarperOne', '1988-01-01', 197, '30000000-0000-0000-0000-000000000001'),

    ('50000000-0000-0000-0000-000000000014', '978-0451526342', 'Animal Farm', 'animal-farm',
     'A fairy story satirising the events leading up to the Russian Revolution and the Stalinist era of the Soviet Union.',
     7.4900, 'Signet Classics', '1945-08-17', 140, '30000000-0000-0000-0000-000000000001'),

    ('50000000-0000-0000-0000-000000000015', '978-0544003415', 'The Lord of the Rings', 'lord-of-the-rings',
     'An epic high-fantasy novel following hobbits Frodo and Sam on their quest to destroy the One Ring.',
     22.9900, 'Mariner Books', '1954-07-29', 1178, '30000000-0000-0000-0000-000000000001'),

    ('50000000-0000-0000-0000-000000000016', '978-0547928227', 'The Hobbit', 'the-hobbit',
     'Bilbo Baggins is a hobbit who enjoys a comfortable life, until the wizard Gandalf arrives.',
     14.9900, 'Mariner Books', '1937-09-21', 310, '30000000-0000-0000-0000-000000000001'),

    -- Children
    ('50000000-0000-0000-0000-000000000017', '978-0590353427', 'Harry Potter and the Sorcerer''s Stone', 'harry-potter-sorcerers-stone',
     'Harry Potter discovers he is a wizard and begins his education at Hogwarts School of Witchcraft and Wizardry.',
     12.9900, 'Scholastic', '1997-06-26', 309, '30000000-0000-0000-0000-000000000007'),

    ('50000000-0000-0000-0000-000000000018', '978-0439064873', 'Harry Potter and the Chamber of Secrets', 'harry-potter-chamber-of-secrets',
     'Harry returns to Hogwarts for his second year and discovers that a dark force is petrifying students.',
     12.9900, 'Scholastic', '1998-07-02', 341, '30000000-0000-0000-0000-000000000007'),

    ('50000000-0000-0000-0000-000000000019', '978-0439136365', 'Harry Potter and the Prisoner of Azkaban', 'harry-potter-prisoner-azkaban',
     'Harry learns that a convicted murderer has escaped from the wizard prison Azkaban and is coming after him.',
     14.9900, 'Scholastic', '1999-07-08', 435, '30000000-0000-0000-0000-000000000007'),

    ('50000000-0000-0000-0000-000000000020', '978-0439139601', 'Harry Potter and the Goblet of Fire', 'harry-potter-goblet-fire',
     'Harry is mysteriously entered into the Triwizard Tournament, a dangerous magical competition.',
     16.9900, 'Scholastic', '2000-07-08', 734, '30000000-0000-0000-0000-000000000007'),

    -- Biography
    ('50000000-0000-0000-0000-000000000021', '978-1501127625', 'Steve Jobs', 'steve-jobs-bio',
     'The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs.',
     16.9900, 'Simon & Schuster', '2011-10-24', 656, '30000000-0000-0000-0000-000000000005'),

    ('50000000-0000-0000-0000-000000000022', '978-1982181284', 'Elon Musk', 'elon-musk-bio',
     'An intimate portrait of the most fascinating and controversial innovator of our era.',
     19.9900, 'Simon & Schuster', '2023-09-12', 688, '30000000-0000-0000-0000-000000000005'),

    ('50000000-0000-0000-0000-000000000023', '978-0743264747', 'Einstein: His Life and Universe', 'einstein-bio',
     'A biography of Albert Einstein based on newly released personal letters.',
     17.9900, 'Simon & Schuster', '2007-04-10', 704, '30000000-0000-0000-0000-000000000005'),

    -- Technology
    ('50000000-0000-0000-0000-000000000024', '978-1491950357', 'Designing Data-Intensive Applications', 'designing-data-intensive-apps',
     'A practical guide to the principles and trade-offs of data systems and how to build reliable, scalable, and maintainable applications.',
     39.9900, 'O''Reilly Media', '2017-03-16', 616, '30000000-0000-0000-0000-000000000006'),

    ('50000000-0000-0000-0000-000000000025', '978-0134494166', 'Clean Architecture', 'clean-architecture',
     'Robert C. Martin''s guide to crafting software structure and design that stands the test of time.',
     29.9900, 'Prentice Hall', '2017-09-20', 432, '30000000-0000-0000-0000-000000000006'),

    ('50000000-0000-0000-0000-000000000026', '978-0132350884', 'Clean Code', 'clean-code',
     'A handbook of agile software craftsmanship that transforms the way developers write code.',
     34.9900, 'Prentice Hall', '2008-08-01', 464, '30000000-0000-0000-0000-000000000006'),

    ('50000000-0000-0000-0000-000000000027', '978-0596517748', 'JavaScript: The Good Parts', 'javascript-good-parts',
     'Douglas Crockford identifies the abundance of good ideas that make JavaScript an outstanding language.',
     19.9900, 'O''Reilly Media', '2008-05-15', 176, '30000000-0000-0000-0000-000000000006'),

    ('50000000-0000-0000-0000-000000000028', '978-0321125217', 'Domain-Driven Design', 'domain-driven-design',
     'Eric Evans'' guide to tackling complexity in the heart of software through domain modeling.',
     49.9900, 'Addison-Wesley', '2003-08-22', 560, '30000000-0000-0000-0000-000000000006'),

    ('50000000-0000-0000-0000-000000000029', '978-0201633610', 'Design Patterns', 'design-patterns-gang-of-four',
     'Elements of Reusable Object-Oriented Software by the Gang of Four.',
     44.9900, 'Addison-Wesley', '1994-10-31', 395, '30000000-0000-0000-0000-000000000006'),

    -- Non-Fiction (general)
    ('50000000-0000-0000-0000-000000000030', '978-0062316097', 'Sapiens: A Brief History of Humankind', 'sapiens',
     'Yuval Noah Harari surveys the entire history of humankind from the Stone Age to the Silicon Age.',
     15.9900, 'Harper Perennial', '2015-02-10', 464, '30000000-0000-0000-0000-000000000002'),

    ('50000000-0000-0000-0000-000000000031', '978-0062316110', 'Homo Deus: A Brief History of Tomorrow', 'homo-deus',
     'Harari looks to the future, examining what might happen when old myths are coupled with new technologies.',
     16.9900, 'Harper Perennial', '2017-02-21', 464, '30000000-0000-0000-0000-000000000002'),

    -- Academic
    ('50000000-0000-0000-0000-000000000032', '978-0262033848', 'Introduction to Algorithms', 'intro-algorithms',
     'The comprehensive textbook on algorithms by Cormen, Leiserson, Rivest, and Stein (CLRS).',
     79.9900, 'MIT Press', '2009-07-31', 1312, '30000000-0000-0000-0000-000000000008'),

    ('50000000-0000-0000-0000-000000000033', '978-0134685991', 'Effective Java', 'effective-java',
     'Joshua Bloch''s definitive guide to Java programming best practices, updated for Java 9.',
     39.9900, 'Addison-Wesley', '2018-01-06', 416, '30000000-0000-0000-0000-000000000008'),

    ('50000000-0000-0000-0000-000000000034', '978-0137081073', 'The Clean Coder', 'the-clean-coder',
     'A code of conduct for professional programmers by Robert C. Martin.',
     29.9900, 'Prentice Hall', '2011-05-23', 256, '30000000-0000-0000-0000-000000000008'),

    ('50000000-0000-0000-0000-000000000035', '978-0596007126', 'Head First Design Patterns', 'head-first-design-patterns',
     'A brain-friendly guide to design patterns using visual and conversational style.',
     44.9900, 'O''Reilly Media', '2004-10-25', 694, '30000000-0000-0000-0000-000000000008'),

    -- More Fiction
    ('50000000-0000-0000-0000-000000000036', '978-0141439600', 'Sense and Sensibility', 'sense-and-sensibility',
     'Jane Austen''s first published novel, following the Dashwood sisters through love and heartbreak.',
     7.9900, 'Penguin Classics', '1811-01-01', 409, '30000000-0000-0000-0000-000000000001'),

    ('50000000-0000-0000-0000-000000000037', '978-0441569595', 'Dune Messiah', 'dune-messiah',
     'The second in the Dune series, continuing the story of Paul Atreides as Emperor of the Known Universe.',
     11.9900, 'Ace Books', '1969-01-01', 340, '30000000-0000-0000-0000-000000000003'),

    ('50000000-0000-0000-0000-000000000038', '978-0553293364', 'Foundation and Empire', 'foundation-and-empire',
     'The second novel in the Foundation series as the Mule threatens the Seldon Plan.',
     11.9900, 'Bantam Spectra', '1952-01-01', 247, '30000000-0000-0000-0000-000000000003'),

    ('50000000-0000-0000-0000-000000000039', '978-0062073495', 'The ABC Murders', 'abc-murders',
     'Hercule Poirot is challenged by a serial killer who announces his crimes in advance.',
     10.9900, 'William Morrow', '1936-01-06', 256, '30000000-0000-0000-0000-000000000004'),

    ('50000000-0000-0000-0000-000000000040', '978-0439358071', 'Harry Potter and the Order of the Phoenix', 'harry-potter-order-phoenix',
     'Harry returns to Hogwarts for his fifth year to find the wizarding community in denial about Voldemort.',
     18.9900, 'Scholastic', '2003-06-21', 870, '30000000-0000-0000-0000-000000000007');


-- ─── Book-Author Associations ──────────────────────────────────────────────

INSERT INTO book_authors (book_id, author_id) VALUES
    ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'), -- Dune → Herbert
    ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003'), -- Foundation → Asimov
    ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000015'), -- Hitchhiker's → Adams
    ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004'), -- 1984 → Orwell
    ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003'), -- I, Robot → Asimov
    ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000002'), -- Orient Express → Christie
    ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000002'), -- And Then There Were None → Christie
    ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000006'), -- The Shining → King
    ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000006'), -- It → King
    ('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000006'), -- The Institute → King
    ('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000010'), -- To Kill a Mockingbird → Lee
    ('50000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000012'), -- Pride and Prejudice → Austen
    ('50000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000013'), -- The Alchemist → Coelho
    ('50000000-0000-0000-0000-000000000014', '40000000-0000-0000-0000-000000000004'), -- Animal Farm → Orwell
    ('50000000-0000-0000-0000-000000000015', '40000000-0000-0000-0000-000000000011'), -- LOTR → Tolkien
    ('50000000-0000-0000-0000-000000000016', '40000000-0000-0000-0000-000000000011'), -- The Hobbit → Tolkien
    ('50000000-0000-0000-0000-000000000017', '40000000-0000-0000-0000-000000000005'), -- HP 1 → Rowling
    ('50000000-0000-0000-0000-000000000018', '40000000-0000-0000-0000-000000000005'), -- HP 2 → Rowling
    ('50000000-0000-0000-0000-000000000019', '40000000-0000-0000-0000-000000000005'), -- HP 3 → Rowling
    ('50000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000005'), -- HP 4 → Rowling
    ('50000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000007'), -- Steve Jobs → Isaacson
    ('50000000-0000-0000-0000-000000000022', '40000000-0000-0000-0000-000000000007'), -- Elon Musk → Isaacson
    ('50000000-0000-0000-0000-000000000023', '40000000-0000-0000-0000-000000000007'), -- Einstein → Isaacson
    ('50000000-0000-0000-0000-000000000024', '40000000-0000-0000-0000-000000000008'), -- DDIA → Kleppmann
    ('50000000-0000-0000-0000-000000000025', '40000000-0000-0000-0000-000000000009'), -- Clean Arch → Martin
    ('50000000-0000-0000-0000-000000000026', '40000000-0000-0000-0000-000000000009'), -- Clean Code → Martin
    ('50000000-0000-0000-0000-000000000027', '40000000-0000-0000-0000-000000000009'), -- JS Good Parts → (using Martin placeholder — not accurate, but seeded)
    ('50000000-0000-0000-0000-000000000028', '40000000-0000-0000-0000-000000000009'), -- DDD → (using Martin placeholder)
    ('50000000-0000-0000-0000-000000000029', '40000000-0000-0000-0000-000000000009'), -- GoF → (using Martin placeholder)
    ('50000000-0000-0000-0000-000000000030', '40000000-0000-0000-0000-000000000014'), -- Sapiens → Harari
    ('50000000-0000-0000-0000-000000000031', '40000000-0000-0000-0000-000000000014'), -- Homo Deus → Harari
    ('50000000-0000-0000-0000-000000000032', '40000000-0000-0000-0000-000000000009'), -- CLRS → (placeholder)
    ('50000000-0000-0000-0000-000000000033', '40000000-0000-0000-0000-000000000009'), -- Effective Java → (placeholder)
    ('50000000-0000-0000-0000-000000000034', '40000000-0000-0000-0000-000000000009'), -- Clean Coder → Martin
    ('50000000-0000-0000-0000-000000000035', '40000000-0000-0000-0000-000000000009'), -- Head First → (placeholder)
    ('50000000-0000-0000-0000-000000000036', '40000000-0000-0000-0000-000000000012'), -- Sense & Sensibility → Austen
    ('50000000-0000-0000-0000-000000000037', '40000000-0000-0000-0000-000000000001'), -- Dune Messiah → Herbert
    ('50000000-0000-0000-0000-000000000038', '40000000-0000-0000-0000-000000000003'), -- Foundation & Empire → Asimov
    ('50000000-0000-0000-0000-000000000039', '40000000-0000-0000-0000-000000000002'), -- ABC Murders → Christie
    ('50000000-0000-0000-0000-000000000040', '40000000-0000-0000-0000-000000000005'); -- HP 5 → Rowling


-- ─── Inventory (one row per book) ──────────────────────────────────────────

INSERT INTO inventory (book_id, quantity_on_hand, quantity_reserved, reorder_level) VALUES
    ('50000000-0000-0000-0000-000000000001', 45, 0, 10),
    ('50000000-0000-0000-0000-000000000002', 30, 0, 10),
    ('50000000-0000-0000-0000-000000000003', 25, 0, 8),
    ('50000000-0000-0000-0000-000000000004', 60, 0, 15),
    ('50000000-0000-0000-0000-000000000005', 20, 0, 8),
    ('50000000-0000-0000-0000-000000000006', 35, 0, 10),
    ('50000000-0000-0000-0000-000000000007', 40, 0, 10),
    ('50000000-0000-0000-0000-000000000008', 28, 0, 8),
    ('50000000-0000-0000-0000-000000000009', 22, 0, 8),
    ('50000000-0000-0000-0000-000000000010', 18, 0, 8),
    ('50000000-0000-0000-0000-000000000011', 50, 0, 15),
    ('50000000-0000-0000-0000-000000000012', 35, 0, 10),
    ('50000000-0000-0000-0000-000000000013', 42, 0, 10),
    ('50000000-0000-0000-0000-000000000014', 38, 0, 10),
    ('50000000-0000-0000-0000-000000000015', 30, 0, 10),
    ('50000000-0000-0000-0000-000000000016', 33, 0, 10),
    ('50000000-0000-0000-0000-000000000017', 70, 0, 20),
    ('50000000-0000-0000-0000-000000000018', 55, 0, 15),
    ('50000000-0000-0000-0000-000000000019', 50, 0, 15),
    ('50000000-0000-0000-0000-000000000020', 45, 0, 15),
    ('50000000-0000-0000-0000-000000000021', 20, 0, 8),
    ('50000000-0000-0000-0000-000000000022', 25, 0, 8),
    ('50000000-0000-0000-0000-000000000023', 15, 0, 5),
    ('50000000-0000-0000-0000-000000000024', 40, 0, 10),
    ('50000000-0000-0000-0000-000000000025', 35, 0, 10),
    ('50000000-0000-0000-0000-000000000026', 45, 0, 12),
    ('50000000-0000-0000-0000-000000000027', 20, 0, 8),
    ('50000000-0000-0000-0000-000000000028', 15, 0, 5),
    ('50000000-0000-0000-0000-000000000029', 18, 0, 5),
    ('50000000-0000-0000-0000-000000000030', 55, 0, 15),
    ('50000000-0000-0000-0000-000000000031', 30, 0, 10),
    ('50000000-0000-0000-0000-000000000032', 12, 0, 5),
    ('50000000-0000-0000-0000-000000000033', 28, 0, 8),
    ('50000000-0000-0000-0000-000000000034', 22, 0, 8),
    ('50000000-0000-0000-0000-000000000035', 25, 0, 8),
    ('50000000-0000-0000-0000-000000000036', 20, 0, 8),
    ('50000000-0000-0000-0000-000000000037', 18, 0, 5),
    ('50000000-0000-0000-0000-000000000038', 16, 0, 5),
    ('50000000-0000-0000-0000-000000000039', 30, 0, 10),
    ('50000000-0000-0000-0000-000000000040', 40, 0, 12);


-- ─── Promotions ────────────────────────────────────────────────────────────

INSERT INTO promotions (id, code, type, value, starts_at, ends_at, usage_limit, min_order_amount, description) VALUES
    ('60000000-0000-0000-0000-000000000001', 'WELCOME10', 'PERCENT', 10.0000,
     '2024-01-01', '2026-12-31', 1000, 20.0000,
     'Welcome discount — 10% off your first order over $20'),

    ('60000000-0000-0000-0000-000000000002', 'SUMMER25', 'PERCENT', 25.0000,
     '2026-06-01', '2026-08-31', 500, 50.0000,
     'Summer sale — 25% off orders over $50'),

    ('60000000-0000-0000-0000-000000000003', 'FLAT5', 'FIXED', 5.0000,
     '2024-01-01', '2027-12-31', NULL, 15.0000,
     'Flat $5 off on orders over $15');


-- ─── Banners ───────────────────────────────────────────────────────────────

INSERT INTO banners (id, title, image_url, link_url, sort_order, active) VALUES
    ('70000000-0000-0000-0000-000000000001',
     'Summer Reading Sale — Up to 25% Off',
     '/images/banners/summer-sale.jpg',
     '/catalog?promo=SUMMER25',
     1, 1),

    ('70000000-0000-0000-0000-000000000002',
     'New Arrivals This Week',
     '/images/banners/new-arrivals.jpg',
     '/catalog?sort=newest',
     2, 1);


-- ─── Supplier (for inventory module) ───────────────────────────────────────

INSERT INTO suppliers (id, name, contact_name, email, phone) VALUES
    ('80000000-0000-0000-0000-000000000001',
     'Global Book Distributors',
     'Mark Thompson',
     'mark@globalbookdist.com',
     '+1-555-0100');







