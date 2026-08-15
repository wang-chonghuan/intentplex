/**
 * Write the database back out as files, so the writing has a home outside Postgres.
 *
 * Content moved into the database in INTENTPLEX-9 and the repo stopped being the
 * runtime source. That left the corpus living in exactly one place — a Burstable
 * instance on a shared server — which is a worse place for someone's writing than
 * the git history it came from. This puts it back:
 *
 *   content/<kind>s/<date>-<slug>[.<lang>].md   the same layout it was imported from
 *   export/media/<path>                          the images, out of `public/` so the
 *                                                static middleware cannot shadow the
 *                                                database route with a stale copy
 *
 * Run it after publishing. It is a backup, not a source: nothing reads these files
 * at build or run time any more.
 *
 *   node --env-file=.env scripts/export-to-repo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import pg from 'pg';

const rootDir = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set — see runbook.md.');
  process.exit(1);
}

const pool = new pg.Pool({connectionString, max: 4});
const DIR_OF = {post: 'posts', article: 'articles', work: 'works'};

/** YAML needs the quotes escaped; everything else here is machine-generated. */
const yamlString = (v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

async function exportContent() {
  const {rows} = await pool.query(`
    select e.kind, e.slug, e.date, m.path as cover_path,
           r.lang, r.title, r.body_md, r.source_url,
           (select count(*) from rendition r2 where r2.entry_id = e.id) as lang_count
      from entry e
      join rendition r on r.entry_id = e.id
      left join media m on m.id = e.cover_media_id
     where e.status = 'published'
     order by e.date, e.slug, r.lang
  `);

  const contentRoot = path.join(rootDir, 'content');
  fs.rmSync(contentRoot, {recursive: true, force: true});

  for (const row of rows) {
    const dir = path.join(contentRoot, DIR_OF[row.kind]);
    fs.mkdirSync(dir, {recursive: true});
    const day = row.date.toISOString().slice(0, 10);
    // A single-language entry keeps the bare filename it was imported with; only
    // an entry that exists in more than one language needs the suffix to tell its
    // files apart. This is the same rule `validate.ts` reads.
    const suffix = Number(row.lang_count) > 1 ? `.${row.lang}` : '';
    const file = path.join(dir, `${day}-${row.slug}${suffix}.md`);

    const front = [
      '---',
      `title: ${yamlString(row.title)}`,
      `date: ${row.date.toISOString()}`,
      `lang: ${row.lang}`,
      ...(row.cover_path ? [`image: ${yamlString(row.cover_path)}`] : []),
      ...(row.source_url ? [`source: ${yamlString(row.source_url)}`] : []),
      '---',
      '',
    ].join('\n');

    fs.writeFileSync(file, front + row.body_md.trim() + '\n', 'utf8');
  }
  console.log(`content: ${rows.length} files`);
}

async function exportMedia() {
  const {rows} = await pool.query('select path, bytes, thumb_bytes from media order by path');
  const mediaRoot = path.join(rootDir, 'export', 'media');
  fs.rmSync(mediaRoot, {recursive: true, force: true});

  let files = 0;
  for (const row of rows) {
    const rel = row.path.replace(/^\/media\//, '');
    const full = path.join(mediaRoot, rel);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, row.bytes);
    files += 1;
    if (row.thumb_bytes) {
      fs.writeFileSync(full.replace(/\.webp$/, '.thumb.webp'), row.thumb_bytes);
      files += 1;
    }
  }
  console.log(`media: ${files} files (${rows.length} images)`);
}

try {
  await exportContent();
  await exportMedia();
} finally {
  await pool.end();
}
