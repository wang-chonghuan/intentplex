---
title: "Codex’s Goal mode has a serious bug that I have encountered three times"
date: 2026-07-24T12:29:15.791Z
lang: en
source: "https://www.linkedin.com/feed/update/urn:li:activity:7486397085819514880/"
---
Codex’s Goal mode has a serious bug that I have encountered three times. While executing a goal, it may unexpectedly rerun commands that were executed before the goal started.
For example, I first asked Codex to delete a document, then used Goal mode to spend two hours generating a new one. During the process, it suddenly reran the earlier deletion command and deleted the newly generated document. It then fell into an infinite loop, burning tokens while producing nothing, and potentially even damaging the system.
