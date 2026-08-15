import '@tanstack/react-start/server-only';

import {query} from '~/db/pool';

/**
 * Reading an image back out of the database.
 *
 * Two shapes share one route. `/media/x/li-abc.webp` is the full picture and
 * `/media/x/li-abc.thumb.webp` is its 128px sibling — the thumbnail is a column
 * on the same row rather than a row of its own, because it only ever exists as
 * a derivative of that exact picture and giving it an identity of its own would
 * let the two drift apart.
 */

type Found = {bytes: Buffer; mime: string};

type Row = {mime: string; bytes: Buffer; thumb_bytes: Buffer | null};

/**
 * Every image the site has ever asked for, kept in memory.
 *
 * The corpus is a few megabytes and every list page wants most of the
 * thumbnails, so pulling them out of Postgres on each request would put the
 * shared Burstable server in the hot path of every page view for bytes that
 * cannot change — the path contains their hash.
 */
const cache = new Map<string, Found | null>();

export function invalidate(): void {
  cache.clear();
}

export async function readMedia(pathname: string): Promise<Found | null> {
  const hit = cache.get(pathname);
  if (hit !== undefined) return hit;

  const wantsThumb = pathname.endsWith('.thumb.webp');
  const fullPath = wantsThumb ? pathname.replace(/\.thumb\.webp$/, '.webp') : pathname;

  const rows = await query<Row>(
    'select mime, bytes, thumb_bytes from media where path = $1',
    [fullPath],
  );

  const row = rows[0];
  let found: Found | null = null;
  if (row) {
    if (wantsThumb) {
      // A thumbnail that was never generated (an SVG, say) falls back to the
      // original rather than 404ing: the markup already points at it.
      found = row.thumb_bytes
        ? {bytes: row.thumb_bytes, mime: 'image/webp'}
        : {bytes: row.bytes, mime: row.mime};
    } else {
      found = {bytes: row.bytes, mime: row.mime};
    }
  }

  cache.set(pathname, found);
  return found;
}
