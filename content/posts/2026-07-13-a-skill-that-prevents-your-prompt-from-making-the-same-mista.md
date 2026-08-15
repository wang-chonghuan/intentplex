---
title: "A skill that prevents your prompt from making the same mistake 200 times"
date: 2026-07-13T07:09:47.050Z
lang: en
image: "/media/linkedin/li-18b49bce6ea1.webp"
source: "https://www.linkedin.com/feed/update/urn:li:activity:7482330419770654721/"
---
A skill that prevents your prompt from making the same mistake 200 times

Yesterday, I asked an agent to process more than 200 items. The first output was wrong, but it kept using the same prompt and repeated the same mistake across the entire batch.

So I designed an automated closed-loop batch skill:

Process a small batch → validate the results → fix the outputs → automatically update the prompt → retry → continue with the next batch.

Once several batches pass consistently, it switches to sampling-based validation.

The goal is simple: do not discover 200 errors at the end. Make the agent learn automatically from the first batch.

![](/media/linkedin/li-18b49bce6ea1.webp)
