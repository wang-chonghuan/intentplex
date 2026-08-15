// front-matter, not gray-matter: gray-matter reaches for Node's Buffer, which
// does not exist in the browser. This module runs on both sides — the server
// renders with it and the client re-parses on hydration — so a Node-only
// dependency here throws during hydration and silently kills every interactive
// element on the page while SSR still looks perfect.
import fm from 'front-matter';

export const LOCALE_CODES = ['en', 'zh'] as const;
export const KIND_BY_DIR: Record<string, 'post' | 'article' | 'work'> = {
  posts: 'post',
  articles: 'article',
  works: 'work',
};

/** `/content/articles/2026-07-31-where-did-the-secondary-colour-go.zh.md` */
export const PATH_RE =
  /^\/content\/(?<dir>[^/]+)\/(?<date>\d{4}-\d{2}-\d{2})-(?<slug>[^/]+?)(?:\.(?<lang>[a-z]{2}))?\.md$/;

type LocaleCode = (typeof LOCALE_CODES)[number];

function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === 'string' && (LOCALE_CODES as readonly string[]).includes(v);
}

export type ParsedFile = {
  dir: string;
  slug: string;
  kind: 'post' | 'article' | 'work';
  lang: LocaleCode;
  title: string;
  date: string;
  image?: string;
  source?: string;
  body: string;
};

/**
 * The single definition of a valid content file.
 *
 * Shared on purpose: the runtime loader calls it to build the corpus, and a
 * Vite plugin calls it during `buildStart` so a broken file fails the build by
 * name. `vite build` only bundles — it never executes the loader — so without
 * the build-time caller a missing `date` would not surface until the first
 * request in production.
 */
export function parseContentFile(path: string, raw: string): ParsedFile {
  const fail = (problem: string): never => {
    throw new Error(`content: ${path} — ${problem}`);
  };

  const m = PATH_RE.exec(path);
  if (!m?.groups) fail('filename must be <YYYY-MM-DD>-<slug>[.<lang>].md');
  const {dir, slug} = m!.groups!;

  const kind = KIND_BY_DIR[dir];
  if (!kind) fail(`unknown collection "${dir}" (expected posts, articles or works)`);

  const {attributes, body} = fm<Record<string, unknown>>(raw);
  const data = attributes;
  const content = body;

  const lang: unknown = m!.groups!.lang ?? data.lang;
  if (!isLocaleCode(lang)) {
    fail(`missing or invalid frontmatter: lang (expected ${LOCALE_CODES.join(' or ')}, got ${String(lang)})`);
    throw new Error('unreachable');
  }
  if (typeof data.title !== 'string' || data.title.trim() === '') {
    fail('missing required frontmatter: title');
  }
  if (data.date == null) fail('missing required frontmatter: date');

  const date = data.date instanceof Date ? data.date.toISOString() : String(data.date);
  if (Number.isNaN(Date.parse(date))) fail(`date is not parseable: ${String(data.date)}`);
  if (content.trim() === '') fail('body is empty');

  return {
    dir,
    slug,
    kind,
    lang,
    title: (data.title as string).trim(),
    date,
    ...(typeof data.image === 'string' ? {image: data.image} : {}),
    ...(typeof data.source === 'string' ? {source: data.source} : {}),
    body: content.trim(),
  };
}
