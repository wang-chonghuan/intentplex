import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {tanstackStart} from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Astryx tokens are authored with light-dark(), which is Baseline 2024. The
// StyleX plugin runs its own lightningcss pass whose default browserslist
// targets would lower light-dark() into broken polyfill variables, so the
// targets are pinned to the first releases that ship it natively.
const lightningcssTargets = {
  chrome: 123 << 16,
  firefox: 120 << 16,
  safari: (17 << 16) | (5 << 8),
};

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {'~': path.resolve(rootDir, 'src')},
  },
  build: {
    // Same reason as lightningcssTargets, for Vite's own CSS pipeline: the
    // Astryx reset and the stone theme.css are full of light-dark(), and the
    // default target lowers it into --lightningcss-* polyfill variables.
    cssTarget: ['chrome123', 'firefox120', 'safari17.5'],
  },
  plugins: [
    tanstackStart({
      // Three directories, and the line between them is what this rule draws:
      //   src/rpc/     — server *functions*. The client calls them over the wire,
      //                  so it must be able to import them.
      //   src/server/  — what those functions actually do: the OAuth secret,
      //                  sharp, the generation prompt. Never in a browser bundle.
      //   src/db/      — the pool and the queries. Same.
      //
      // "Reachable" is not the same as "used": a top-level import is an edge in
      // the module graph even when the code that used it was stripped, and
      // following that edge is what dragged pg and sharp's native bindings into
      // the client build — 36 externalization warnings and a segfault. That is
      // why src/rpc reaches src/server only through `await import()` inside a
      // handler, and why `behavior: 'error'` is set: the next time someone adds
      // a top-level import there, the build says so and names the file.
      importProtection: {
        enabled: true,
        behavior: 'error',
        client: {files: ['src/db/**', 'src/server/**']},
        // src/rpc is the one place allowed to reach across, because that is what
        // it is for: its handler bodies are stripped from the client build, so
        // the edge exists only in the server bundle. Every other importer is
        // still stopped.
        ignoreImporters: ['src/rpc/**'],
      },
    }),
    // StyleX must be registered before the React plugin so the compiler sees
    // untransformed stylex.create() calls.
    stylex.vite({
      useCSSLayers: true,
      lightningcssOptions: {targets: lightningcssTargets},
      // The StyleX compiler resolves *.stylex.ts imports itself, so it needs
      // the same "~" alias Vite and TypeScript use.
      unstable_moduleResolution: {type: 'commonJS', rootDir},
      aliases: {'~/*': [path.join(rootDir, 'src', '*')]},
    }),
    viteReact(),
  ],
});
