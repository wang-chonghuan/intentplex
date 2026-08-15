/**
 * One-time import of the file corpus into Postgres, and the schema it goes into.
 *
 * Idempotent on purpose: the DDL is all `if not exists` and every insert is an
 * upsert keyed on the thing that identifies the row in the filesystem too
 * (`kind`+`slug` for entries, the public path for media). Running it twice
 * changes nothing, which is what makes it safe to re-run after a partial
 * failure rather than having to reason about what got through.
 *
 *   node scripts/migrate.mjs          # apply schema + import content/ and export/media/
 *   node scripts/migrate.mjs --schema-only
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import pg from 'pg';
import sharp from 'sharp';

const rootDir = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const schemaOnly = process.argv.includes('--schema-only');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set — see runbook.md.');
  process.exit(1);
}

const pool = new pg.Pool({connectionString, max: 4});
const uuid = () => crypto.randomUUID();
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// The same rules the site has always applied to a content file. Imported from
// source rather than restated so there is still exactly one definition of a
// valid entry.
const {parseContentFile} = await import('../src/content/validate.ts');

async function applySchema() {
  const ddl = fs.readFileSync(path.join(rootDir, 'src', 'db', 'schema.sql'), 'utf8');
  await pool.query(ddl);
  // `create table if not exists` leaves an existing table alone, so a constraint
  // that turned out to be wrong has to be dropped by name. media.sha256 was
  // unique until the archive proved it should not be — the same picture lives at
  // two paths there.
  await pool.query('alter table media drop constraint if exists media_sha256_key');
  await pool.query(
    'alter table entry add column if not exists generate_requested boolean not null default false');
  console.log('schema: applied');
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/**
 * Import every image in the repo's media export as-is.
 *
 * The bytes are **not** reprocessed. INTENTPLEX-7 already resized and converted
 * this archive, and its filenames are hashes of exactly these bytes — running
 * them through sharp again would change the bytes without changing the path and
 * quietly break the immutable-cache contract. New uploads get the pipeline; the
 * archive is copied.
 */
async function importMedia() {
  // export/media is where scripts/export-to-repo.mjs writes; public/media is
  // where the archive lived before INTENTPLEX-9 moved it. Reading both means
  // this script is the restore half of the backup, not a one-shot import.
  const exported = path.join(rootDir, 'export', 'media');
  const legacy = path.join(rootDir, 'public', 'media');
  const mediaRoot = fs.existsSync(exported) ? exported : legacy;
  const files = walk(mediaRoot).filter((f) => /\.(webp|svg|png|jpe?g)$/i.test(f));

  const fulls = files.filter((f) => !f.endsWith('.thumb.webp'));
  const thumbs = new Map(
    files
      .filter((f) => f.endsWith('.thumb.webp'))
      .map((f) => [f.replace(/\.thumb\.webp$/, '.webp'), f]),
  );

  const mimes = {'.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'};

  const byPath = new Map();
  for (const file of fulls) {
    const publicPath = '/media/' + path.relative(mediaRoot, file).split(path.sep).join('/');
    const bytes = fs.readFileSync(file);
    const thumbFile = thumbs.get(file);
    const thumbBytes = thumbFile ? fs.readFileSync(thumbFile) : null;

    let width = null;
    let height = null;
    if (!file.endsWith('.svg')) {
      const meta = await sharp(bytes).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    }

    const id = uuid();
    const inserted = await pool.query(
      `insert into media (id, sha256, path, mime, width, height, bytes, thumb_bytes)
            values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (path) do update
              set sha256 = excluded.sha256, mime = excluded.mime, width = excluded.width,
                  height = excluded.height, bytes = excluded.bytes,
                  thumb_bytes = excluded.thumb_bytes
        returning id`,
      [id, sha256(bytes), publicPath, mimes[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
       width, height, bytes, thumbBytes],
    );
    byPath.set(publicPath, inserted.rows[0].id);
  }

  console.log(`media: ${byPath.size} images (${thumbs.size} with thumbnails)`);
  return byPath;
}

async function importContent(mediaByPath) {
  const contentRoot = path.join(rootDir, 'content');
  const files = walk(contentRoot).filter((f) => f.endsWith('.md'));

  // Group by kind+slug first: the two language files of one entry are two rows
  // in `rendition` hanging off a single `entry`, exactly as the loader used to
  // group them in memory.
  const entries = new Map();
  for (const file of files) {
    const rel = '/' + path.relative(rootDir, file).split(path.sep).join('/');
    const parsed = parseContentFile(rel, fs.readFileSync(file, 'utf8'));
    const key = `${parsed.kind}:${parsed.slug}`;
    const group = entries.get(key) ?? {kind: parsed.kind, slug: parsed.slug, date: parsed.date,
      image: undefined, renditions: []};
    // The archive's two language files carry the same date; keep the earliest
    // so re-running cannot drift it.
    if (parsed.date < group.date) group.date = parsed.date;
    if (parsed.image && !group.image) group.image = parsed.image;
    group.renditions.push(parsed);
    entries.set(key, group);
  }

  let renditionCount = 0;
  for (const group of entries.values()) {
    const coverId = group.image ? (mediaByPath.get(group.image) ?? null) : null;
    if (group.image && !coverId) {
      throw new Error(`content: ${group.kind}:${group.slug} — cover image not found: ${group.image}`);
    }

    const inserted = await pool.query(
      `insert into entry (id, kind, slug, date, cover_media_id, status)
            values ($1, $2, $3, $4, $5, 'published')
       on conflict (kind, slug) do update
              set date = excluded.date, cover_media_id = excluded.cover_media_id,
                  updated_at = now()
        returning id`,
      [uuid(), group.kind, group.slug, group.date, coverId],
    );
    const entryId = inserted.rows[0].id;

    for (const r of group.renditions) {
      await pool.query(
        `insert into rendition (id, entry_id, lang, title, body_md, source_url, origin)
              values ($1, $2, $3, $4, $5, $6, 'authored')
         on conflict (entry_id, lang) do update
                set title = excluded.title, body_md = excluded.body_md,
                    source_url = excluded.source_url`,
        [uuid(), entryId, r.lang, r.title, r.body, r.source ?? null],
      );
      renditionCount += 1;
    }
  }

  console.log(`content: ${entries.size} entries, ${renditionCount} renditions`);
}

try {
  await applySchema();
  if (!schemaOnly) {
    const mediaByPath = await importMedia();
    await importContent(mediaByPath);
  }
  const counts = await pool.query(
    `select (select count(*) from entry) as entries,
            (select count(*) from rendition) as renditions,
            (select count(*) from media) as media`,
  );
  console.log('now in the database:', counts.rows[0]);
} finally {
  await pool.end();
}
