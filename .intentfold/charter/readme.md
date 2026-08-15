# The charter

Read this before writing or editing anything in `charter/`.

## What this directory is

**The charter is where this project's intent lives** — the decisions someone made on purpose, and the
lines they do not want crossed. It is read by people who have never seen the repo and by agents that
will act on it within seconds, which is why its shape is fixed and its prose is short.

One file per dimension, each answering a different question:

| | |
|---|---|
| `product.md` | what this product is, who for, and what it must never become |
| `arch.md` | how it is built, and **why** — the decisions worth carrying forward |
| `ui.md` | the design system, tokens, and what UI work may not invent |
| `dev.md` | rules for writing code, and the commands that make a change land |
| `runbook.md` | how to run it |
| `qa.md` | what counts as evidence that something works |
| `devops.md` | how it deploys, and how you know the deploy took |

**Write only what nothing else can answer.** `package.json` knows the dependencies, `ls src/` knows
the directories, the design system knows its own tokens — and all three stay right after a change,
which a copy here does not. What belongs here is the part no command can print: the reason, the
boundary, the thing someone would otherwise re-litigate.

`readme.md` — this file — is machine-owned; cap1 refreshes it from the template. The rest is the
human's.

## Four sections, in this order

```markdown
## Contract     — what the artifact IS
## Tools        — what you ACT WITH
## Guidance     — how to DO the work
## Redlines     — what you must NOT do
```

They are not four strength levels. They are **four different things to state**, each consumed at a
different moment:

| Section | States | How it is consumed | Who enforces it |
|---|---|---|---|
| **Contract** | the product, the shape, the facts | **referenced** while authoring — built *from*, never "checked against" at the end | a static check, where the fact is mechanisable |
| **Tools** | commands, paths, ports, URLs, viewports | **looked up at the moment of acting** and run | the command's own failure |
| **Guidance** | how to approach the work | **followed while writing** | the author's judgement — deliberately no after-the-fact review |
| **Redlines** | the boundary | **looked up before the action**, table-style | a lookup, and a stop |

**All four headings appear in every file**, in this order. A section with nothing to say keeps its
heading and stays **empty** — no "none", no placeholder. An empty section states *this dimension has
nothing of that kind*; a missing one reads as "somebody forgot", and it breaks the addressing the
capabilities rely on.

## The four tests that decide where a line goes

Apply the test rather than the feeling.

**1. Contract or Guidance? — does it describe the artifact, or the act?**
*"Label is 14px/500"* → Contract. *"Use Heading 4 for a body-sized title"* → Guidance.

**2. Guidance or Redline? — can it be decided without reading the code?**
Visible from a path, a pattern, or a structural fact → **Redline**. Needs judgement or a read-through
→ **Guidance**, always. A "redline" that requires studying a diff cannot be looked up, so it gets
skipped — and a list with skippable entries stops being looked up at all.

**3. Is it Tools? — will it go stale?**
Anything with a concrete value a future change can invalidate → **Tools**, and it appears there
**once**. Elsewhere, point at it. A restated command is a stale command waiting to happen.

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

A stale command fails loudly — the binary is gone, the flag is unknown. A stale **list** fails
quietly and in the wrong direction: it calls a healthy deploy broken because three routes were
renamed, or a broken one healthy because it never asks about the route that was added. Both survive
because the check "ran".

**A derived command must prove it derived something.** Deriving moves the quiet failure rather than
removing it: derive zero, iterate zero times, exit `0` — indistinguishable from everything passing.
That is easy to reach by accident; the example needs `grep -a` because BSD `grep` in a non-UTF-8
locale calls one long line of UTF-8 binary and reports **no matches** rather than saying it skipped
the file. Assert non-empty and fail loudly.

If a target genuinely cannot be derived, the artifact should expose one — a route manifest, a
sitemap, a `--list` flag — rather than the list being written down here.

## What each section may not do

- **Contract** does not tell anyone what to do. An imperative here belongs in Guidance.
- **Tools** is never paraphrased into a ticket artifact, a plan, or another charter file. It is read
  fresh, at the moment of use, and run as written. Remembering a command from earlier in the run is
  the bug this section exists to prevent.
- **Guidance is binding** — not advice, not preference. The only difference from a redline is *who
  decides whether it was met*: the author, while writing, rather than a lookup afterwards. Nothing
  reviews a diff against it, deliberately. State it so an author can follow it, not so a reviewer can
  score it.
- **Redlines** is a closed list, looked up and never judged. Do not ask "is this a big deal?"; check
  whether the action is on the list. If it is: **route around it, or stop and hand it to the human** —
  never proceed, never approximate, never decide on the human's behalf. Every entry says which of the
  two it is: **forbidden outright**, or **not without the human's explicit approval**. An entry
  needing a read-through is a Guidance line filed in the wrong section (test 2). **This rule lives
  here and nowhere else** — it used to be restated above every `## Redlines` section in every file,
  seven copies of the same seven lines, inside the document that forbids exactly that.
- **A redline states its test, never today's answer to it.** *"Lookupable: the service has no existing
  revision"* stays true forever. *"Every deploy right now is a stop"* goes false the first time
  someone deploys, and then fires on work it was never meant to catch.

## Where a rule lives

**In the file whose dimension it belongs to** — the UI prohibition in `ui.md`, the deploy one in
`devops.md`. There is no separate redline file; adding one is a regression, because a file organised
by severity sits among files organised by subject and attracts every rule anyone thinks is important.

Prohibitions that hold on **every** project — destructive writes to external systems, irreversible
production data, spending money — are hard rules in the skill's `SKILL.md`, not repeated here.

## Editing the charter later

- Keep all four headings, in order, even when empty. A new line goes where its **test** puts it, not
  where it is nearest and not where there happens to be content already.
- **Prefer making a rule mechanical over writing it more forcefully.** Name the check in `Tools` and
  let the build fail; restating an unenforceable rule in bold only trains readers to skim.
- When a Contract fact changes, look for the `Tools` entry and the static check that encode it. A
  contract changed in prose but not in the check no longer holds.
- The charter is human-owned. An agent reports drift; it does not edit `charter/` on its own
  initiative. Being asked to make a change is what authorises it.
