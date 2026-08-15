---
title: "If a harness system has both ADR (Architecture Decision Records) and a ticket tracking sys"
date: "2026-08-07T07:28:48.981Z"
lang: "en"
source: "https://www.linkedin.com/feed/update/urn:li:activity:7491394906016452610/"
---

If a harness system has both ADR (Architecture Decision Records) and a ticket tracking system, it suggests that the system designer has failed to establish a true SSOT (Single Source of Truth).

ADR can be generated directly from the ticketing system. Maintaining two parallel records of the same class of information is not a convenience; it creates the possibility of divergence and leaves two competing sources of truth. Over time, this inconsistency is highly likely to introduce development errors, especially in AI coding workflows.
