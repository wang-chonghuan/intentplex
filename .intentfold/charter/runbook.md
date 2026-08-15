# Runbook — running this project locally

Concrete, directly executable commands, repo-root-relative. No machine-specific absolute paths.
Environment-specific values are placeholders plus how to obtain them.
Section shape is fixed — see `readme.md`.

This is the file acceptance verification uses to start the product, so an out-of-date command here
silently blocks every ticket. **Read it at the moment you need it and run it as written** — never
from memory, never restated into a plan or a ticket artifact. Keep it true.

*Seeded at init. Every command below was run and its output observed on macOS with Node 24 and
npm 11.*

## Contract

**One long-running service: `web`**, and **one database it cannot start without.** A single TanStack
Start process server-renders the pages and serves the client bundle; the content it renders lives in
Postgres. Its fixed main port is **3000** (`.intentfold/project.json`). There is no API service and no
worker — "start the product" means starting `web`, with `DATABASE_URL` set.

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

`dist/server/server.js` is a fetch handler, not a listening server. `server.mjs` is the half that
binds a port and serves the static assets around it, and it is what the production container runs:

```bash
npm start
```

`PORT` moves it off 3000 — the same variable the container platform sets. Locally the environment
comes from `.env`:

```bash
PORT=<port> node --env-file=.env server.mjs
```

`npm run preview` also exists, but it is Vite's own preview server: convenient for eyeballing a
build, not how this project runs in production.

**Typecheck**

```bash
npm run typecheck
```

**Run tests**

There is no unit or integration test suite, by choice — verification is acceptance-criteria only,
against the running product. See `qa.md`.

**Environment**

`.env.example` lists every key with a note on what it is for; copy it to `.env` and fill it in.
`.env` and `.env.*` are git-ignored.

`DATABASE_URL` is the only one the public site needs — without it the process exits at startup rather
than serving empty pages. The rest gate the admin: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
`ADMIN_GITHUB_USER_ID`, `SESSION_SECRET`, and `ANTHROPIC_API_KEY` for generation.

**Content operations**

```bash
node --env-file=.env scripts/migrate.mjs          # apply the schema; import content/ + export/media/
node --env-file=.env scripts/export-to-repo.mjs   # write the database back out to the repo
node --env-file=.env scripts/sender-queue.mjs list
```

The two import/export scripts are each other's inverse — the export is the only copy of the writing
outside the database, so run it after publishing. `sender-queue.mjs` is what the local
`ipsl-syndicate` skill talks to.

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
- **`DATABASE_URL is not set`** — the process is refusing to start rather than serving a site with no
  content. Use `--env-file=.env`, or set it in the container.
- **`password authentication failed for user "intentplex-user"`** — the role or schema is missing from
  the shared server. n-easyapp's contract derives their names but its cap1 has to create them; that
  step can be skipped without anything else noticing.
- **A page renders but its images 404** — the images are rows now, not files. Check the corpus is
  actually imported (`select count(*) from media`) rather than looking in `public/`.

## Redlines

**A closed list, looked up — never judged.** Do not ask "is this a big deal?"; check whether the
action is on the list. If it is: **route around it, or stop and hand it to the human.** Never
proceed, never approximate, never decide on the human's behalf.

Every entry says which of the two it is — **forbidden outright**, or **not without the human's
explicit approval**. An entry that needs a read-through to apply is not a redline; write it as
Guidance instead (`readme.md`, test 2).
