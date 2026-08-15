---
title: "Shipped a small tool I originally built for myself: SkillHost"
date: "2026-05-26T18:19:18.886Z"
lang: "en"
source: "https://www.linkedin.com/feed/update/urn:li:activity:7465104295114321920/"
---

Shipped a small tool I originally built for myself: SkillHost.

Problem: our team uses Claude Code, Codex, OpenCode — every agent expects skills in a different directory. Sharing skills turned into zip files, stale forks, and constant “which version are you on?” confusion.

SkillHost fixes that with one simple idea:
use a single Git repo as the source of truth for all team skills.

It symlinks the repo into every agent automatically, so the whole team stays in sync. Update once, every agent sees the latest version instantly. Every link is tracked in a manifest, so unlinking is clean and safe.

No accounts. No backend. No platform lock-in.
Just Git + symlinks, done right.

→ https://skillhost.dev
