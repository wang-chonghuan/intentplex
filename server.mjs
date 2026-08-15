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

const server = serve({
  port,
  hostname: '0.0.0.0',
  middleware: [serveStatic({dir: clientDir})],
  fetch: (request) => handler.fetch(request),
});

await server.ready();

console.log(`intentplex listening on ${server.url}`);
