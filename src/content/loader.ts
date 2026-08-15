import {LOCALES, type Locale} from '~/i18n/locale';
import {parseContentFile} from '~/content/validate';

export type ItemKind = 'post' | 'article' | 'work';

/** One language's version of an entry. */
export type Rendition = {
  lang: Locale;
  title: string;
  /** Markdown. The whole body — the list shows a lead derived from it. */
  body: string;
  /** Where this came from, when it was written somewhere else first. */
  source?: string;
};

/**
 * One entry, in whichever languages exist for it.
 *
 * The bilingual guarantee is **at least one language**, not both: content
 * imported from elsewhere arrives in the language it was written in, and a
 * translation is added later by dropping a second file beside the first.
 * Nothing else has to change when that happens — that is the point of keying
 * renditions by locale rather than baking `{en, zh}` into the type.
 */
export type Item = {
  id: string;
  kind: ItemKind;
  /** ISO 8601. The only ordering there is. */
  date: string;
  image?: string;
  renditions: Partial<Record<Locale, Rendition>>;
};

/**
 * Every markdown file in content/, read at build time.
 *
 * `eager` because this is a static site: the whole corpus is known when the
 * bundle is built, and a lazy import would make every list render async for
 * no benefit.
 */
const FILES = import.meta.glob('/content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/**
 * Build the corpus. Field rules live in `validate.ts` because the Vite plugin
 * in vite.config.ts applies the same ones at build time — `vite build` bundles
 * this module without running it, so a broken file has to be caught there.
 */
function parseAll(): readonly Item[] {
  const byId = new Map<string, Item>();

  for (const [path, raw] of Object.entries(FILES)) {
    const f = parseContentFile(path, raw);
    const id = `${f.kind}:${f.slug}`;
    const rendition: Rendition = {
      lang: f.lang,
      title: f.title,
      body: f.body,
      ...(f.source != null ? {source: f.source} : {}),
    };

    const existing = byId.get(id);
    if (existing) {
      if (existing.renditions[f.lang]) {
        throw new Error(`content: ${path} — duplicate ${f.lang} rendition for ${id}`);
      }
      existing.renditions[f.lang] = rendition;
      if (!existing.image && f.image) existing.image = f.image;
    } else {
      byId.set(id, {
        id: f.slug,
        kind: f.kind,
        date: f.date,
        ...(f.image ? {image: f.image} : {}),
        renditions: {[f.lang]: rendition},
      });
    }
  }

  return [...byId.values()].sort((a, b) => b.date.localeCompare(a.date));
}

const ALL = parseAll();

export const posts = ALL.filter((i) => i.kind === 'post');
export const articles = ALL.filter((i) => i.kind === 'article');
export const works = ALL.filter((i) => i.kind === 'work');

/** The home feed: everything, newest first. */
export function recentItems(limit: number): readonly Item[] {
  return ALL.slice(0, limit);
}

export function findItem(kind: 'article' | 'work', id: string): Item | undefined {
  return ALL.find((i) => i.kind === kind && i.id === id);
}

export function itemHref(item: Item): string | null {
  if (item.kind === 'article') return `/articles/${item.id}`;
  if (item.kind === 'work') return `/works/${item.id}`;
  return null;
}

/**
 * The rendition to show, and whether it is the one asked for.
 *
 * `isFallback` is what the UI labels: a reader on the Chinese site seeing an
 * English post should be told that is what they are looking at, not left to
 * conclude the site is half-built.
 */
export function pickRendition(
  item: Item,
  locale: Locale,
): {rendition: Rendition; isFallback: boolean} {
  const wanted = item.renditions[locale];
  if (wanted) return {rendition: wanted, isFallback: false};
  const first = LOCALES.map((l) => item.renditions[l]).find(Boolean);
  if (!first) throw new Error(`content: ${item.kind}:${item.id} has no renditions`);
  return {rendition: first, isFallback: true};
}

/**
 * First paragraph, flattened — what a list row shows under the title.
 *
 * The heading test is `#` followed by whitespace, not a bare `#`: these posts
 * open with hashtags like `#SampleBeatsReport`, which is not a Markdown heading
 * (CommonMark requires the space) and is very often the only line there is.
 * Treating it as one skipped the whole body and rendered an empty row.
 */
export function leadOf(rendition: Rendition, max = 240): string {
  const flatten = (s: string) =>
    s
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*`>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const paragraphs = rendition.body.split(/\n{2,}/).map((p) => p.trim());
  const isHeading = (p: string) => /^#{1,6}\s/.test(p);
  const isImage = (p: string) => p.startsWith('![');

  const chosen =
    paragraphs.find((p) => p && !isHeading(p) && !isImage(p)) ??
    // Everything was a heading or an image: fall back to the whole body rather
    // than an empty row. A row with no text is worse than a slightly odd one.
    paragraphs.find((p) => p && !isImage(p)) ??
    '';

  const flat = flatten(chosen);
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}
