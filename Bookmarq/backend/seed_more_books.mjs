import fs from 'fs';
import { randomUUID } from 'crypto';

const subjects = [
  { name: 'Fiction', id: '30000000-0000-0000-0000-000000000001', key: 'fiction', fetchCount: 15 },
  { name: 'Non-Fiction', id: '30000000-0000-0000-0000-000000000002', key: 'nonfiction', fetchCount: 15 },
  { name: 'Science Fiction', id: '30000000-0000-0000-0000-000000000003', key: 'science_fiction', fetchCount: 10 },
  { name: 'Mystery & Thriller', id: '30000000-0000-0000-0000-000000000004', key: 'thriller', fetchCount: 10 },
  { name: 'Biography', id: '30000000-0000-0000-0000-000000000005', key: 'biography', fetchCount: 15 },
  { name: 'Technology', id: '30000000-0000-0000-0000-000000000006', key: 'technology', fetchCount: 15 },
  { name: 'Children', id: '30000000-0000-0000-0000-000000000007', key: 'children', fetchCount: 15 },
  { name: 'Academic', id: '30000000-0000-0000-0000-000000000008', key: 'academic', fetchCount: 15 },
  { name: 'Romance', id: '61a69a83-63f2-4635-9359-8163d9c163d7', key: 'love', fetchCount: 5 },
  { name: 'History', id: '4c0afa40-c705-49c9-94a5-3871722963fc', key: 'world_history', fetchCount: 5 }
];

let sql = `-- V9__fill_category_gaps.sql\n\n`;

// Merge Mystery into Mystery & Thriller
sql += `-- Merge Mystery into Mystery & Thriller\n`;
sql += `UPDATE books SET category_id = '30000000-0000-0000-0000-000000000004' WHERE category_id = '3eb55736-b134-4fba-b9c2-0722b45d75dd';\n`;
sql += `DELETE FROM categories WHERE id = '3eb55736-b134-4fba-b9c2-0722b45d75dd';\n\n`;

const generateId = () => randomUUID();

async function run() {
  for (const subject of subjects) {
    console.log(`Fetching books for ${subject.name}...`);
    sql += `-- Seed ${subject.fetchCount} books for Category: ${subject.name}\n`;

    const res = await fetch(`https://openlibrary.org/search.json?subject=${subject.key}&fields=key,title,author_name,isbn,first_publish_year,cover_edition_key&limit=${subject.fetchCount + 10}`);
    const data = await res.json();

    const booksToInsert = [];
    const authorsToInsert = new Map();
    const bookAuthors = [];

    let count = 0;
    for (const doc of data.docs) {
      if (count >= subject.fetchCount) break;
      if (!doc.title || !doc.author_name || !doc.author_name[0] || !doc.isbn || !doc.isbn[0]) continue;
      
      const title = doc.title.replace(/'/g, "''").substring(0, 200);
      const authorName = doc.author_name[0].replace(/'/g, "''");
      const isbn = doc.isbn.find(i => i.startsWith('978')) || doc.isbn[0];
      const publishYear = doc.first_publish_year ? `${doc.first_publish_year}-01-01` : '2000-01-01';
      
      const price = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
      const pageCount = Math.floor(Math.random() * (600 - 200 + 1) + 200);
      
      const bookId = generateId();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + bookId.split('-')[0];
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

      booksToInsert.push({
        isbn: isbn,
        bookSql: `('${bookId}', '${isbn}', '${title}', '${slug}', '${title} by ${authorName}', ${price}.00, 'Unknown Publisher', '${publishYear}', ${pageCount}, '${subject.id}', '${coverUrl}')`
      });

      let authorId;
      if (authorsToInsert.has(authorName)) {
        authorId = authorsToInsert.get(authorName);
      } else {
        authorId = generateId();
        authorsToInsert.set(authorName, authorId);
      }

      bookAuthors.push(`('${bookId}', '${authorId}')`);
      count++;
    }

    if (authorsToInsert.size > 0) {
      sql += `INSERT INTO authors (id, name, slug, biography)\n`;
      sql += `SELECT a.id, a.name, a.slug, a.biography FROM (\n`;
      const authorVals = Array.from(authorsToInsert.entries()).map(([name, id]) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.split('-')[0];
        return `  SELECT '${id}' as id, '${name}' as name, '${slug}' as slug, 'Biography for ${name}' as biography`;
      });
      sql += authorVals.join(' UNION ALL\n') + '\n) a\n';
      sql += `WHERE NOT EXISTS (SELECT 1 FROM authors WHERE authors.slug = a.slug);\n\n`;
    }

    if (booksToInsert.length > 0) {
      for (let i = 0; i < booksToInsert.length; i++) {
        sql += `IF NOT EXISTS (SELECT 1 FROM books WHERE isbn = '${booksToInsert[i].isbn}')\n`;
        sql += `BEGIN\n`;
        sql += `  INSERT INTO books (id, isbn, title, slug, description, price, publisher, published_date, page_count, category_id, cover_url) VALUES\n`;
        sql += `  ${booksToInsert[i].bookSql};\n`;
        sql += `  INSERT INTO book_authors (book_id, author_id) VALUES\n`;
        sql += `  ${bookAuthors[i]};\n`;
        sql += `END\n\n`;
      }
    }
  }

  fs.writeFileSync('src/main/resources/db/migration/V9__fill_category_gaps.sql', sql);
  console.log('Successfully generated V9__fill_category_gaps.sql');
}

run().catch(console.error);
