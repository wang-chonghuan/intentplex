---
title: "Codex just added support for Hooks"
date: 2026-05-23T06:15:36.979Z
lang: en
source: "https://www.linkedin.com/feed/update/urn:li:activity:7463835006839238656/"
---
Codex just added support for Hooks.

A lot of people still do not know when they should use Hooks.

My view is simple: anything you find yourself repeatedly reminding Codex/Claude to do should probably be taken out of the prompt and moved into a Hook.

For example:

1. Format the code after every change
2. Run lint / tests before every commit
3. Prevent changes to certain directories or config files
4. Automatically check for type errors after code generation
5. Intercept and ask for confirmation before touching high-risk files
6. Automatically inject project context at the start of a session
7. Automatically record a change summary when a task is finished

Prompts are for expressing intent.

Hooks are for enforcing rules.
