---
title: "intentplex"
date: 2026-08-15T00:00:00.000Z
lang: en
image: "/media/intentplex.svg"
---
This site. Every string is authored in both languages at once, so a half-translated page is a type error rather than a discovery.

Built on TanStack Start with Astryx and StyleX, no Tailwind and no hand-written CSS beyond a nine-line stylesheet that declares the cascade order.

The interesting constraint is that every colour, size, radius and font resolves to a design-system token, enforced by making the token registry the only file allowed to name one.

The bilingual guarantee is a type, not a process: copy lives as {en, zh} objects, so the compiler is what notices a missing translation.
