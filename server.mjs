/**
 * Production server.
 *
 * `vite build` emits two halves: hashed client assets in dist/client, and
 * dist/server/server.js, whose default export is a fetch handler — a
 * `{fetch(Request) => Response}`, not something that listens on a port. This
 * file is the missing half: it serves the static assets, hands everything else
 * to that handler, and binds a port so a container has something to expose.
 *
 * Plain .mjs rather than TypeScript on purpose. It is glue with no types worth
 * writing, and giving it a build step would mean shipping a toolchain into the
 * runtime image to compile twenty lines.
 */
import {fileURLToPath} from 'node:url';
import {serve} from 'srvx/node';
import {serveStatic} from 'srvx/static';

import handler from './dist/server/server.js';

const clientDir = fileURLToPath(new URL('./dist/client', import.meta.url));

// PORT is what the container platform sets; 3000 is the port this project
// fixes for `web` in .intentfold/project.json.
const port = Number(process.env.PORT ?? 3000);

// Paths whose filename already contains a hash of the file's own bytes: Vite's
// /assets/* bundles, and the imported media, named li-<content hash>.<ext>.
// A changed file gets a changed name, so these can never go stale in a cache
// and are the textbook case for `immutable`.
const IMMUTABLE = /^\/(assets\/|media\/linkedin\/li-[a-z0-9]+\.)/;
const YEAR = 60 * 60 * 24 * 365;

/**
 * Cache headers for the static assets.
 *
 * srvx's serveStatic sends no cache-control, no etag and no last-modified, so
 * without this every visitor re-downloads every image on every page view. It
 * has no option for this — the middleware signature is the seam.
 */
const cacheHeaders = async (request, next) => {
  const response = await next();
  const {pathname} = new URL(request.url);
  if (response.ok && !response.headers.has('cache-control') && IMMUTABLE.test(pathname)) {
    response.headers.set('cache-control', `public, max-age=${YEAR}, immutable`);
  }
  return response;
};

const server = serve({
  port,
  hostname: '0.0.0.0',
  middleware: [cacheHeaders, serveStatic({dir: clientDir})],
  fetch: (request) => handler.fetch(request),
});

await server.ready();

console.log(`intentplex listening on ${server.url}`);
