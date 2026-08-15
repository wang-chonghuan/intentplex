import {createServerFn} from '@tanstack/react-start';
import {notFound} from '@tanstack/react-router';

import type {Item, ItemKind} from '~/content/loader';

/**
 * The corpus, as the routes see it.
 *
 * A route `loader` runs on the server for the first paint and **again in the
 * browser** on client-side navigation, so it cannot touch the database directly.
 * These wrappers are the boundary: the browser calls them over the wire, the
 * server calls them in process, and `src/db/` never reaches a bundle — which is
 * why the repo is imported *inside* each handler. A top-level import is an edge
 * in the module graph even when the code that used it is stripped, and following
 * that edge pulled `pg` into the browser build.
 */

const KINDS: ReadonlyArray<ItemKind> = ['post', 'article', 'work'];

function asKind(value: unknown): ItemKind {
  if (typeof value === 'string' && (KINDS as ReadonlyArray<string>).includes(value)) {
    return value as ItemKind;
  }
  throw new Error(`unknown kind: ${String(value)}`);
}

export const listItems = createServerFn({method: 'GET'})
  .validator(asKind)
  .handler(async ({data}): Promise<ReadonlyArray<Item>> => {
    const repo = await import('~/db/repo');
    return repo.itemsOfKind(data);
  });

export const listRecent = createServerFn({method: 'GET'})
  .validator((limit: unknown) => {
    if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1) {
      throw new Error(`bad limit: ${String(limit)}`);
    }
    return limit;
  })
  .handler(async ({data}): Promise<ReadonlyArray<Item>> => {
    const repo = await import('~/db/repo');
    return repo.recentItems(data);
  });

export const getDetail = createServerFn({method: 'GET'})
  .validator((input: unknown): {kind: 'article' | 'work'; slug: string} => {
    const {kind, slug} = input as {kind?: unknown; slug?: unknown};
    if ((kind !== 'article' && kind !== 'work') || typeof slug !== 'string') {
      throw new Error('getDetail needs {kind: "article" | "work", slug: string}');
    }
    return {kind, slug};
  })
  .handler(async ({data}): Promise<Item> => {
    const repo = await import('~/db/repo');
    const item = await repo.findItem(data.kind, data.slug);
    // Thrown here rather than in the route so the 404 is decided by the same
    // thing that knows whether the row exists.
    if (item == null) throw notFound();
    return item;
  });
