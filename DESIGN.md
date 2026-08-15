# DESIGN.md — the design system this site obeys

This site renders through **Astryx** (`@astryxdesign/core@0.4.1`) with the
**Stone** theme (`@astryxdesign/theme-stone@0.4.1`), styled with **StyleX**.
There is no Tailwind and no hand-written CSS beyond one nine-line stylesheet
that declares the cascade order and imports the vendor files.

The rule this document exists to state, once, plainly:

> **The design system is not a starting point. It is the whole surface.**
> Every colour, size, radius, shadow, duration and font in this repository comes
> from a stone-theme token. Nothing in `src/` may introduce a new one.

Everything below is either a fact about the theme (so you can look values up
without reading `node_modules`) or a rule about how this codebase is allowed to
touch it.

---

## 1. The three layers, and who owns what

| Layer | Owner | This repo may |
| --- | --- | --- |
| **Tokens** — `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--duration-*`, `--font-*` | The stone theme | read them, never define or redefine them |
| **Components** — `Button`, `Card`, `TopNav`, `List`… (156 of them) | Astryx | compose them, pass their props, never restyle their internals |
| **Composition** — which component, in what order, at what width | This repo | everything |

The single legal channel from layer 3 into layers 1–2 is the `xstyle` prop,
which every Astryx component accepts and which takes a `stylex.create()` value.

---

## 2. The cascade

Declared in [`src/styles/app.css`](src/styles/app.css):

```
@layer reset, astryx-base, astryx-theme,
       priority1 … priority10;   /* StyleX, via useCSSLayers */
```

- `reset` — `@astryxdesign/core/reset.css`: element reset plus the stone theme's
  prose styles, scoped with `@scope ([data-astryx-theme="stone"])`.
- `astryx-base` — `@astryxdesign/core/astryx.css`: the pre-compiled component
  styles.
- `astryx-theme` — `@astryxdesign/theme-stone/theme.css`: stone's token values
  and its component overrides. It must beat `astryx-base`, which is why it is
  imported third.
- `priority*` — this repo's StyleX output. Last, so an `xstyle` layout tweak
  lands on top of a themed component instead of losing to it.

The theme is consumed through its **`/built` entry** (`@astryxdesign/theme-stone/built`)
paired with `theme.css`, not the runtime-injection entry. Astryx's own guidance:
runtime themes inject component overrides at hydration, which flashes under SSR.
Built themes ship the overrides in static CSS. This site server-renders, so
`/built` is the only correct choice.

`light-dark()` is preserved as native CSS, not lowered to a polyfill. Two build
settings enforce this — `build.cssTarget` for Vite's own CSS pipeline and
`lightningcssOptions.targets` for the StyleX plugin's internal one (both in
[`vite.config.ts`](vite.config.ts)). Lowering it produces
`--lightningcss-light` / `--lightningcss-dark` shadow variables and is the
failure the Astryx setup docs warn about.

---

## 3. Reaching tokens from StyleX

Astryx exports `spacingVars`, `colorVars` and friends for StyleX, but those are
`defineVars` objects that require compiling Astryx from source. This site uses
the pre-built distribution, so it declares the same references as compile-time
constants in [`src/styles/tokens.stylex.ts`](src/styles/tokens.stylex.ts):

```ts
export const color = stylex.defineConsts({
  textPrimary: 'var(--color-text-primary)',
  // …
});
```

`defineConsts` declares no new custom property. It inlines a reference to a
variable the theme already owns, which is what makes the rule enforceable:

- ✅ `maxWidth: frame.pageWidth`, `paddingInline: space.s4`, `borderBlockEndColor: color.border`
- ❌ `color: '#25252a'`, `padding: '16px'`, `borderRadius: '8px'`
- ❌ adding a raw value to `tokens.stylex.ts` — that is the one edit that breaks
  this document

The only non-token values the file carries are two layout budgets,
`frame.proseWidth` (`68ch`) and `frame.pageWidth` (`1080px`). They are
measurements of a reading column, not visual style, and Astryx has no token for
them.

---

## 4. Stone tokens

### 4.1 Colour

Neutrals are hue 291, chroma 3. The theme is deliberately near-achromatic: its
accent is not a brand colour but the darkest neutral, so emphasis reads as
contrast rather than hue.

| Token | Light | Dark |
| --- | --- | --- |
| `--color-accent` | `#25252a` | `#f3f3f5` |
| `--color-on-accent` | `#ffffff` | `#25252a` |
| `--color-background-body` | `#f3f3f5` | `#111015` |
| `--color-background-surface` | `#ffffff` | `#1b1b1f` |
| `--color-background-card` | `#ffffff` | `#242325` |
| `--color-background-muted` | `#e2e2e8` | `#3b3b3f` |
| `--color-text-primary` | `#25252a` | `#f3f3f5` |
| `--color-text-secondary` | `#83838a` | `#9d9da3` |
| `--color-text-disabled` | `#d7d7da` | `#5e5e61` |
| `--color-border` | `#e2e2e8` | `#f3f3f5` @ 10% |
| `--color-border-emphasized` | `#83838a` | `#5e5e61` |
| `--color-overlay-hover` | `#25252a` @ 5% | `#f3f3f5` @ 5% |
| `--color-overlay-pressed` | `#25252a` @ 10% | `#f3f3f5` @ 10% |
| `--color-skeleton` | `#d4d4da` | `#5e5e64` |

