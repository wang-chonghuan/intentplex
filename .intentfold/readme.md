# .intentfold

Read this at the start of every session in this repo, and revisit it whenever you have been away from
it for a while.

*Machine-owned: `intentfold` cap1 rewrites this file from its template. It says where things live,
not what this project wants. The dimension files in `charter/` are human-owned and cap1 only creates
them when absent; `charter/readme.md` is machine-owned and refreshed by cap1. Do not hand-edit here;
edits belong in the charter or in the skill.*

## Read in this order

1. `.intentfold/project.json` — project name, main branch, deploy target, ticket backend (`plane` or
   `linear`) with its project URL, and each service's fixed main port plus ticket prefix.
2. `.intentfold/charter/` — **every dimension file in it**. This is binding intent, not background
   reading:
   - `product.md` — what this product is and who it is for
   - `dev.md` — development rules a coding agent must obey
   - `ui.md` — UI requirements, tokens, patterns
   - `arch.md` — architecture decisions and constraints
   - `runbook.md` — how to run, build and debug locally
   - `qa.md` — how this project is tested
   - `devops.md` — how it is deployed and operated

   Each of them is written in the same four sections, and **each section is used differently** —
   `charter/readme.md` states the shape and the tests, and is worth reading once:

   | Section | Use it by |
   |---|---|
   | `## Contract` | referencing it while you author — it is what the thing *is* |
   | `## Tools` | looking it up **at the moment you act** and running it as written; never from memory |
   | `## Guidance` | following it while you write; nobody reviews a diff against it |
   | `## Redlines` | looking the action up **before** doing it. Never judged. Forbidden outright, or not without the human |

   Hard prohibitions live at the end of the file they belong to. There is no separate redline file.
3. The ticket you are working on, live from the ticket backend — never from a local copy.
4. `.intentfold/tickets/<ticket-id>/` — the artifacts of the ticket in hand.

## What lives where

- Requirements live in the **ticket backend** named by `project.json` `tickets.system` — plane or
  linear, read and written only through the **n-plane** / **n-linear** skill. There is no local copy.
  Ticket text follows the backend's language: linear is English, plane is Chinese unless the human
  asks otherwise.
- Project intent lives in the human-owned charter dimension files; read them, never edit them.
  `charter/readme.md` is the machine-owned shape definition.
- Per-ticket contracts live in `tickets/<ticket-id>/`: `ticket.json`
  (mode, stage, effective finish, checkout, branch, base, and ports), optional `draft.md`, `plan.md`,
  `ac.md`, `grill.md`, `handoff.md`, `intentfold-usage.json` when configured, and `rework.md` when
  there was any. The ticket backend is the authority for whether work is live or Done. Read
  `handoff.md` and `rework.md` together — the handoff freezes at first delivery, so `rework.md` says
  what changed afterwards.
- Scratch lives in `tmp/` (project) and `tickets/<id>/tmp/` (ticket). Neither is committed.

## How work happens

Through the **intentfold** skill, which owns the workflow — this file does not repeat it. Use cap3
for autonomous end-to-end development. For an open middle, run cap3setup, develop through vibe coding
or another development skill, then run cap3handoff. Both routes produce the committed handoff that
cap4 requires before merge and closure.

No change without a ticket.
