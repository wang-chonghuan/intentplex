import {LOCALES, type Locale} from '~/i18n/locale';

/**
 * The corpus's shape and the pure things you can do with it.
 *
 * Everything that *reads* the corpus lives in `src/db/repo.ts` and runs only on
 * the server. This module stays free of imports that cannot cross to the browser,
 * because components call `pickRendition` and `leadOf` while rendering.
 *
 * It used to hold an `import.meta.glob` over `content/**` — the whole corpus was
 * bundled into the client and re-parsed on hydration. Content now lives in
 * Postgres and reaches the browser through the route loaders' SSR payload.
 */

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
 * The bilingual guarantee is **at least one language**, not both: an entry is
 * authored in Chinese and its English version is generated and then read by the
 * author (`ui.md`), while the imported archive predates that rule and is
 * English-only. Keying renditions by locale rather than baking `{en, zh}` into
 * the type is what makes both shapes legal.
 */
export type Item = {
  id: string;
  kind: ItemKind;
  /** ISO 8601. The only ordering there is. */
  date: string;
  image?: string;
  /**
   * The list-sized rendition of `image`. Lists show a 64px square, so serving
   * `image` there means a whole page of 1280px photos for thumbnails — on
   * /posts that was the entire corpus, four megabytes, per visit.
   */
  thumb?: string;
  renditions: Partial<Record<Locale, Rendition>>;
};

/**
 * The 128px sibling of a raster image, or the image itself.
 *
 * Only the webp uploads have one; the works entries point at SVGs, which are
 * vector and already smaller than any raster thumbnail would be.
 */
export function thumbOf(image: string): string {
  return /^\/media\/.+\.webp$/.test(image) ? image.replace(/\.webp$/, '.thumb.webp') : image;
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
