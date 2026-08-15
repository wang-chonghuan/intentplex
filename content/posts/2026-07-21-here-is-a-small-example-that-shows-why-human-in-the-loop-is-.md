---
title: "Here is a small example that shows why human-in-the-loop is still necessary in agent codin"
date: "2026-07-21T21:12:01.880Z"
lang: "en"
source: "https://www.linkedin.com/feed/update/urn:li:activity:7485441481135222784/"
---

Here is a small example that shows why human-in-the-loop is still necessary in agent coding.
I built a small Language-learning app. In the dialogue section, all speech is generated automatically with TTS. During testing, however, I found that Claude Code with Fable 5 had assigned a female voice to a male character and a male voice to a female character. It had correctly realised that the two speakers should sound different, which was already a non-trivial detail, but it still failed to match the voices to the gender implied by the characters’ names.
This illustrates a broader limitation. AI can still miss very small but important details, and often cannot even identify them during the grilling stage and ask the human for clarification.
You might argue that I should simply use a popular specialist TTS skill. But integrating and operating another specialised skill would require more time and effort than the issue justifies.
At this stage, AI still needs a human at the end of the loop to review the final output.
So before boasting that you can run dozens of development tasks in parallel on one project, first ask yourself whether you have carried out a thorough human acceptance review as much as your paralleled tasks.
