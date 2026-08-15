# Runbook — running this project locally

Concrete, directly executable commands, repo-root-relative. No machine-specific absolute paths.
Environment-specific values are placeholders plus how to obtain them.
Section shape is fixed — see `format.md`.

This is the file acceptance verification uses to start the product, so an out-of-date command here
silently blocks every ticket. **Read it at the moment you need it and run it as written** — never
from memory, never restated into a plan or a ticket artifact. Keep it true.

*Seeded at init. Every command below was run and its output observed on macOS with Node 24 and
npm 11.*

## Contract

**One long-running service: `web`.** A single TanStack Start process that server-renders the pages
and serves the client bundle. Its fixed main port is **3000** (`.intentfold/project.json`). There is
no API service, no database and no worker — "start the product" means starting `web` and nothing else.

## Tools

**Install**

```bash
npm install
```

**Run the dev server**

Every long-running service starts on its fixed main port from `.intentfold/project.json`:

```bash
npm run dev
```

The port is set by `server.port` in `vite.config.ts`, and Vite's `--port` flag overrides it. For a
ticket worktree, resolve the port with:

```bash
python3 <intentfold-skill>/scripts/ports.py .intentfold/project.json ticket <ticket-id>
```

The returned `web` port is passed as a flag; there is no env var for it:

```bash
npm run dev -- --port <web-port>
```

First run in a fresh checkout also generates `src/routeTree.gen.ts`, which is git-ignored — a clean
clone has no route tree until `npm run dev` or `npm run build` has run once.

**Build**

```bash
npm run build
```

Output goes to `dist/client/` and `dist/server/`.

**Serve the production build**

`dist/server/server.js` is a fetch handler, not a listening server, so it cannot be run with `node`
directly. Serve the build with:

```bash
npm run preview
```

Add `-- --port <port>` to move it off Vite's preview default.

**Typecheck**

```bash
npm run typecheck
```

**Run tests**

There is no unit or integration test suite, by choice — verification is acceptance-criteria only,
against the running product. See `qa.md`.

**Environment**

No env file is required. The app reads no secrets and calls no external service at runtime; the only
network dependency is the Google Fonts stylesheet, which degrades to system fonts if unreachable.
`.env` and `.env.*` are git-ignored should one ever be needed.

## Guidance

**Troubleshooting** — a startup failure is a stop and a report, never an acceptance result.

- **`Cannot find module './routeTree.gen'`** — the route tree has not been generated. Run
  `npm run dev` or `npm run build` once.
- **`Could not resolve the path to the imported file` pointing at a `~/…stylex` import** — the StyleX
  compiler resolves those imports itself and does not read `tsconfig.json`. The alias is configured in
  three places; see `arch.md`.
- **Unstyled page, or dark mode not switching** — check that all three vendor stylesheets are still
  imported in `src/styles/app.css` in order, and that the browser targets in `vite.config.ts` are
  intact. See `ui.md`.
- **Port already in use** — a dev server from an earlier run is still up. Find it with
  `lsof -ti tcp:<port>` and stop that process; a dev server never outlives the run that started it.

## Redlines

**A closed list, looked up — never judged.** Do not ask "is this a big deal?"; check whether the
action is on the list. If it is: **route around it, or stop and hand it to the human.** Never
proceed, never approximate, never decide on the human's behalf.

Every entry says which of the two it is — **forbidden outright**, or **not without the human's
explicit approval**. An entry that needs a read-through to apply is not a redline; write it as
Guidance instead (`format.md`, test 2).
