---
title: "One of our agent skills depends on a Notion document as its working standard"
date: "2026-05-13T15:47:58.328Z"
lang: "en"
source: "https://www.linkedin.com/feed/update/urn:li:activity:7460355166240776192/"
---

One of our agent skills depends on a Notion document as its working standard.

In the past, we were constantly struggling with how to keep that Notion document and the skill in sync. Every time the Notion document was updated, we had to manually update the skill as well.

Today, I suddenly came up with a neat solution: every time the skill runs, it first checks the last updated timestamp of the Notion document. If it differs from the version stored locally by the skill, the skill updates itself before executing.

This cleanly solves the synchronization problem.

But why didn’t we think of this earlier?

After thinking about it, I realized it is because this solution moves up one level of abstraction. Our normal way of thinking is limited to the relationship between the skill and the artifact it produces. But a self-updating skill treats the skill itself as something that can be observed, updated and versioned.

In a sense, it is meta-cognition about meta-cognition. That is why the idea is simple, and yet not obvious.

This also opens up a future direction: skills may also evolve from every execution feedback, with major structural changes requiring human confirmation.