Status colours are muted to the same handmade register — stone does not use
saturated alert colours:

| Token | Light | Dark |
| --- | --- | --- |
| `--color-success` | `#374c36` | `#b4cdb2` |
| `--color-warning` | `#524622` | `#d7c59c` |
| `--color-error` | `#58413e` | `#dcc0bc` |

Ten categorical hues (blue, cyan, gray, green, orange, pink, purple, red, teal,
yellow) each carry `--color-background-*`, `--color-border-*`, `--color-icon-*`
and `--color-text-*`. Light mode is a T90 pastel surface with T30 text; dark
mode is a T35 surface with T90 text — the same hex, mirrored. Raw tonal ramps
(every hue at every 5-step tone) are exported as `stonePalettes` from
`@astryxdesign/theme-stone`.

**Rules.** Semantic tokens carry meaning; categorical hues carry
classification. Use `Badge variant="success|warning|error"` only for a state
that needs the reader to act — Astryx's own guidance is that a badge on every
healthy row is noise. Use the hue variants for grouping. Never set a colour
from `stonePalettes` directly in a component; go through the token.

### 4.2 Spacing — 4px base

`--spacing-0` 0 · `0-5` 2 · `1` 4 · `1-5` 6 · `2` 8 · `3` 12 · `4` 16 · `5` 20 ·
`6` 24 · `7` 28 · `8` 32 · `9` 36 · `10` 40 · `11` 44 · `12` 48 (px).

