import '@tanstack/react-start/server-only';

import type {Item, ItemKind, Rendition} from '~/content/loader';
import {thumbOf} from '~/content/loader';
import type {Locale} from '~/i18n/locale';
import {query} from '~/db/pool';

/**
 * Reading the corpus out of Postgres, in the shape the components already take.
 *
 * The whole point of this module is that `Item` did not change when content moved
 * out of the repo: routes and components were written against it, and keeping the
 * type identical is what let the migration be proved byte-for-byte rather than
 * eyeballed.
 */

type Row = {
  id: string;
  kind: ItemKind;
  slug: string;
  date: Date;
  cover_path: string | null;
  lang: Locale;
  title: string;
  body_md: string;
  source_url: string | null;
};

const SELECT_ALL = `
  select e.id, e.kind, e.slug, e.date, m.path as cover_path,
         r.lang, r.title, r.body_md, r.source_url
    from entry e
    join rendition r on r.entry_id = e.id
    left join media m on m.id = e.cover_media_id
   where e.status = 'published'
   order by e.date desc, e.slug asc
`;

/**
 * The corpus, held in memory between writes.
 *
 * 180 entries of Markdown is a couple of megabytes and every page render needs
 * most of it, so the cache is the whole thing rather than a per-query one. It is
 * also what keeps a blip on the shared Burstable server from taking the site
 * down: the pages keep rendering from what is already here.
 *
 * `invalidate()` is called by every write path. There is one process, so there
 * is nothing to coordinate — if that ever stops being true, this is the line
 * that has to change.
 */
let cache: Promise<ReadonlyArray<Item>> | null = null;

export function invalidate(): void {
  cache = null;
}

async function load(): Promise<ReadonlyArray<Item>> {
  const rows = await query<Row>(SELECT_ALL);
  const byId = new Map<string, Item>();

  for (const row of rows) {
    const rendition: Rendition = {
      lang: row.lang,
      title: row.title,
      body: row.body_md,
      ...(row.source_url != null ? {source: row.source_url} : {}),
    };

    const existing = byId.get(row.id);
    if (existing) {
      existing.renditions[row.lang] = rendition;
      continue;
    }

    byId.set(row.id, {
      id: row.slug,
      kind: row.kind,
      date: row.date.toISOString(),
      ...(row.cover_path
        ? {image: row.cover_path, thumb: thumbOf(row.cover_path)}
        : {}),
      renditions: {[row.lang]: rendition},
    });
  }

  return [...byId.values()];
}

export function allItems(): Promise<ReadonlyArray<Item>> {
  cache ??= load().catch((error: unknown) => {
    // A failed load must not poison the cache — the next request should try
    // again rather than serve the rejection forever.
    cache = null;
    throw error;
  });
  return cache;
}

export async function itemsOfKind(kind: ItemKind): Promise<ReadonlyArray<Item>> {
  return (await allItems()).filter((i) => i.kind === kind);
}

export async function recentItems(limit: number): Promise<ReadonlyArray<Item>> {
  return (await allItems()).slice(0, limit);
}

export async function findItem(
  kind: 'article' | 'work',
  id: string,
): Promise<Item | undefined> {
  return (await allItems()).find((i) => i.kind === kind && i.id === id);
}
