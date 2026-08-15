# The charter

Read this before writing or editing anything in `charter/`.

## What this directory is

**The charter is where this project's intent lives** — the decisions someone made on purpose, and the
lines they do not want crossed. Read by people who have never seen the repo and by agents that act on
it within seconds, so: fixed shape, short prose.

One file per dimension:

| | |
|---|---|
| `product.md` | what this product is, who for, and what it must never become |
| `arch.md` | how it is built, and **why** — the decisions worth carrying forward |
| `ui.md` | the design system, tokens, and what UI work may not invent |
| `dev.md` | rules for writing code, and the commands that make a change land |
| `runbook.md` | how to run it |
| `qa.md` | what counts as evidence that something works |
| `devops.md` | how it deploys, and how you know the deploy took |

**Write only what nothing else can answer.** `package.json` knows the dependencies, `ls src/` the
directories, the design system its own tokens — and all three stay right after a change, which a copy
here does not. What belongs here is what no command can print: the reason, the boundary, the thing
someone would otherwise re-litigate.

Everything except this file is the human's, and is meant to be edited. `readme.md` is machine-owned;
cap1 refreshes it.

## Four sections, in this order

```markdown
## Contract     — what the artifact IS
## Tools        — what you ACT WITH
## Guidance     — how to DO the work
## Redlines     — what you must NOT do
```

Not four strength levels — **four different things to state**, each consumed at a different moment:

| Section | States | How it is consumed | Who enforces it |
|---|---|---|---|
| **Contract** | the product, the shape, the facts | **referenced** while authoring — built *from*, never "checked against" at the end | a static check, where the fact is mechanisable |
| **Tools** | commands, paths, ports, URLs, viewports | **looked up at the moment of acting** and run | the command's own failure |
| **Guidance** | how to approach the work | **followed while writing** | the author's judgement — deliberately no after-the-fact review |
| **Redlines** | the boundary | **looked up before the action**, table-style | a lookup, and a stop |

**All four headings appear in every file**, in this order. A section with nothing to say keeps its
heading and stays **empty** — no "none", no placeholder. Empty states *nothing of that kind here*;
missing reads as *somebody forgot*, and breaks the addressing the capabilities rely on.

## The four tests that decide where a line goes

Apply the test rather than the feeling.

**1. Contract or Guidance? — does it describe the artifact, or the act?**
*"Label is 14px/500"* → Contract. *"Use Heading 4 for a body-sized title"* → Guidance.

**2. Guidance or Redline? — can it be decided without reading the code?**
Visible from a path, a pattern, a structural fact → **Redline**. Needs judgement → **Guidance**,
always. A "redline" that requires studying a diff gets skipped, and a list with skippable entries
stops being looked up at all.

**3. Is it Tools? — will it go stale?**
Anything with a concrete value a future change can invalidate → **Tools**, **once**. Elsewhere, point
at it: a restated command is a stale command waiting to happen.

**4. Does the command enumerate, or derive?**
A `Tools` command must **derive its targets from the artifact**, never list them. The moment an entry
spells out product facts — routes, fixture ids, field names — the charter holds a second copy of
something that lives in the code, and nothing reconciles the two.

```bash
# Enumerated — rots the first time a route is renamed, and nothing notices
curl -sf https://example.com/posts https://example.com/essays

# Derived — cannot go stale, and proves it derived something
targets=$(curl -sf https://example.com/ | grep -aoE 'href="/[^"#?]*"' | sort -u)
[ -n "$targets" ] || { echo "FAIL: derived no targets"; exit 1; }
```

A stale command fails loudly. A stale **list** fails quietly and in the wrong direction: healthy
deploy called broken because a route was renamed, broken one called healthy because it never asks
about the route that was added. Both survive because the check "ran".

**A derived command must prove it derived something** — derive zero, iterate zero times, exit `0` is
indistinguishable from everything passing. Easy to hit by accident: the example needs `grep -a`
because BSD `grep` in a non-UTF-8 locale calls one long line of UTF-8 binary and reports no matches.

If a target cannot be derived, the artifact should expose one — a route manifest, a sitemap, a
`--list` flag — rather than the list living here.

## What each section may not do

- **Contract** does not tell anyone what to do. An imperative here belongs in Guidance.
- **Tools** is never paraphrased into a ticket artifact, a plan, or another charter file. It is read
  fresh, at the moment of use, and run as written. Remembering a command from earlier in the run is
  the bug this section exists to prevent.
- **Guidance is binding** — not advice. The only difference from a redline is *who decides whether it
  was met*: the author while writing, rather than a lookup afterwards. Nothing reviews a diff against
  it, deliberately. State it so an author can follow it, not so a reviewer can score it.
- **Redlines** is a closed list, looked up and never judged. Do not ask "is this a big deal?"; check
  whether the action is on the list. If it is: **route around it, or stop and hand it to the human** —
  never proceed, never approximate, never decide on the human's behalf. Every entry says which of the
  two it is: **forbidden outright**, or **not without the human's explicit approval**. An entry
  needing a read-through is a Guidance line in the wrong section (test 2). **This rule lives here and
  nowhere else**; it used to sit above every `## Redlines` section in every file.
- **A redline states its test, never today's answer to it.** *"Lookupable: the service has no existing
  revision"* stays true forever. *"Every deploy right now is a stop"* goes false the first time
  someone deploys, and then fires on work it was never meant to catch.

## Where a rule lives

**In the file whose dimension it belongs to** — the UI prohibition in `ui.md`, the deploy one in
`devops.md`. No separate redline file: a file organised by severity among files organised by subject
attracts every rule anyone thinks is important.

Prohibitions holding on **every** project — destructive external writes, irreversible production
data, spending money — are hard rules in `SKILL.md`, not repeated here.

## Editing the charter later

- Keep all four headings, in order, even when empty. A new line goes where its **test** puts it, not
  where it is nearest and not where there happens to be content already.
- **Prefer making a rule mechanical over writing it more forcefully.** Name the check in `Tools` and
  let the build fail; an unenforceable rule in bold only trains readers to skim.
- When a Contract fact changes, look for the `Tools` entry and the static check that encode it. A
  contract changed in prose but not in the check no longer holds.
- The charter is human-owned. An agent reports drift; it does not edit `charter/` on its own
  initiative. Being asked to make a change is what authorises it.