**Rule.** Spacing is expressed with component props — `gap`, `padding`,
`paddingInline`, `paddingBlock` on `Stack`/`Grid`/`Card`/`Section` — which take
the step number, not a string: `gap={4}`, never `gap="4"`. Reach for
`space.sN` in StyleX only when no prop exists (this site does so twice, both in
`SiteShell`'s page column).

### 4.3 Radius

Stone overrides the default radius scale:

`--radius-none` `0.125rem` · `--radius-inner` `0.25rem` ·
`--radius-element` `0.5rem` · `--radius-container` `0.75rem` ·
`--radius-page` `1.5rem` · `--radius-full` `9999px`.

Note `--radius-none` is 2px, not 0 — stone has no truly sharp corner. Buttons
are additionally overridden by the theme to `--radius-full`; that is why every
button on this site is a pill. Do not "fix" it.

### 4.4 Typography

| Role | Family |
| --- | --- |
| Heading | Montserrat |
| Body | Figtree |
| Code | JetBrains Mono |

The theme names these fonts but does not bundle them. They are loaded from
Google Fonts in [`src/routes/__root.tsx`](src/routes/__root.tsx); without that
link the theme silently falls back to system fonts.

Scale: base 14px, ratio 1.25. `--font-size-base` `0.875rem` · `lg` `1.125rem` ·
`xl` `1.375rem` · `2xl` `1.6875rem` · `3xl` `2.125rem` · `4xl` `2.6875rem` ·
`5xl` `3.3125rem`.

Semantic types, all of which are what you actually write:

| Prop | Size | Weight |
| --- | --- | --- |
| `<Text type="body">` | base | normal |
| `<Text type="label">` | base | medium |
| `<Text type="large">` | lg | semibold |
| `<Text type="supporting">` | 12px (stone override) | normal |
| `<Text type="code">` | base | normal |
| `<Heading level={1}>` | 2xl | semibold |
| `<Heading level={2}>` | xl | semibold |
| `<Heading level={3}>` | lg | bold |
| `<Heading type="display-2">` | 4xl | normal |

**Rules.** No raw `<p>`, `<h1>`–`<h6>` or `<span>`. Pick a semantic `type`
instead of setting `size` and `weight`. `Heading level` is the document
outline; `type="display-*"` changes only the look, so a hero can be a visual
display face while staying the page's `h1`. Never skip an outline level.

### 4.5 Elevation

`--shadow-low` `0 2px 4px #28282A0D, 0 4px 8px #28282A1A` ·
`--shadow-med` `0 2px 4px #28282A0D, 0 4px 12px #28282A1A` ·
`--shadow-high` `0 4px 6px #28282A1A, 0 12px 24px #28282A26`.

Consumed as `elevation="none|low|med|high"` on `Card`, `ClickableCard`,
`Button`, `IconButton`. Default is `none` — raise a surface only when it needs
to float or when the whole surface is clickable.

### 4.6 Motion

Stone is faster than the Astryx default: `--duration-fast` `125ms`,
`--duration-medium` `300ms`, `--duration-slow` `700ms`, each with a `-min` and
`-max` sibling. Easing is `--ease-standard: cubic-bezier(0.24, 1, 0.4, 1)`.
Components animate themselves; this site adds no animation of its own.

### 4.7 Focus and borders

`--border-width` `1px`. The focus ring is one shared set of tokens —
`--focus-outline-width` `2px`, `--focus-outline-style` `solid`,
`--focus-outline-color` `var(--color-accent)`, `--focus-outline-offset` `3px` —
and every component draws it from there. Never restyle focus per-component.

---

## 5. Composition rules

These come from `astryx docs layout` and are not negotiable in this repo.

**No raw `<div>` or `<span>` for layout.** Components own layout and spacing,
the page frame included. `VStack`, `HStack`, `Grid`, `Section`, `Card`,
`Layout`, `AppShell` — there is one for every case this site has.

**Frame first.** The frame is decided before content. This site is Astryx's
"plain content column" archetype: `AppShell height="auto" contentPadding={0}`
with a `TopNav` and a single centred column. The one width budget the site owns
is `frame.pageWidth` (1080px), applied once in `SiteShell`. Prose-dominant
regions narrow further to `frame.proseWidth` (68ch).

**Responsive contract, declared up front** (in `SiteShell`, where it is enforced):

```
> 1080px   centred 1080px column, 32px gutters
<= 1080px  column fills the viewport, gutters shrink to 16px
<= 768px   AppShell folds the nav items into its own mobile drawer
```

**Rows for dense data, cards for discrete things.** `List`/`ListItem` for
anything the reader scans — the posts feed, the essay archive, the secondary
channels. `Card`/`ClickableCard` only for items that could be reordered or
removed independently: a project, a channel, a KPI tile. Never wrap a list item
in a card, never nest a card in a card.

**`Section`, not `Card`, for page regions.** A `Card` is a thing; a `Section` is
a region. The editorial aside on the Media page is a `Section variant="muted"`
for exactly this reason — and a `Banner` was rejected there because a banner is
a system announcement, not an author's note.

**One link element.** `LinkProvider component={AppLink}` installs a single
adapter ([`src/components/AppLink.tsx`](src/components/AppLink.tsx)) that maps
Astryx's `href` onto TanStack Router's `to` for in-app paths and falls back to a
plain anchor otherwise. Every Astryx link, nav item and linked row routes
through it.

**Accessible names are props, not markup.** `label` on `Button`,
`SegmentedControl`, `StatusDot`, `ClickableCard`, `Icon`; `alt`/`name` on
`Avatar`. Do not hand-roll `aria-*`.

**`:hover` needs a guard.** Any `:hover` inside `stylex.create` must be wrapped
in `@media (hover: hover)`.

---

## 6. Colour mode

`<Theme theme={stoneTheme} mode={mode}>` in
[`src/components/SiteProviders.tsx`](src/components/SiteProviders.tsx), where
`mode` is `system | light | dark`. Astryx syncs `data-theme` and
`data-astryx-theme` onto `<html>`, `reset.css` maps `data-theme` to
`color-scheme`, and `light-dark()` resolves from there. The site adds no
dark-mode CSS of its own; every token pair is already declared by the theme.

Mode starts at `system` on the server and on the first client render, then
adopts a stored preference in an effect — so hydration always matches.
The language toggle works the same way, starting at `en`.

---

## 7. Bilingual content

Not a design-system rule, but it constrains every component that renders text.
Copy lives in `src/content/*.ts` as `L10n<T> = {en: T; zh: T}` objects and is
read through `t()` from `useLocale()`. English and Chinese are written in the
same object literal, so a half-translated string is a TypeScript error rather
than something a reader discovers. `<html lang>` follows the locale
(`en` / `zh-Hans`) so the browser hyphenates and line-breaks correctly.

---

## 8. Checklist before committing UI

1. No `<div>`, `<span>`, `<p>` or `<h*>` in the diff.
2. No hex, no `rgb()`, no bare `px` outside `tokens.stylex.ts`.
3. No `.css` file added, no `className` used for styling.
4. Spacing passed as a step number (`gap={3}`), not a string.
5. Every user-visible string is an `L10n` object with both languages filled.
6. `npx tsc --noEmit` and `npm run build` both clean.
7. If a component or prop was guessed rather than looked up, confirm it:
   `npx astryx component <Name>`.

---

## 9. Looking things up

```bash
npx astryx component <Name>   # props, variants, do/don't, theming targets
npx astryx component --list   # all 156 components
npx astryx docs tokens        # full token reference
npx astryx docs layout        # frame archetypes, cards vs rows
npx astryx docs styling       # xstyle and the styling escape hatches
npx astryx template --list    # page and block recipes
```

`.claude/CLAUDE.md` carries the same index for coding agents; it is generated by
`npx astryx init` and should be regenerated, not hand-edited, after any
`@astryxdesign/core` upgrade (`npx astryx upgrade --apply`).
