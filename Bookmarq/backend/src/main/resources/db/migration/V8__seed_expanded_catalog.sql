-- V8__seed_expanded_catalog.sql

-- Category: Romance
INSERT INTO categories (id, name, slug, description, parent_id) VALUES ('61a69a83-63f2-4635-9359-8163d9c163d7', 'Romance', 'romance-61a69a83', 'Romance books', NULL);

INSERT INTO authors (id, name, slug, biography) VALUES
('9433b54e-c5de-4ace-89fc-58a1a81d03b1', 'Ana Huang', 'ana-huang-9433b54e', 'Biography for Ana Huang'),
('ff732e1c-84e4-411d-9593-174dcccec4f3', 'Penelope Douglas', 'penelope-douglas-ff732e1c', 'Biography for Penelope Douglas'),
('8f610224-5617-4d44-b522-56393b1b7dab', 'Colleen Hoover', 'colleen-hoover-8f610224', 'Biography for Colleen Hoover'),
('4602f9be-a347-4838-abb6-1113f3e28f7a', 'Danielle Lori', 'danielle-lori-4602f9be', 'Biography for Danielle Lori'),
('1b221de1-64d6-4891-9250-6f65d2219300', 'Rachel Reid', 'rachel-reid-1b221de1', 'Biography for Rachel Reid'),
('f5677e75-bb63-4a58-b995-54b4befa7d93', 'Emma Darcy', 'emma-darcy-f5677e75', 'Biography for Emma Darcy'),
('c95456a2-24b1-48c3-a370-0673e7c437be', 'Sara Craven', 'sara-craven-c95456a2', 'Biography for Sara Craven');

INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
('2e38cb56-9289-45c1-8ffb-8f24afbb55da', '9780349448398', 'Twisted Games', 'twisted-games-2e38cb56', 'Twisted Games by Ana Huang', 2144.00, 'Unknown Publisher', '2021-01-01', 201, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9780349448398-L.jpg'),
('9b5ed48a-9d3e-499f-8914-13098d3bd251', '9786070793677', 'Twisted Love', 'twisted-love-9b5ed48a', 'Twisted Love by Ana Huang', 2459.00, 'Unknown Publisher', '2021-01-01', 282, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9786070793677-L.jpg'),
('ce4d96d2-da15-4f19-af17-4fc7f1ca0f21', '9781735056692', 'Twisted Hate', 'twisted-hate-ce4d96d2', 'Twisted Hate by Ana Huang', 2697.00, 'Unknown Publisher', '2022-01-01', 469, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9781735056692-L.jpg'),
('49bf0652-e8ba-4c4f-996d-c55238bcb4b7', '9781543644548', 'Punk 57', 'punk-57-49bf0652', 'Punk 57 by Penelope Douglas', 4490.00, 'Unknown Publisher', '2016-01-01', 295, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9781543644548-L.jpg'),
('ab067a51-c0a6-48db-abcc-c13497abb89e', '9788381352079', 'It Starts with Us', 'it-starts-with-us-ab067a51', 'It Starts with Us by Colleen Hoover', 4520.00, 'Unknown Publisher', '2022-01-01', 433, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9788381352079-L.jpg'),
('75bc84c7-2204-4146-88af-f49a3dd69600', '9781721284443', 'The Sweetest Oblivion', 'the-sweetest-oblivion-75bc84c7', 'The Sweetest Oblivion by Danielle Lori', 3573.00, 'Unknown Publisher', '2018-01-01', 545, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9781721284443-L.jpg'),
('8ff59463-f893-4fa3-891a-2a8d62c737c1', '9781335468437', 'Heated Rivalry', 'heated-rivalry-8ff59463', 'Heated Rivalry by Rachel Reid', 4736.00, 'Unknown Publisher', '2019-01-01', 237, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9781335468437-L.jpg'),
('aecd67fe-892c-4fb7-a091-f7abc8fcb170', '9788408282952', 'Twisted Lies', 'twisted-lies-aecd67fe', 'Twisted Lies by Ana Huang', 4251.00, 'Unknown Publisher', '2022-01-01', 566, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9788408282952-L.jpg'),
('87caf60c-e1ac-4874-8368-08a2d97654e6', '9780593642009', 'Corrupt', 'corrupt-87caf60c', 'Corrupt by Penelope Douglas', 2965.00, 'Unknown Publisher', '2015-01-01', 390, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9780593642009-L.jpg'),
('b55c6123-bbf2-4545-9f35-84324907f5c7', '9788408258360', 'It Ends With Us', 'it-ends-with-us-b55c6123', 'It Ends With Us by Colleen Hoover', 2234.00, 'Unknown Publisher', '2012-01-01', 464, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9788408258360-L.jpg'),
('b40ba02a-3432-4657-b70d-6c633dcd3329', '9780263779233', 'Breaking Point', 'breaking-point-b40ba02a', 'Breaking Point by Emma Darcy', 3360.00, 'Unknown Publisher', '1992-01-01', 537, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9780263779233-L.jpg'),
('c3ebfdd4-a286-4ac2-9564-2dc94e36e318', '9780750504355', 'Devil and the Deep Sea', 'devil-and-the-deep-sea-c3ebfdd4', 'Devil and the Deep Sea by Sara Craven', 2324.00, 'Unknown Publisher', '1988-01-01', 515, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9780750504355-L.jpg'),
('05585e39-910d-4efc-9704-63bdbc538a44', '9788381351881', 'Hopeless', 'hopeless-05585e39', 'Hopeless by Colleen Hoover', 4260.00, 'Unknown Publisher', '2013-01-01', 547, '61a69a83-63f2-4635-9359-8163d9c163d7', 'https://covers.openlibrary.org/b/isbn/9788381351881-L.jpg');

INSERT INTO book_authors (book_id, author_id) VALUES
('2e38cb56-9289-45c1-8ffb-8f24afbb55da', '9433b54e-c5de-4ace-89fc-58a1a81d03b1'),
('9b5ed48a-9d3e-499f-8914-13098d3bd251', '9433b54e-c5de-4ace-89fc-58a1a81d03b1'),
('ce4d96d2-da15-4f19-af17-4fc7f1ca0f21', '9433b54e-c5de-4ace-89fc-58a1a81d03b1'),
('49bf0652-e8ba-4c4f-996d-c55238bcb4b7', 'ff732e1c-84e4-411d-9593-174dcccec4f3'),
('ab067a51-c0a6-48db-abcc-c13497abb89e', '8f610224-5617-4d44-b522-56393b1b7dab'),
('75bc84c7-2204-4146-88af-f49a3dd69600', '4602f9be-a347-4838-abb6-1113f3e28f7a'),
('8ff59463-f893-4fa3-891a-2a8d62c737c1', '1b221de1-64d6-4891-9250-6f65d2219300'),
('aecd67fe-892c-4fb7-a091-f7abc8fcb170', '9433b54e-c5de-4ace-89fc-58a1a81d03b1'),
('87caf60c-e1ac-4874-8368-08a2d97654e6', 'ff732e1c-84e4-411d-9593-174dcccec4f3'),
('b55c6123-bbf2-4545-9f35-84324907f5c7', '8f610224-5617-4d44-b522-56393b1b7dab'),
('b40ba02a-3432-4657-b70d-6c633dcd3329', 'f5677e75-bb63-4a58-b995-54b4befa7d93'),
('c3ebfdd4-a286-4ac2-9564-2dc94e36e318', 'c95456a2-24b1-48c3-a370-0673e7c437be'),
('05585e39-910d-4efc-9704-63bdbc538a44', '8f610224-5617-4d44-b522-56393b1b7dab');

-- Category: Fantasy
INSERT INTO categories (id, name, slug, description, parent_id) VALUES ('6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'Fantasy', 'fantasy-6f8c01e3', 'Fantasy books', '30000000-0000-0000-0000-000000000001');

INSERT INTO authors (id, name, slug, biography) VALUES
('46f9d78f-a821-4797-8632-79e8733079ce', 'Joe Abercrombie', 'joe-abercrombie-46f9d78f', 'Biography for Joe Abercrombie'),
('ee3b2520-bd14-4b49-83c8-8806550be148', 'Brandon Sanderson', 'brandon-sanderson-ee3b2520', 'Biography for Brandon Sanderson'),
('ed7f3c8b-1529-43d8-bd41-e639551594c6', 'Scott Lynch', 'scott-lynch-ed7f3c8b', 'Biography for Scott Lynch'),
('307d9f83-df2a-4f5f-9c3b-fd5366f72a79', 'Sarah J. Maas', 'sarah-j-maas-307d9f83', 'Biography for Sarah J. Maas'),
('b794faec-7524-401c-a6a6-0cba90d7492f', 'Terry Goodkind', 'terry-goodkind-b794faec', 'Biography for Terry Goodkind'),
('a00d7cbf-6ae3-4de0-9bc6-b1b9c4ea542a', 'Andrzej Sapkowski', 'andrzej-sapkowski-a00d7cbf', 'Biography for Andrzej Sapkowski'),
('96446bf7-2483-41d2-b64d-a691b52b5350', 'R. F. Kuang', 'r-f-kuang-96446bf7', 'Biography for R. F. Kuang'),
('93f52321-ff51-41e6-a7ba-583501ebe979', 'Robert Jordan', 'robert-jordan-93f52321', 'Biography for Robert Jordan'),
('95ed03d9-1a15-49e8-9e17-d1ff0367dec6', 'William Goldman', 'william-goldman-95ed03d9', 'Biography for William Goldman'),
('cf240c10-1a91-429f-b1f7-44e1430a881e', 'Terry Pratchett', 'terry-pratchett-cf240c10', 'Biography for Terry Pratchett'),
('5a4c0243-f3cd-433b-a297-15bfb32a4055', 'J.R.R. Tolkien', 'j-r-r-tolkien-5a4c0243', 'Biography for J.R.R. Tolkien');

INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
('93335217-4d04-4f4c-a065-fab739564653', '9780575091504', 'The Blade Itself', 'the-blade-itself-93335217', 'The Blade Itself by Joe Abercrombie', 4024.00, 'Unknown Publisher', '2001-01-01', 522, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9780575091504-L.jpg'),
('2c1c94f6-a8f5-4887-ae8c-500bde8b2e8c', '9788374805568', 'The Hero of Ages', 'the-hero-of-ages-2c1c94f6', 'The Hero of Ages by Brandon Sanderson', 4102.00, 'Unknown Publisher', '2008-01-01', 427, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9788374805568-L.jpg'),
('ddbf08ce-78c0-47ca-b69c-b8f69b774d91', '9780553902716', 'The Lies of Locke Lamora', 'the-lies-of-locke-lamora-ddbf08ce', 'The Lies of Locke Lamora by Scott Lynch', 4736.00, 'Unknown Publisher', '2001-01-01', 443, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9780553902716-L.jpg'),
('cb6cfa69-792b-42e8-af77-9b1aba0a7dd2', '9786073814423', 'The Assassin’s Blade', 'the-assassin-s-blade-cb6cfa69', 'The Assassin’s Blade by Sarah J. Maas', 4646.00, 'Unknown Publisher', '2014-01-01', 388, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9786073814423-L.jpg'),
('9abde909-4534-4de4-859b-8c27cc769740', '9781561005987', 'Wizard''s First Rule', 'wizard-s-first-rule-9abde909', 'Wizard''s First Rule by Terry Goodkind', 2440.00, 'Unknown Publisher', '1994-01-01', 351, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9781561005987-L.jpg'),
('1a48678d-2f02-4261-b083-2644663ced3c', '9788074770814', 'Krew elfów', 'krew-elfo-w-1a48678d', 'Krew elfów by Andrzej Sapkowski', 3492.00, 'Unknown Publisher', '1994-01-01', 450, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9788074770814-L.jpg'),
('d80711bf-4b6c-4365-9551-1b07c6b61aec', '9781538519080', 'The Poppy War', 'the-poppy-war-d80711bf', 'The Poppy War by R. F. Kuang', 2095.00, 'Unknown Publisher', '2018-01-01', 466, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9781538519080-L.jpg'),
('e5a8d7d4-0ea4-4440-9229-21d0d6c89be2', '9781575110981', 'The Eye of the World', 'the-eye-of-the-world-e5a8d7d4', 'The Eye of the World by Robert Jordan', 4173.00, 'Unknown Publisher', '1990-01-01', 523, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9781575110981-L.jpg'),
('76f66ec3-d276-4ea5-a72d-a2e5ebbc87bb', '9780156035156', 'The Princess Bride', 'the-princess-bride-76f66ec3', 'The Princess Bride by William Goldman', 3049.00, 'Unknown Publisher', '1973-01-01', 402, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9780156035156-L.jpg'),
('a12e2265-49c6-4f9c-a270-3d6368cae151', '9788448034580', 'Lord of Chaos', 'lord-of-chaos-a12e2265', 'Lord of Chaos by Robert Jordan', 3705.00, 'Unknown Publisher', '1994-01-01', 315, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9788448034580-L.jpg'),
('72d564f2-cade-4c4b-9bed-0fe7e89b2097', '9780575105843', 'The Alloy of Law', 'the-alloy-of-law-72d564f2', 'The Alloy of Law by Brandon Sanderson', 4742.00, 'Unknown Publisher', '2001-01-01', 508, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9780575105843-L.jpg'),
('96e6bab5-7c64-45e9-af8b-5b228bbac1cc', '9780857522962', 'Small Gods', 'small-gods-96e6bab5', 'Small Gods by Terry Pratchett', 2885.00, 'Unknown Publisher', '1992-01-01', 582, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9780857522962-L.jpg'),
('5d7f0004-30ac-4190-b304-bb07cabd8504', '9783453317109', 'The Way of Kings', 'the-way-of-kings-5d7f0004', 'The Way of Kings by Brandon Sanderson', 3330.00, 'Unknown Publisher', '2010-01-01', 330, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9783453317109-L.jpg'),
('93c7ba49-fe68-4667-bf53-e9f8c0e9c4db', '9780007322565', 'The Silmarillion', 'the-silmarillion-93c7ba49', 'The Silmarillion by J.R.R. Tolkien', 4096.00, 'Unknown Publisher', '1977-01-01', 556, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9780007322565-L.jpg'),
('a41c8666-9366-4387-af8f-e44fd687ea75', '9788580445046', 'Elantris', 'elantris-a41c8666', 'Elantris by Brandon Sanderson', 2775.00, 'Unknown Publisher', '2005-01-01', 357, '6f8c01e3-fb88-4144-813e-23f0cee11ad1', 'https://covers.openlibrary.org/b/isbn/9788580445046-L.jpg');

INSERT INTO book_authors (book_id, author_id) VALUES
('93335217-4d04-4f4c-a065-fab739564653', '46f9d78f-a821-4797-8632-79e8733079ce'),
('2c1c94f6-a8f5-4887-ae8c-500bde8b2e8c', 'ee3b2520-bd14-4b49-83c8-8806550be148'),
('ddbf08ce-78c0-47ca-b69c-b8f69b774d91', 'ed7f3c8b-1529-43d8-bd41-e639551594c6'),
('cb6cfa69-792b-42e8-af77-9b1aba0a7dd2', '307d9f83-df2a-4f5f-9c3b-fd5366f72a79'),
('9abde909-4534-4de4-859b-8c27cc769740', 'b794faec-7524-401c-a6a6-0cba90d7492f'),
('1a48678d-2f02-4261-b083-2644663ced3c', 'a00d7cbf-6ae3-4de0-9bc6-b1b9c4ea542a'),
('d80711bf-4b6c-4365-9551-1b07c6b61aec', '96446bf7-2483-41d2-b64d-a691b52b5350'),
('e5a8d7d4-0ea4-4440-9229-21d0d6c89be2', '93f52321-ff51-41e6-a7ba-583501ebe979'),
('76f66ec3-d276-4ea5-a72d-a2e5ebbc87bb', '95ed03d9-1a15-49e8-9e17-d1ff0367dec6'),
('a12e2265-49c6-4f9c-a270-3d6368cae151', '93f52321-ff51-41e6-a7ba-583501ebe979'),
('72d564f2-cade-4c4b-9bed-0fe7e89b2097', 'ee3b2520-bd14-4b49-83c8-8806550be148'),
('96e6bab5-7c64-45e9-af8b-5b228bbac1cc', 'cf240c10-1a91-429f-b1f7-44e1430a881e'),
('5d7f0004-30ac-4190-b304-bb07cabd8504', 'ee3b2520-bd14-4b49-83c8-8806550be148'),
('93c7ba49-fe68-4667-bf53-e9f8c0e9c4db', '5a4c0243-f3cd-433b-a297-15bfb32a4055'),
('a41c8666-9366-4387-af8f-e44fd687ea75', 'ee3b2520-bd14-4b49-83c8-8806550be148');

-- Category: Business
INSERT INTO categories (id, name, slug, description, parent_id) VALUES ('1c39aea5-e279-4229-8a20-8e2578f19e2e', 'Business', 'business-1c39aea5', 'Business books', '30000000-0000-0000-0000-000000000002');

INSERT INTO authors (id, name, slug, biography) VALUES
('05f094c8-eb16-4e3e-b46e-f3d0d9bd7919', 'Simon Sinek', 'simon-sinek-05f094c8', 'Biography for Simon Sinek'),
('0c4555ae-f629-4c8c-aa1a-d1671a31f095', 'James Clear', 'james-clear-0c4555ae', 'Biography for James Clear'),
('e15bbef1-9539-4ae3-9e08-d5cddc8b7ef2', 'Peter A. Thiel', 'peter-a-thiel-e15bbef1', 'Biography for Peter A. Thiel'),
('fa8c1aab-936d-42cd-ab37-be23193a9bc9', 'Alex Hormozi', 'alex-hormozi-fa8c1aab', 'Biography for Alex Hormozi'),
('4e1dec22-8ea4-47d2-95d9-d81f12d37687', 'Mark Douglas', 'mark-douglas-4e1dec22', 'Biography for Mark Douglas'),
('500d5b27-8108-4771-ac09-387290efe83a', 'Ben Horowitz', 'ben-horowitz-500d5b27', 'Biography for Ben Horowitz'),
('cfd50c6c-5a28-46d4-8bd3-b92bddcab6a7', 'Napoleon Hill', 'napoleon-hill-cfd50c6c', 'Biography for Napoleon Hill'),
('15d6ed4d-494c-44ed-8b94-1dea66bf6b35', 'Brian Tracy', 'brian-tracy-15d6ed4d', 'Biography for Brian Tracy'),
('5da3411f-fb30-4a93-a1a0-4a261a849ee3', 'Chris Voss', 'chris-voss-5da3411f', 'Biography for Chris Voss'),
('4c5164d5-75a0-45a7-853c-a7cbbe7035a8', 'Ryan Holiday', 'ryan-holiday-4c5164d5', 'Biography for Ryan Holiday'),
('448a3e44-322e-46e6-8fb7-9d53ca0b3380', 'Ann Handley', 'ann-handley-448a3e44', 'Biography for Ann Handley'),
('11dae5b2-c0ee-4c1e-a0b5-958cf38d3d34', 'Robert D. Hisrich', 'robert-d-hisrich-11dae5b2', 'Biography for Robert D. Hisrich'),
('dc8add84-a7c9-4208-8fc4-412d825ee614', 'Cal Newport', 'cal-newport-dc8add84', 'Biography for Cal Newport'),
('f6e075cf-f25e-4eb8-9bb3-5e7ff58f15e9', 'Jason Fried', 'jason-fried-f6e075cf', 'Biography for Jason Fried'),
('664e620c-97cf-4394-8cf4-56759d6dc0f3', 'Collins, James C.', 'collins-james-c-664e620c', 'Biography for Collins, James C.');

INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
('b5ea7827-8002-44e3-a46c-c9949775fa76', '9781984842305', 'Start with why', 'start-with-why-b5ea7827', 'Start with why by Simon Sinek', 2301.00, 'Unknown Publisher', '2009-01-01', 520, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781984842305-L.jpg'),
('ec786bef-aa42-40a0-835d-f7a1e931d782', '9781473537804', 'Atomic Habits', 'atomic-habits-ec786bef', 'Atomic Habits by James Clear', 4699.00, 'Unknown Publisher', '2016-01-01', 409, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781473537804-L.jpg'),
('285ac49a-eada-4a61-bbf3-a6f01b6a7699', '9780553418286', 'Zero to One', 'zero-to-one-285ac49a', 'Zero to One by Peter A. Thiel', 4144.00, 'Unknown Publisher', '2001-01-01', 348, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9780553418286-L.jpg'),
('72b75886-4c89-4627-bbe7-02e0f3568904', '9781963349023', '$100M Offers', '100m-offers-72b75886', '$100M Offers by Alex Hormozi', 4656.00, 'Unknown Publisher', '2021-01-01', 251, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781963349023-L.jpg'),
('54ab5c51-b115-4a46-8c72-317e974902bc', '9781464016882', 'Trading in the zone', 'trading-in-the-zone-54ab5c51', 'Trading in the zone by Mark Douglas', 3708.00, 'Unknown Publisher', '2001-01-01', 224, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781464016882-L.jpg'),
('22561f22-f285-48ab-b342-58fb10699ec1', '9780062273208', 'The Hard Thing About Hard Things', 'the-hard-thing-about-hard-things-22561f22', 'The Hard Thing About Hard Things by Ben Horowitz', 2329.00, 'Unknown Publisher', '2014-01-01', 344, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9780062273208-L.jpg'),
('a398319d-4f9d-418a-8f6e-e2910c428f4d', '9781306337564', 'Think and Grow Rich', 'think-and-grow-rich-a398319d', 'Think and Grow Rich by Napoleon Hill', 2137.00, 'Unknown Publisher', '1937-01-01', 207, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781306337564-L.jpg'),
('23b96e63-bbeb-4db4-b7df-397fb0b08a2c', '9781605090962', 'Eat That Frog! 21 Great Ways to Stop Procrastinating and Get More Done in Less Time', 'eat-that-frog-21-great-ways-to-stop-procrastinating-and-get-more-done-in-less-time-23b96e63', 'Eat That Frog! 21 Great Ways to Stop Procrastinating and Get More Done in Less Time by Brian Tracy', 3173.00, 'Unknown Publisher', '2001-01-01', 541, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781605090962-L.jpg'),
('b3cf37c1-bcfe-476a-b4f0-cd86404feeab', '9781847941480', 'Never Split the Difference', 'never-split-the-difference-b3cf37c1', 'Never Split the Difference by Chris Voss', 3674.00, 'Unknown Publisher', '2016-01-01', 452, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781847941480-L.jpg'),
('d8c59956-fc16-482a-a2ea-f3fd59a1f0ee', '9781781251485', 'The Obstacle is the Way', 'the-obstacle-is-the-way-d8c59956', 'The Obstacle is the Way by Ryan Holiday', 3607.00, 'Unknown Publisher', '2013-01-01', 470, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781781251485-L.jpg'),
('0af0e6a2-54d0-41ff-9656-f8c0ae11f0a2', '9781322110233', 'Everybody Writes', 'everybody-writes-0af0e6a2', 'Everybody Writes by Ann Handley', 2051.00, 'Unknown Publisher', '2014-01-01', 238, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9781322110233-L.jpg'),
('ee460dc5-b1c8-486e-8719-02d917f85d6b', '9780256234787', 'Entrepreneurship', 'entrepreneurship-ee460dc5', 'Entrepreneurship by Robert D. Hisrich', 2526.00, 'Unknown Publisher', '1989-01-01', 279, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9780256234787-L.jpg'),
('01a9d799-d716-40d5-afa6-938928d1c81f', '9783864149351', 'Deep Work', 'deep-work-01a9d799', 'Deep Work by Cal Newport', 3199.00, 'Unknown Publisher', '2016-01-01', 527, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9783864149351-L.jpg'),
('873bba4e-e8ee-47f3-ba22-b70cae258e2c', '9780307704511', 'Rework', 'rework-873bba4e', 'Rework by Jason Fried', 3546.00, 'Unknown Publisher', '2010-01-01', 585, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9780307704511-L.jpg'),
('3fd58d32-4a2d-4f06-b4b4-8cd27f4ea6c7', '9780130853660', 'Beyond entrepreneurship', 'beyond-entrepreneurship-3fd58d32', 'Beyond entrepreneurship by Collins, James C.', 3418.00, 'Unknown Publisher', '1992-01-01', 333, '1c39aea5-e279-4229-8a20-8e2578f19e2e', 'https://covers.openlibrary.org/b/isbn/9780130853660-L.jpg');

INSERT INTO book_authors (book_id, author_id) VALUES
('b5ea7827-8002-44e3-a46c-c9949775fa76', '05f094c8-eb16-4e3e-b46e-f3d0d9bd7919'),
('ec786bef-aa42-40a0-835d-f7a1e931d782', '0c4555ae-f629-4c8c-aa1a-d1671a31f095'),
('285ac49a-eada-4a61-bbf3-a6f01b6a7699', 'e15bbef1-9539-4ae3-9e08-d5cddc8b7ef2'),
('72b75886-4c89-4627-bbe7-02e0f3568904', 'fa8c1aab-936d-42cd-ab37-be23193a9bc9'),
('54ab5c51-b115-4a46-8c72-317e974902bc', '4e1dec22-8ea4-47d2-95d9-d81f12d37687'),
('22561f22-f285-48ab-b342-58fb10699ec1', '500d5b27-8108-4771-ac09-387290efe83a'),
('a398319d-4f9d-418a-8f6e-e2910c428f4d', 'cfd50c6c-5a28-46d4-8bd3-b92bddcab6a7'),
('23b96e63-bbeb-4db4-b7df-397fb0b08a2c', '15d6ed4d-494c-44ed-8b94-1dea66bf6b35'),
('b3cf37c1-bcfe-476a-b4f0-cd86404feeab', '5da3411f-fb30-4a93-a1a0-4a261a849ee3'),
('d8c59956-fc16-482a-a2ea-f3fd59a1f0ee', '4c5164d5-75a0-45a7-853c-a7cbbe7035a8'),
('0af0e6a2-54d0-41ff-9656-f8c0ae11f0a2', '448a3e44-322e-46e6-8fb7-9d53ca0b3380'),
('ee460dc5-b1c8-486e-8719-02d917f85d6b', '11dae5b2-c0ee-4c1e-a0b5-958cf38d3d34'),
('01a9d799-d716-40d5-afa6-938928d1c81f', 'dc8add84-a7c9-4208-8fc4-412d825ee614'),
('873bba4e-e8ee-47f3-ba22-b70cae258e2c', 'f6e075cf-f25e-4eb8-9bb3-5e7ff58f15e9'),
('3fd58d32-4a2d-4f06-b4b4-8cd27f4ea6c7', '664e620c-97cf-4394-8cf4-56759d6dc0f3');

-- Category: Mystery
INSERT INTO categories (id, name, slug, description, parent_id) VALUES ('3eb55736-b134-4fba-b9c2-0722b45d75dd', 'Mystery', 'mystery_and_detective_stories-3eb55736', 'Mystery books', '30000000-0000-0000-0000-000000000001');

INSERT INTO authors (id, name, slug, biography) VALUES
('4c9983a7-bb66-49de-8040-c467aeeae303', 'Carolyn Keene', 'carolyn-keene-4c9983a7', 'Biography for Carolyn Keene'),
('44bc45b5-0145-4370-a91e-6142e4f3c2aa', 'Agatha Christie', 'agatha-christie-44bc45b5', 'Biography for Agatha Christie'),
('21d29e22-930e-4d58-9e20-989511a4000d', 'Arthur Conan Doyle', 'arthur-conan-doyle-21d29e22', 'Biography for Arthur Conan Doyle'),
('76a69163-11da-46db-b3b8-6a0926ed184a', 'A. A. Milne', 'a-a-milne-76a69163', 'Biography for A. A. Milne'),
('e559eca2-5652-4c3c-bc37-9d8e7dbc6e3f', 'Raymond Chandler', 'raymond-chandler-e559eca2', 'Biography for Raymond Chandler');

INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
('8ce68c98-e702-41d2-b364-deb564f09fd6', '9781440673658', 'The Hidden Staircase', 'the-hidden-staircase-8ce68c98', 'The Hidden Staircase by Carolyn Keene', 2060.00, 'Unknown Publisher', '1930-01-01', 575, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9781440673658-L.jpg'),
('9cadfea2-3a22-4f58-8a12-d719f30cac6a', '9780061002878', 'Poirot investigates', 'poirot-investigates-9cadfea2', 'Poirot investigates by Agatha Christie', 3472.00, 'Unknown Publisher', '1924-01-01', 414, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9780061002878-L.jpg'),
('b456da8a-5739-42df-8a1f-53082c102731', '9781645940821', 'The Man in the Brown Suit', 'the-man-in-the-brown-suit-b456da8a', 'The Man in the Brown Suit by Agatha Christie', 2677.00, 'Unknown Publisher', '1924-01-01', 293, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9781645940821-L.jpg'),
('bfe2b32e-3058-40f1-9852-483424332e91', '9781513265933', 'A Study in Scarlet', 'a-study-in-scarlet-bfe2b32e', 'A Study in Scarlet by Arthur Conan Doyle', 2271.00, 'Unknown Publisher', '1887-01-01', 549, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9781513265933-L.jpg'),
('d893c465-02b7-492c-ab5c-41b83f361027', '9780586045145', 'The Secret of Chimneys', 'the-secret-of-chimneys-d893c465', 'The Secret of Chimneys by Agatha Christie', 3611.00, 'Unknown Publisher', '1925-01-01', 287, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9780586045145-L.jpg'),
('95c831d1-198f-4124-9dd6-41af46288b3c', '9788417454432', 'The Red House Mystery', 'the-red-house-mystery-95c831d1', 'The Red House Mystery by A. A. Milne', 4355.00, 'Unknown Publisher', '1922-01-01', 581, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9788417454432-L.jpg'),
('4eee8255-1c96-4bee-91ec-414ebf2aece7', '9788447369225', 'Sleeping Murder', 'sleeping-murder-4eee8255', 'Sleeping Murder by Agatha Christie', 2585.00, 'Unknown Publisher', '1940-01-01', 257, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9788447369225-L.jpg'),
('0c272ffb-61b1-4510-91db-a1dd4d948a3f', '9781549699795', 'Memoirs of Sherlock Holmes [11 stories]', 'memoirs-of-sherlock-holmes-11-stories-0c272ffb', 'Memoirs of Sherlock Holmes [11 stories] by Arthur Conan Doyle', 3663.00, 'Unknown Publisher', '1893-01-01', 324, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9781549699795-L.jpg'),
('362f8ff0-abf0-4efa-822a-4f59c9a12dd7', '9781440673641', 'The Secret of the Old Clock', 'the-secret-of-the-old-clock-362f8ff0', 'The Secret of the Old Clock by Carolyn Keene', 2643.00, 'Unknown Publisher', '1930-01-01', 508, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9781440673641-L.jpg'),
('35b4e45c-ff5f-4c03-8f4d-37beca82ede1', '9783502513018', 'Murder in Three Acts', 'murder-in-three-acts-35b4e45c', 'Murder in Three Acts by Agatha Christie', 4105.00, 'Unknown Publisher', '1934-01-01', 421, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9783502513018-L.jpg'),
('986f6130-f0c0-4efb-97da-95d2fcd6ae2d', '9788402092014', 'The Big Sleep', 'the-big-sleep-986f6130', 'The Big Sleep by Raymond Chandler', 2270.00, 'Unknown Publisher', '1939-01-01', 259, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9788402092014-L.jpg'),
('614fbb39-a857-4dad-9e68-beb6988609fd', '9788804507727', 'The Big Four', 'the-big-four-614fbb39', 'The Big Four by Agatha Christie', 4953.00, 'Unknown Publisher', '1927-01-01', 534, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9788804507727-L.jpg'),
('2f9203e0-8d2f-4c9f-a40f-7a79cedc2869', '9780007493579', 'After the Funeral', 'after-the-funeral-2f9203e0', 'After the Funeral by Agatha Christie', 4728.00, 'Unknown Publisher', '1953-01-01', 389, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9780007493579-L.jpg'),
('403d2b28-3b24-4fe5-915d-ef453c3c0d66', '9788492966660', 'The Murder of Roger Ackroyd', 'the-murder-of-roger-ackroyd-403d2b28', 'The Murder of Roger Ackroyd by Agatha Christie', 3848.00, 'Unknown Publisher', '1926-01-01', 479, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9788492966660-L.jpg'),
('ec044448-93de-4b7d-9461-5663b04ca362', '9781070472874', 'His Last Bow [8 stories]', 'his-last-bow-8-stories-ec044448', 'His Last Bow [8 stories] by Arthur Conan Doyle', 3514.00, 'Unknown Publisher', '1917-01-01', 556, '3eb55736-b134-4fba-b9c2-0722b45d75dd', 'https://covers.openlibrary.org/b/isbn/9781070472874-L.jpg');

INSERT INTO book_authors (book_id, author_id) VALUES
('8ce68c98-e702-41d2-b364-deb564f09fd6', '4c9983a7-bb66-49de-8040-c467aeeae303'),
('9cadfea2-3a22-4f58-8a12-d719f30cac6a', '44bc45b5-0145-4370-a91e-6142e4f3c2aa'),
('b456da8a-5739-42df-8a1f-53082c102731', '44bc45b5-0145-4370-a91e-6142e4f3c2aa'),
('bfe2b32e-3058-40f1-9852-483424332e91', '21d29e22-930e-4d58-9e20-989511a4000d'),
('d893c465-02b7-492c-ab5c-41b83f361027', '44bc45b5-0145-4370-a91e-6142e4f3c2aa'),
('95c831d1-198f-4124-9dd6-41af46288b3c', '76a69163-11da-46db-b3b8-6a0926ed184a'),
('4eee8255-1c96-4bee-91ec-414ebf2aece7', '44bc45b5-0145-4370-a91e-6142e4f3c2aa'),
('0c272ffb-61b1-4510-91db-a1dd4d948a3f', '21d29e22-930e-4d58-9e20-989511a4000d'),
('362f8ff0-abf0-4efa-822a-4f59c9a12dd7', '4c9983a7-bb66-49de-8040-c467aeeae303'),
('35b4e45c-ff5f-4c03-8f4d-37beca82ede1', '44bc45b5-0145-4370-a91e-6142e4f3c2aa'),
('986f6130-f0c0-4efb-97da-95d2fcd6ae2d', 'e559eca2-5652-4c3c-bc37-9d8e7dbc6e3f'),
('614fbb39-a857-4dad-9e68-beb6988609fd', '44bc45b5-0145-4370-a91e-6142e4f3c2aa'),
('2f9203e0-8d2f-4c9f-a40f-7a79cedc2869', '44bc45b5-0145-4370-a91e-6142e4f3c2aa'),
('403d2b28-3b24-4fe5-915d-ef453c3c0d66', '44bc45b5-0145-4370-a91e-6142e4f3c2aa'),
('ec044448-93de-4b7d-9461-5663b04ca362', '21d29e22-930e-4d58-9e20-989511a4000d');

-- Category: History
INSERT INTO categories (id, name, slug, description, parent_id) VALUES ('4c0afa40-c705-49c9-94a5-3871722963fc', 'History', 'history-4c0afa40', 'History books', '30000000-0000-0000-0000-000000000002');

INSERT INTO authors (id, name, slug, biography) VALUES
('9e381928-cb0b-4bc7-8ceb-e0024eb074d7', 'David Graeber', 'david-graeber-9e381928', 'Biography for David Graeber'),
('a56d85c0-59e0-4d0d-8aa4-66ceaffb671e', 'Will Durant', 'will-durant-a56d85c0', 'Biography for Will Durant'),
('ddc3f3e5-8c6d-4f1c-885f-f9fec7df1404', 'Howard Zinn', 'howard-zinn-ddc3f3e5', 'Biography for Howard Zinn'),
('3aad5320-2cad-4d65-98d5-abaef99376b5', 'K. Bertens', 'k-bertens-3aad5320', 'Biography for K. Bertens'),
('276845a4-02ac-44eb-a34e-64df62f73eb3', 'Norman Melchert', 'norman-melchert-276845a4', 'Biography for Norman Melchert'),
('59cbc72c-dc90-4e45-9f75-eac06e8eff78', 'Emilio Aguinaldo', 'emilio-aguinaldo-59cbc72c', 'Biography for Emilio Aguinaldo'),
('2392912b-2c46-4a79-99eb-7a7c07c384f5', '孙武 (Sun Tzu)', 'sun-tzu-2392912b', 'Biography for 孙武 (Sun Tzu)'),
('7a7dbff7-b50c-40a6-b39f-815b7cb03bc5', 'Dominique Lapierre', 'dominique-lapierre-7a7dbff7', 'Biography for Dominique Lapierre'),
('b4d18850-6284-4bb5-a028-28241f807a64', 'Yuval Noah Harari', 'yuval-noah-harari-b4d18850', 'Biography for Yuval Noah Harari'),
('e3e71f46-319f-4f66-b843-832fac6d1378', 'William L. Shirer', 'william-l-shirer-e3e71f46', 'Biography for William L. Shirer'),
('6880f9be-8e42-499a-a527-0cede7ab6660', 'Mark Fisher', 'mark-fisher-6880f9be', 'Biography for Mark Fisher'),
('4228be6a-07ba-4de1-bc4b-e174f55051ae', 'E. H. Gombrich', 'e-h-gombrich-4228be6a', 'Biography for E. H. Gombrich'),
('c2c0b610-fc4a-482c-9219-25f5ba3f7d8e', 'Eric Hobsbawm', 'eric-hobsbawm-c2c0b610', 'Biography for Eric Hobsbawm');

INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES
('dcdc2a87-cc57-4589-807b-07d0969f062a', '9781612191812', 'Debt', 'debt-dcdc2a87', 'Debt by David Graeber', 3052.00, 'Unknown Publisher', '2011-01-01', 352, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9781612191812-L.jpg'),
('68646171-e7fa-4bc1-b659-8ff63ba817f6', '9781088153277', 'The Story of Philosophy', 'the-story-of-philosophy-68646171', 'The Story of Philosophy by Will Durant', 4191.00, 'Unknown Publisher', '1926-01-01', 330, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9781088153277-L.jpg'),
('d9e6614d-b5fd-411c-8203-298619279bdf', '9781317325307', 'A People''s History of the United States', 'a-people-s-history-of-the-united-states-d9e6614d', 'A People''s History of the United States by Howard Zinn', 2705.00, 'Unknown Publisher', '1980-01-01', 277, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9781317325307-L.jpg'),
('b53a8799-fd4c-4b9e-9829-11ca4b5fc63b', '9789794130834', 'Ringkasan sejarat filsafat', 'ringkasan-sejarat-filsafat-b53a8799', 'Ringkasan sejarat filsafat by K. Bertens', 3750.00, 'Unknown Publisher', '1975-01-01', 501, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9789794130834-L.jpg'),
('abaaa3ff-293c-4cd9-94ed-b4e66bc7e0d2', '9788418741524', 'The Lessons of History', 'the-lessons-of-history-abaaa3ff', 'The Lessons of History by Will Durant', 2203.00, 'Unknown Publisher', '1968-01-01', 450, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9788418741524-L.jpg'),
('fe69053a-995c-485d-824c-03a52f121dcb', '9780190670610', 'The great conversation', 'the-great-conversation-fe69053a', 'The great conversation by Norman Melchert', 2173.00, 'Unknown Publisher', '1991-01-01', 229, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9780190670610-L.jpg'),
('32302f98-acd8-43f4-a778-ae51738898b9', '9789719201847', 'Mga gunita ng himagsikan', 'mga-gunita-ng-himagsikan-32302f98', 'Mga gunita ng himagsikan by Emilio Aguinaldo', 2221.00, 'Unknown Publisher', '1998-01-01', 536, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9789719201847-L.jpg'),
('4a3f8566-9ce4-49c5-9274-15cf76db7130', '9781533142467', 'The Art of War', 'the-art-of-war-4a3f8566', 'The Art of War by 孙武 (Sun Tzu)', 2553.00, 'Unknown Publisher', '1900-01-01', 382, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9781533142467-L.jpg'),
('ce2040e7-0f83-436d-8c65-c54b18f85855', '9780706968019', 'Freedom at Midnight', 'freedom-at-midnight-ce2040e7', 'Freedom at Midnight by Dominique Lapierre', 3826.00, 'Unknown Publisher', '1975-01-01', 518, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9780706968019-L.jpg'),
('e0e9777e-ee78-4a4b-a482-50efb0899500', '9781846558238', 'Sapiens', 'sapiens-e0e9777e', 'Sapiens by Yuval Noah Harari', 4585.00, 'Unknown Publisher', '2011-01-01', 537, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9781846558238-L.jpg'),
('1000e3dd-790a-4318-b383-5739398530b5', '9780831774042', 'The Rise and Fall of the Third Reich', 'the-rise-and-fall-of-the-third-reich-1000e3dd', 'The Rise and Fall of the Third Reich by William L. Shirer', 2705.00, 'Unknown Publisher', '1901-01-01', 564, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9780831774042-L.jpg'),
('18e01eec-fd0b-4cb2-acc0-d3026f387890', '9789871622450', 'Capitalist Realism', 'capitalist-realism-18e01eec', 'Capitalist Realism by Mark Fisher', 2162.00, 'Unknown Publisher', '2009-01-01', 415, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9789871622450-L.jpg'),
('27682050-aa42-43d4-a632-5c43f2f2d2dc', '9780714822761', 'The story of art', 'the-story-of-art-27682050', 'The story of art by E. H. Gombrich', 4834.00, 'Unknown Publisher', '1950-01-01', 434, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9780714822761-L.jpg'),
('4e70c9a6-03ba-445a-88f4-151dbf964223', '9783893400614', 'The Age of Revolution', 'the-age-of-revolution-4e70c9a6', 'The Age of Revolution by Eric Hobsbawm', 3147.00, 'Unknown Publisher', '1962-01-01', 540, '4c0afa40-c705-49c9-94a5-3871722963fc', 'https://covers.openlibrary.org/b/isbn/9783893400614-L.jpg');

INSERT INTO book_authors (book_id, author_id) VALUES
('dcdc2a87-cc57-4589-807b-07d0969f062a', '9e381928-cb0b-4bc7-8ceb-e0024eb074d7'),
('68646171-e7fa-4bc1-b659-8ff63ba817f6', 'a56d85c0-59e0-4d0d-8aa4-66ceaffb671e'),
('d9e6614d-b5fd-411c-8203-298619279bdf', 'ddc3f3e5-8c6d-4f1c-885f-f9fec7df1404'),
('b53a8799-fd4c-4b9e-9829-11ca4b5fc63b', '3aad5320-2cad-4d65-98d5-abaef99376b5'),
('abaaa3ff-293c-4cd9-94ed-b4e66bc7e0d2', 'a56d85c0-59e0-4d0d-8aa4-66ceaffb671e'),
('fe69053a-995c-485d-824c-03a52f121dcb', '276845a4-02ac-44eb-a34e-64df62f73eb3'),
('32302f98-acd8-43f4-a778-ae51738898b9', '59cbc72c-dc90-4e45-9f75-eac06e8eff78'),
('4a3f8566-9ce4-49c5-9274-15cf76db7130', '2392912b-2c46-4a79-99eb-7a7c07c384f5'),
('ce2040e7-0f83-436d-8c65-c54b18f85855', '7a7dbff7-b50c-40a6-b39f-815b7cb03bc5'),
('e0e9777e-ee78-4a4b-a482-50efb0899500', 'b4d18850-6284-4bb5-a028-28241f807a64'),
('1000e3dd-790a-4318-b383-5739398530b5', 'e3e71f46-319f-4f66-b843-832fac6d1378'),
('18e01eec-fd0b-4cb2-acc0-d3026f387890', '6880f9be-8e42-499a-a527-0cede7ab6660'),
('27682050-aa42-43d4-a632-5c43f2f2d2dc', '4228be6a-07ba-4de1-bc4b-e174f55051ae'),
('4e70c9a6-03ba-445a-88f4-151dbf964223', 'c2c0b610-fc4a-482c-9219-25f5ba3f7d8e');

