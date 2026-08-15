---
title: "Can Agents Safely Rewrite Themselves?"
date: 2026-08-15T12:00:00.000Z
lang: en
image: "/media/linkedin/li-759f2b2fa6f2.webp"
source: "https://www.linkedin.com/pulse/can-agents-safely-rewrite-themselves-chonghuan-wang-sqxdf"
---
DeepSeek just open-sourced its Harness and, together with Peking University, released a paper that looks past the model itself and tackles a foundational problem for the next generation of agents:

**How can an agent continuously modify its own Harness without permanently breaking itself?**

The paper, *A Programming Paradigm for Spatiotemporal Composability*, introduces a dynamic component theory built around Cordis. Its two core ideas are:

**Temporal Composability**

Every side effect a component produces — resource registration, state changes, and other mutations — must come with a corresponding inverse. When the component is unloaded, the runtime automatically tracks and reverses those effects. The goal is not a hand-written cleanup function, but structural recoverability: side effects become reversible by design.

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQF24gabk_4sRQ/article-inline_image-shrink_1000_1488/B4DaAE96nSJgAQ-/0/1786789735385?e=1788393600&v=beta&t=LdimnoVOLVp7o6MEOn3KGbpqa1_I6rWX14rFey4j6lM)

**Spatial Composability**

Components declare their dependencies. When a provider appears, disappears, or is replaced, the system recalculates the dependency graph and reactivates only the components that are actually affected.

The authors formalize the full component lifecycle, dependency ordering, failure recovery, and transactional hot-module replacement, then prove key properties of the system. One especially important result is **confluence**: under independence and acyclicity conditions, a system that has gone through many rounds of loading, unloading, and replacement ends up in a state equivalent to one assembled directly from the final configuration. Intermediate evolution leaves no lasting trace.

This matters for self-evolving agent harnesses. Future agents will generate, deploy, and swap their own tools, memory systems, sandboxes, and orchestration components while continuing to run. If every faulty change forces a full process restart — or worse, corrupts the recovery mechanism itself — continuous self-improvement becomes impractical.

Cordis addresses exactly this infrastructure challenge: allowing an agent to modify itself while keeping those modifications reversible, dependencies re-connectable, and failures locally isolatable.

The paper uses Koishi (a chatbot framework with 4,000+ community plugins) as a real-world case study for dynamic unloading, dependency re-resolution, and HMR. The authors note that current Koishi runs on Cordis v3, while the paper describes a redesigned v4, so we should not yet conclude that DeepSeek Harness is already built on the full model presented here.

Still, the research direction is clear. Once agents can run for long periods, rewrite their own infrastructure, and evolve continuously, the competitive edge may shift. It will no longer be only about whether a model can generate better code — but about who first solves the more fundamental problem: **making it safe for AI to rewrite itself**.

Under the hood, the core algebraic intuition draws from monoids of transformations equipped with inverses — closer in spirit to group theory and abstract algebra. The broader framework builds on classical effect and coeffect systems, which themselves rest on deep category-theoretic foundations. The paper uses these algebraic structures to formalize reversible side effects and reactive dependencies, then proves the confluence of dynamic evolution, all in service of self-evolving agent harnesses.
