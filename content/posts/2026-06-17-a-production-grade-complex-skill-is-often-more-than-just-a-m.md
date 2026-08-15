---
title: "A production-grade complex skill is often more than just a main workflow description"
date: "2026-06-17T15:20:09.104Z"
lang: "en"
image: "/media/linkedin/li-2900ab4b4cb0.jpg"
source: "https://www.linkedin.com/feed/update/urn:li:activity:7473031740303761408/"
---

A production-grade complex skill is often more than just a main workflow description. It is composed of multiple capabilities that are cohesive around the same business scenario. Each capability should have its own independent directory, communicate through artifact documents as inputs and outputs, and maintain clear responsibility boundaries. However, splitting these capabilities into multiple standalone skills introduces additional complexity in maintenance, version synchronization, and context alignment.

This led me to design the cap-gate-loop pattern. Within a single skill, a complex business scenario is organized into multiple stable capabilities. Each capability has its own directory, instructions, scripts, and output boundaries. For high-risk capabilities, a matching gate with the same identifier is added to perform semantic review of the generated artifacts, preventing outputs that are formally correct but ultimately say nothing of substance. When a gate fails, it triggers a rework loop.

![](/media/linkedin/li-2900ab4b4cb0.jpg)
