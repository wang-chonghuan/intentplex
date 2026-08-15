# QA — how this project is tested

Verification here is **acceptance-criteria only**: a ticket proves its own criteria against the
running product and stops. No regression suite in the loop, by choice.
Section shape is fixed — see `readme.md`.

This file is the **method**. A ticket's assertions live in its `ac.md`. Angle-bracketed parts are this
project's to fill; the rest holds regardless of project.

*Seeded at init, then rewritten once the project had actually been verified a few times. Playwright
was never installed and has not been needed: what settles criteria here is a route sweep, a
byte-for-byte comparison, and the operator's own signed-in browser.*

## Contract

**What counts as evidence.** Not a particular tool — three properties:

1. **It reads the authoritative surface** — the running product, the deployed URL, the database.
2. **Someone can run it again** and get the same answer. A command, or a written-down sequence of
   browser steps and what each returned.
3. **It can fail.** Where a check is new or clever, *make* it go red once against something
   deliberately broken. This project has been bitten twice: a derived deploy check whose `grep`
   silently matched nothing iterated zero times and exited 0, and the same check later called a
   by-design redirect a failure. Both looked like results.

**The shapes that actually settle criteria here**, in rough order of how often they are the right one:

- **A route sweep.** Derive every route from what the app itself links to, then assert status and that
  the page rendered something real. This is what `devops.md`'s post-deploy check does, and the same
  shape run against `localhost` is how a ticket proves it did not break the site.
- **A before/after comparison.** When a change is supposed to change nothing visible, capture every
  page before, capture again after, and compare **byte for byte**. Normalise only what must differ —
  the router's serialisation payload, `modulepreload` hints, asset hashes — and say in the handoff
  exactly what was normalised, because each one is something the comparison no longer checks.
- **A query**, for data that has no UI yet, plus a look at the product when there is one. The query
  proves the row landed and proves nothing about whether the product shows it.
- **The browser**, for anything only a browser can see: hydration errors in the console, client-side
  navigation, broken images, the language switch, mobile layout.

**A chore's proof is whatever settles its criterion** — often a single command, and then it needs no
port and no browser.

Scripts, snapshots and screenshots live in `.intentfold/tickets/<ticket-id>/tmp/`, uncommitted.

## Tools

**The browser is the operator's own**, driven through the agent's browser tools. That is not a
compromise — it is the only browser that carries the signed-in sessions this project needs, both for
`/admin` and for the platform accounts `ipsl-syndicate` posts to. It is not unattended and a stranger
cannot re-run it, so **write down what was done and what came back**; that record is the evidence.

There is no test runner and no Playwright. A check that genuinely needs one is a change to this file
first — and note what the browser tools already cover before concluding that.

**Command-line checks** are plain `curl` / `node` one-liners or small `.mjs` scripts under the
ticket's `tmp/`. They are the default: cheaper than a browser, and re-runnable by anyone.

**Ports and base URL.** `runbook.md` owns how this project is started and how a ticket's port is
resolved; read it there rather than keeping a second copy that goes stale on its own schedule.

Express work uses the `web` service's explicit `main` port from the same file.

Start the product per `runbook.md` (`npm run dev -- --port <web-port>`), then build the base URL as
`http://localhost:<web-port>`. Routes are `/`, `/posts`, `/essays`, `/work`, `/media`.

**Viewports** — every UI criterion is checked at **desktop 1280×800** and **mobile 390×844**. Below
768px the nav collapses into AppShell's drawer, so a nav criterion checked only at desktop has not
been checked.

**Locale and colour mode.** Both are React state seeded from `localStorage`, so a check drives them
the way a reader would — click the `EN` / `中文` segments and the appearance menu — or seeds them
before load:

```js
await context.addInitScript(() => {
  localStorage.setItem('intentplex.locale', 'zh');   // 'en' | 'zh'
  localStorage.setItem('intentplex.mode', 'dark');   // 'system' | 'light' | 'dark'
});
```

Seeding is for reaching a state; if the criterion is *about* switching, click the control.

**Test accounts and data** — none. The site has no authentication, no forms that submit, and no
runtime data source; all content is files in the repo, read at build time. Whatever is in `content/`
and `src/content/` at build time is exactly what a criterion can be checked against.

**Non-UI observation** — the SSR HTML, since server rendering is part of what this project promises:

```bash
curl -s http://localhost:<web-port>/<route> | grep -c "<expected text>"
```

## Guidance

Binding. Followed while writing the check, judged by the author.

**Start the product first.** Confirm the service is actually responding at its URL before driving it. Knowingly running into `ERR_CONNECTION_REFUSED` produces a failure that says nothing — fix
the startup, or stop and report it. That is a stop condition, not a test result.

**A green command is not a rendered page.** `curl` proves a route answers and that its HTML contains
what it should; it says nothing about whether the page hydrated, whether an image resolved, or
whether the console is full of errors. A UI criterion gets looked at in the browser.

**Locators.** Prefer user-visible ones — role, label, placeholder, text. For varying regions use a
stable `data-testid`. Never CSS class chains or DOM structure the user cannot perceive: they break on
refactors that changed nothing. **Locate the stable container first, then assert about its contents**
— never find a dynamic response by matching its generated text.

Astryx emits stable `astryx-*` classes and `data-*` prop reflections (`data-variant`, `data-selected`,
`data-level`). Those are the design system's public selector surface and are safe to locate the
container by; the adjacent hashed StyleX classes (`x1tgivj0`…) are not, and change on any style edit.

**Dynamic and AI-generated content.** Generated text is not fixed UI copy; assert the product's
contract, not the model's wording.

- *Assert*: the response appears in the right place, is non-empty once loading finishes, loading
  states resolve, error-only states do not appear, and values have the right shape or format
  (currency, date, count, row structure).
- *Do not assert*: exact full text of generated paragraphs; exact ranked titles or wording; exact
  numbers, dates or percentages unless the dataset is pinned.
- *Streaming*: do not pass on the first non-empty token. Wait for a completion signal —
  `aria-busy="false"`, `data-streaming="false"`, a loading indicator disappearing, the send control
  returning to ready. With no such signal, wait until the text stops changing for ~2s. Set the test
  timeout above the longest expected backend wait.
- *Stale content must not satisfy the assertion.* Assert after the action that triggers the content,
  against a region you know was empty or different before — otherwise a broken feature passes on
  leftovers from a previous run.

Use web-first assertions or `expect.poll` for anything asynchronous. Never sleep a fixed duration and
hope.

**Bilingual criteria are checked in both languages.** This site's copy is the product; a criterion
about a page is not met if it only holds in English. Switch with the `EN` / `中文` control and assert
the same structure, not the same words.

**Check the console.** A hydration mismatch is reported as a console error and is invisible in a
screenshot. A UI criterion that passes with a React hydration warning in the console has not passed.

**When it fails.** Decide first whether it is an **implementation defect** or a **test problem**
(locator too broad, wait too short, wrong fixture). Fix whichever it is, then re-run **the same
command** — do not switch commands, and do not create extra diagnostic scripts or scratch files to
work around it.

## Redlines

1. **Recording a criterion as passed when its check did not run** — forbidden outright. An
   environment or external limit that stopped the run goes into `handoff.md` exactly as it happened.
2. **Mutating external or production data from a test** — forbidden outright. Reading the live site
   is fine and is what `devops.md`'s post-deploy check requires; driving it — clicking, submitting,
   signing in — is not.
