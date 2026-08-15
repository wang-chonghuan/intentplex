---
title: "As of July 18, among all OpenClaw PRs:"
date: 2026-07-21T22:22:39.732Z
lang: en
image: "/media/linkedin/li-4df266c60b10.webp"
source: "https://www.linkedin.com/feed/update/urn:li:activity:7485459255974629376/"
---
As of July 18, among all OpenClaw PRs: 
- Fix PRs account for 62% 
- Feature iteration-related PRs only account for 8.5% 
- Refactoring-related PRs account for 26% 

It looks busy on the surface, but most of the parallel tasks are just patching and fixing small issues. These tasks don’t require humans to provide much context, so the system can run a lot of them at once.

Moreover, it doesn’t look very stable. For example, PR #78595 was a SQLite migration that changed 3,135 files. It was completely rolled back just 18 minutes later (commit 694ca50e), and then followed by another 138 fix commits.

This is a classic example of AI slop. In a typical commercial company, this would be considered a P0 incident.

![](/media/linkedin/li-4df266c60b10.webp)
