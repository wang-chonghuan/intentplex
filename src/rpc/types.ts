import type {ItemKind} from '~/content/loader';

/**
 * The shapes that cross the wire.
 *
 * They live here rather than next to the code that implements them because the
 * import-protection rule treats `import type` as an edge like any other: a route
 * that only wanted a type signature would otherwise be reaching into
 * `src/server/`, and the build would stop it. Types belong to the boundary, and
 * this is the boundary.
 */

export type EntryDraft = {
  id?: string;
  kind: ItemKind;
  slug: string;
  date: string;
  coverPath?: string | null;
  titleZh: string;
  bodyZh: string;
  status: 'draft' | 'published';
};

export type EditableEntry = {
  id: string;
  kind: ItemKind;
  slug: string;
  date: string;
  status: string;
  coverPath: string | null;
  renditions: Array<{lang: string; title: string; body: string; origin: string}>;
};
