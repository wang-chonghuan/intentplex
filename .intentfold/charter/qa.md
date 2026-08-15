# QA — how this project is tested

Verification here is **acceptance-criteria only**: a ticket proves its own criteria against the
running product and stops. No regression suite in the loop, by choice.
Section shape is fixed — see `format.md`.

This file is the **method**. A ticket's assertions live in its `ac.md`. Angle-bracketed parts are this
project's to fill; the rest holds regardless of project.

*Seeded at init. The project-specific parts — run command, viewports, the bilingual and colour-mode
notes — are inferred from the repo; Playwright is not installed yet, so the first ticket that needs
it runs the install step below.*

## Contract

**What counts as evidence.** A **ticket-scoped script run from the command line** — it encodes
assertions someone can re-run. `playwright-cli open <url>` is fine for poking at a page while
debugging; it is never the evidence that a criterion passed.

Scripts and screenshots live in `.intentfold/tickets/<ticket-id>/tmp/`, uncommitted. One script
covering all of a ticket's criteria is the normal case, with a screenshot per criterion.

**What a criterion check asserts.** The page or flow is reachable · the fixed controls are present ·
the expected region renders · the action is accepted · the result appears in the right place ·
loading resolves · no error state · the value has the right shape.

**A chore's proof is whatever settles its criterion** — usually the observation command the ticket
names, and then it needs no port and no browser. But a criterion that is only visible in the running
product is checked in the running product, chore or not: a query proves a row landed and proves
nothing about whether the product shows it.

## Tools

**Playwright** — after first adding it, or after upgrading: `npx playwright install chromium`.

Checks are standalone `.mjs` scripts driving `chromium.launch()`, run as:

```bash
node .intentfold/tickets/<ticket-id>/tmp/ac.mjs
```

There is no `playwright.config.ts` and no `.spec.ts` suite — this project has no test runner, so a
check that needs one is a change to this file first.

**Ports and base URL.** Ticket ports come from `project.json`:

```bash
python3 <intentfold-skill>/scripts/ports.py .intentfold/project.json ticket <ticket-id>
```

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

**Start the product first.** Confirm the service is actually responding at its URL before invoking
Playwright. Knowingly running into `ERR_CONNECTION_REFUSED` produces a failure that says nothing — fix
the startup, or stop and report it. That is a stop condition, not a test result.

**Headed, not headless,** for formal UI verification — headless hides real rendering failures. Fall
back to headless only on a non-GUI environment, and say so in the handoff rather than claiming headed
verification passed.

**Locators.** Prefer user-visible ones — role, label, placeholder, visible text. For regions whose
content varies, use a stable `data-testid` or `data-*` container attribute. Never locate by CSS class
chains or DOM structure the user cannot perceive; they break on refactors that changed nothing a user
would notice. **Locate the stable container first, then assert about what is inside it** — never find
a dynamic response by matching its generated text.

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

**A closed list, looked up — never judged.** Do not ask "is this a big deal?"; check whether the
action is on the list. If it is: **route around it, or stop and hand it to the human.** Never
proceed, never approximate, never decide on the human's behalf.

Every entry says which of the two it is — **forbidden outright**, or **not without the human's
explicit approval**. An entry that needs a read-through to apply is not a redline; write it as
Guidance instead (`format.md`, test 2).

1. **Recording a criterion as passed when its check did not run** — forbidden outright. An
   environment or external limit that stopped the run goes into `handoff.md` exactly as it happened.
2. **Mutating external or production data from a test** — forbidden outright. Reading the live site
   is fine and is what `devops.md`'s post-deploy check requires; driving it — clicking, submitting,
   signing in — is not.
