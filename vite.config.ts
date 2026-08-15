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
    tanstackStart(),
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
