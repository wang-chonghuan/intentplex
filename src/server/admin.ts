import '@tanstack/react-start/server-only';

import crypto from 'node:crypto';

import sharp from 'sharp';

import type {ItemKind} from '~/content/loader';
import type {EditableEntry, EntryDraft} from '~/rpc/types';
import {LOCALE_CODES} from '~/content/validate';
import {query} from '~/db/pool';
import * as media from '~/server/media';
import * as repo from '~/db/repo';

/**
 * Everything the admin writes.
 *
 * The build used to reject a malformed entry by filename, because content was
 * files and a Vite plugin could read them all. Content is rows now, so that
 * check moved here — to the moment a row is written, which is the only moment
 * anything can become malformed.
 */

/** The same rules `validate.ts` applies to a file, applied to a form. */
export function validateDraft(draft: EntryDraft): void {
  const fail = (problem: string): never => {
    throw new Error(`entry: ${problem}`);
  };

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
    fail(`slug must be lowercase words joined by hyphens, got "${draft.slug}"`);
  }
  if (!['post', 'article', 'work'].includes(draft.kind)) fail(`unknown kind "${draft.kind}"`);
  if (Number.isNaN(Date.parse(draft.date))) fail(`date is not parseable: "${draft.date}"`);
  if (draft.titleZh.trim() === '') fail('title is empty');
  if (draft.bodyZh.trim() === '') fail('body is empty');
}

export async function saveEntry(draft: EntryDraft): Promise<string> {
  validateDraft(draft);

  const coverId = draft.coverPath
    ? (
        await query<{id: string}>('select id from media where path = $1', [draft.coverPath])
      )[0]?.id ?? null
    : null;
  if (draft.coverPath && !coverId) throw new Error(`entry: cover not found: ${draft.coverPath}`);

  const rows = await query<{id: string}>(
    `insert into entry (id, kind, slug, date, cover_media_id, status)
          values ($1, $2, $3, $4, $5, $6)
     on conflict (kind, slug) do update
            set date = excluded.date, cover_media_id = excluded.cover_media_id,
                status = excluded.status, updated_at = now()
      returning id`,
    [draft.id ?? crypto.randomUUID(), draft.kind, draft.slug, draft.date, coverId, draft.status],
  );
  const entryId = rows[0]!.id;

  await query(
    `insert into rendition (id, entry_id, lang, title, body_md, origin)
          values ($1, $2, 'zh', $3, $4, 'authored')
     on conflict (entry_id, lang) do update
            set title = excluded.title, body_md = excluded.body_md`,
    [crypto.randomUUID(), entryId, draft.titleZh.trim(), draft.bodyZh.trim()],
  );

  repo.invalidate();
  return entryId;
}

/**
 * Save an English rendition that a model produced.
 *
 * Kept apart from `saveEntry` because the two differ in the thing that matters:
 * `origin` records that nobody typed this, and `ui.md` requires the author to
 * have read it before the entry is published.
 */
export async function saveGenerated(
  entryId: string,
  lang: (typeof LOCALE_CODES)[number],
  title: string,
  body: string,
): Promise<void> {
  if (title.trim() === '' || body.trim() === '') {
    throw new Error('generated rendition: title and body cannot be empty');
  }
  await query(
    `insert into rendition (id, entry_id, lang, title, body_md, origin)
          values ($1, $2, $3, $4, $5, 'generated')
     on conflict (entry_id, lang) do update
            set title = excluded.title, body_md = excluded.body_md`,
    [crypto.randomUUID(), entryId, lang, title.trim(), body.trim()],
  );
  repo.invalidate();
}

/**
 * Take an uploaded picture and put it where the site can serve it.
 *
 * The pipeline is the one INTENTPLEX-7 settled on — long edge 1280, webp, plus a
 * 128px rendition for lists — because the alternative is what that ticket had to
 * undo: a page of 64px thumbnails pulling four megabytes of full-size photos.
 *
 * The path is derived from a hash of the *processed* bytes, so the same picture
 * uploaded twice lands on the same row and the same URL, and any URL that exists
 * can be cached forever.
 */
export async function uploadImage(input: Buffer, originalName: string): Promise<string> {
  const isSvg = /\.svg$/i.test(originalName) || input.subarray(0, 200).includes(Buffer.from('<svg'));

  let bytes: Buffer;
  let thumb: Buffer | null = null;
  let mime: string;
  let width: number | null = null;
  let height: number | null = null;

  if (isSvg) {
    // Vector already: resizing it would only make it bigger and worse.
    bytes = input;
    mime = 'image/svg+xml';
  } else {
    const image = sharp(input, {failOn: 'error'});
    const meta = await image.metadata();
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    const resized =
      longEdge > 1280
        ? image.resize({width: meta.width! >= meta.height! ? 1280 : undefined,
                        height: meta.height! > meta.width! ? 1280 : undefined,
                        withoutEnlargement: true})
        : image;

    bytes = await resized.webp({quality: 82, effort: 6}).toBuffer();
    const out = await sharp(bytes).metadata();
    width = out.width ?? null;
    height = out.height ?? null;
    mime = 'image/webp';
    thumb = await sharp(bytes).resize({width: 128, withoutEnlargement: true})
      .webp({quality: 78, effort: 6}).toBuffer();
  }

  const sha = crypto.createHash('sha256').update(bytes).digest('hex');

  const existing = await query<{path: string}>('select path from media where sha256 = $1', [sha]);
  if (existing[0]) return existing[0].path;

  const path = `/media/uploads/${sha.slice(0, 12)}.${isSvg ? 'svg' : 'webp'}`;
  await query(
    `insert into media (id, sha256, path, mime, width, height, bytes, thumb_bytes)
          values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (path) do nothing`,
    [crypto.randomUUID(), sha, path, mime, width, height, bytes, thumb],
  );

  media.invalidate();
  return path;
}

export async function getEntryForEdit(entryId: string): Promise<EditableEntry> {
  const rows = await query<{
    id: string;
    kind: ItemKind;
    slug: string;
    date: Date;
    status: string;
    cover_path: string | null;
    lang: string | null;
    title: string | null;
    body_md: string | null;
    origin: string | null;
  }>(
    `select e.id, e.kind, e.slug, e.date, e.status, m.path as cover_path,
            r.lang, r.title, r.body_md, r.origin
       from entry e
       left join media m on m.id = e.cover_media_id
       left join rendition r on r.entry_id = e.id
      where e.id = $1
      order by r.lang`,
    [entryId],
  );
  const first = rows[0];
  if (!first) throw new Error(`entry not found: ${entryId}`);

  return {
    id: first.id,
    kind: first.kind,
    slug: first.slug,
    date: first.date.toISOString(),
    status: first.status,
    coverPath: first.cover_path,
    renditions: rows
      .filter((r) => r.lang != null)
      .map((r) => ({
        lang: r.lang!,
        title: r.title ?? '',
        body: r.body_md ?? '',
        origin: r.origin ?? 'authored',
      })),
  };
}

export async function listAllEntries(): Promise<
  Array<{
    id: string;
    kind: ItemKind;
    slug: string;
    date: string;
    status: string;
    langs: Array<string>;
  }>
> {
  const rows = await query<{
    id: string;
    kind: ItemKind;
    slug: string;
    date: Date;
    status: string;
    langs: Array<string>;
  }>(`
    select e.id, e.kind, e.slug, e.date, e.status,
           array_agg(r.lang order by r.lang) as langs
      from entry e
      left join rendition r on r.entry_id = e.id
     group by e.id
     order by e.date desc
     limit 200
  `);
  return rows.map((r) => ({...r, date: r.date.toISOString()}));
}
