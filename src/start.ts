import {createMiddleware, createStart} from '@tanstack/react-start';

import {readMedia} from '~/server/media';

/**
 * Serving `/media/*` out of Postgres.
 *
 * These used to be files under `public/` that srvx's static middleware answered
 * before the app ever saw the request. They are rows now, so the request falls
 * through to here — and it has to be answered *before* routing, because the
 * response is bytes, not a React tree.
 *
 * The public paths did not change (`/media/linkedin/li-<hash>.webp`), which is
 * what let 180 entries' image references survive the move untouched.
 */
const mediaMiddleware = createMiddleware({type: 'request'}).server(async ({next, request}) => {
  const {pathname} = new URL(request.url);
  if (!pathname.startsWith('/media/')) return next();

  const found = await readMedia(pathname);
  if (!found) return next();

  return new Response(found.bytes as unknown as BodyInit, {
    headers: {
      'content-type': found.mime,
      'content-length': String(found.bytes.byteLength),
      // The path contains a hash of the bytes, so a changed image gets a
      // changed path and this can never go stale. Same contract server.mjs
      // applies to the build's own hashed assets.
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [mediaMiddleware],
}));
