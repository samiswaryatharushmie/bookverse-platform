import fs from 'fs';
import { randomUUID } from 'crypto';

const subjects = [
  { name: 'Romance', key: 'romance', parent: null },
  { name: 'Fantasy', key: 'fantasy', parent: '30000000-0000-0000-0000-000000000001' },
  { name: 'Business', key: 'business', parent: '30000000-0000-0000-0000-000000000002' },
  { name: 'Mystery', key: 'mystery_and_detective_stories', parent: '30000000-0000-0000-0000-000000000001' },
  { name: 'History', key: 'history', parent: '30000000-0000-0000-0000-000000000002' }
];

let sql = `-- V8__seed_expanded_catalog.sql\n\n`;

const generateId = () => randomUUID();

async function run() {
  for (const subject of subjects) {
    console.log(`Fetching books for ${subject.name}...`);
    const catId = generateId();
    sql += `-- Category: ${subject.name}\n`;
    sql += `INSERT INTO categories (id, name, slug, description, parent_id) VALUES ('${catId}', '${subject.name}', '${subject.key}-${catId.split('-')[0]}', '${subject.name} books', ${subject.parent ? `'${subject.parent}'` : 'NULL'});\n\n`;

    const res = await fetch(`https://openlibrary.org/search.json?subject=${subject.key}&fields=key,title,author_name,isbn,first_publish_year,cover_edition_key&limit=15`);
    const data = await res.json();

    const booksToInsert = [];
    const authorsToInsert = new Map();
    const bookAuthors = [];

    for (const doc of data.docs) {
      if (!doc.title || !doc.author_name || !doc.author_name[0] || !doc.isbn || !doc.isbn[0]) continue;
      
      const title = doc.title.replace(/'/g, "''").substring(0, 200);
      const authorName = doc.author_name[0].replace(/'/g, "''");
      const isbn = doc.isbn.find(i => i.startsWith('978')) || doc.isbn[0];
      const publishYear = doc.first_publish_year ? `${doc.first_publish_year}-01-01` : '2000-01-01';
      
      // Random price between 2000 and 5000
      const price = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
      const pageCount = Math.floor(Math.random() * (600 - 200 + 1) + 200);
      const bookId = generateId();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + bookId.split('-')[0];
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
      booksToInsert.push(`('${bookId}', '${isbn}', '${title}', '${slug}', '${title} by ${authorName}', ${price}.00, 'Unknown Publisher', '${publishYear}', ${pageCount}, '${catId}', '${coverUrl}')`);

      let authorId;
      if (authorsToInsert.has(authorName)) {
        authorId = authorsToInsert.get(authorName);
      } else {
        authorId = generateId();
        authorsToInsert.set(authorName, authorId);
      }

      bookAuthors.push(`('${bookId}', '${authorId}')`);
    }

    if (authorsToInsert.size > 0) {
      sql += `INSERT INTO authors (id, name, slug, biography) VALUES\n`;
      const authorVals = Array.from(authorsToInsert.entries()).map(([name, id]) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.split('-')[0];
        return `('${id}', '${name}', '${slug}', 'Biography for ${name}')`;
      });
      sql += authorVals.join(',\n') + ';\n\n';
    }

    if (booksToInsert.length > 0) {
      sql += `INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES\n`;
      sql += booksToInsert.join(',\n') + ';\n\n';

      sql += `INSERT INTO book_authors (book_id, author_id) VALUES\n`;
      sql += bookAuthors.join(',\n') + ';\n\n';
    }
  }

  fs.writeFileSync('src/main/resources/db/migration/V8__seed_expanded_catalog.sql', sql);
  console.log('Successfully generated V8__seed_expanded_catalog.sql');
}

run().catch(console.error);
