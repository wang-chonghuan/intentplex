# Product

Human-authored. The machine reads this as binding intent and never edits it.
Section shape is fixed — see `format.md`.

## Contract

**What this product is**

<One paragraph a newcomer could read and know what they are building. Not a feature list.>

**Who it is for**

<The actual users, and what they are trying to get done.>

**What good looks like**

<How you would know this product is succeeding. The standard a ticket is ultimately judged against.>

**What this product is not**

<Deliberate non-goals. The most useful part of this file — it is what stops scope from drifting
outward one reasonable-sounding ticket at a time. State them as facts about the product; anything
phrased as "never do X" is a redline and belongs below, where it will actually be looked up.>

## Tools

<Usually empty in this file — product intent has no commands. Leave the heading and nothing under it.>

## Guidance

<Usually empty in this file. If you find yourself writing "how to build it" here, it belongs in
`dev.md`, `arch.md` or `ui.md`.>

## Redlines

1. **<What this product must never become>** — forbidden outright. <The removed feature that must not
   come back, the shape it must not take. Keep it detectable: name the route, the file, the
   dependency, so crossing it is visible without judgement.>
2. **Editing this file** — forbidden outright. Product intent is the human's exclusively.
