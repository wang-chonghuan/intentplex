# UI Requirements

Binding on every UI change. **UI work follows this file strictly** — the agent does not invent
alternatives to what is written here. Section shape is fixed — see `format.md`.

Anything this file does not cover is still a design decision: it is settled at the **grill**, by the
human, before implementation. Never invented while coding.

*Seeded at init from the repo's DESIGN.md, which this file replaces. The token tables and the
composition rules were read out of `@astryxdesign/theme-stone@0.4.1` and the Astryx layout docs; the
component-tier split under `## Contract` is inferred from the repo as it stands and is the part most
worth a human's second look.*

## Contract

**Styling stack — Astryx + StyleX**

Astryx (`@astryxdesign/core@0.4.1`) with the **stone** theme
(`@astryxdesign/theme-stone@0.4.1`) is the component and token authority. Custom styling is
**StyleX**. Tailwind is not used and is not an option for this project.

The design system is not a starting point, it is the whole surface: **every colour, size, radius,
shadow, duration and font in `src/` comes from a stone-theme token, and nothing in `src/` introduces a
new one.**

Three layers, with one owner each:

| Layer | Owner | This repo may |
|---|---|---|
| Tokens — `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--duration-*`, `--font-*` | the stone theme | read them, never define or redefine them |
| Components — `Button`, `Card`, `TopNav`, `List`… (156 of them) | Astryx | compose them, pass their props, never restyle their internals |
| Composition — which component, in what order, at what width | this repo | everything |

The only legal channel from layer 3 into layers 1–2 is the `xstyle` prop, which every Astryx
component accepts and which takes a `stylex.create()` value.

**Theme entry.** The theme is consumed through `@astryxdesign/theme-stone/built` paired with
`theme.css`, never the runtime-injection entry. A runtime theme injects component overrides at
hydration, which flashes under SSR; a built theme ships them in static CSS. This site
server-renders.

**Cascade order**, declared in `src/styles/app.css`:

```
@layer reset, astryx-base, astryx-theme, priority1 … priority10;
```

`reset` is `@astryxdesign/core/reset.css`; `astryx-base` is the pre-compiled component styles;
`astryx-theme` is stone's tokens and component overrides, which must beat `astryx-base`; `priority*`
is this repo's StyleX output, last, so an `xstyle` layout tweak lands on top of a themed component
instead of losing to it.

**`light-dark()` stays native.** Two build settings enforce it — `build.cssTarget` for Vite's own CSS
pipeline and `lightningcssOptions.targets` for the StyleX plugin's internal one. Lowering it produces
`--lightningcss-light` / `--lightningcss-dark` shadow variables, which is the failure the Astryx setup
docs warn about.

**Component structure**

```text
src/components/          # this repo's own components
```

Astryx supplies the atom and molecule tiers — a local `Button`, `Field` or `Item` would be a
duplicate, not a component. What lives here is the **organism and shell tier**: the app frame, the
providers, and the adapters that bind Astryx to this stack. A local component that is really one
Astryx component with props does not belong here.

Route-level composition lives in `src/routes/`, chrome copy in `src/content/`, entries in `content/`,
and StyleX token constants in `src/styles/`.

**Tokens**

`src/styles/tokens.stylex.ts` is the **only file in this repo allowed to name a design token**, and it
names them with `stylex.defineConsts` — which declares no new custom property, only a reference to one
the theme already owns. That is what makes the rule checkable: a StyleX rule elsewhere cannot
introduce a colour, radius or spacing step stone does not define.

Astryx also exports `spacingVars` / `colorVars` for StyleX, but those are `defineVars` objects that
require compiling Astryx from source. This project uses the pre-built distribution, so
`tokens.stylex.ts` is the equivalent.

- ✅ `maxWidth: frame.pageWidth`, `paddingInline: space.s4`, `borderBlockEndColor: color.border`
- ❌ `color: '#25252a'`, `padding: '16px'`, `borderRadius: '8px'`
- ❌ adding a raw value to `tokens.stylex.ts`

The only non-token values that file carries are two layout budgets, `frame.proseWidth` (`68ch`) and
`frame.pageWidth` (`1080px`). They measure a reading column rather than describe visual style, and
Astryx has no token for them.

*Colour — neutrals at hue 291, chroma 3.* Stone is deliberately near-achromatic: its accent is the
darkest neutral rather than a brand colour, so emphasis reads as contrast, not hue.

| Token | Light | Dark |
|---|---|---|
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

Status colours are muted to the same handmade register — stone carries no saturated alert colour:

| Token | Light | Dark |
|---|---|---|
| `--color-success` | `#374c36` | `#b4cdb2` |
| `--color-warning` | `#524622` | `#d7c59c` |
| `--color-error` | `#58413e` | `#dcc0bc` |

Ten categorical hues (blue, cyan, gray, green, orange, pink, purple, red, teal, yellow) each carry
`--color-background-*`, `--color-border-*`, `--color-icon-*` and `--color-text-*`. Light mode is a T90
pastel surface with T30 text; dark mode is a T35 surface with T90 text — the same hex, mirrored. Raw
tonal ramps are exported as `stonePalettes` from `@astryxdesign/theme-stone`; they are reference, not
a source of values for a component.

*Spacing — 4px base.* `--spacing-0` 0 · `0-5` 2 · `1` 4 · `1-5` 6 · `2` 8 · `3` 12 · `4` 16 · `5` 20 ·
`6` 24 · `7` 28 · `8` 32 · `9` 36 · `10` 40 · `11` 44 · `12` 48 (px).

*Radius — stone overrides the default scale.* `--radius-none` `0.125rem` · `--radius-inner` `0.25rem` ·
`--radius-element` `0.5rem` · `--radius-container` `0.75rem` · `--radius-page` `1.5rem` ·
`--radius-full` `9999px`. `--radius-none` is 2px, not 0 — stone has no truly sharp corner. The theme
additionally overrides buttons to `--radius-full`, which is why every button on this site is a pill.

*Typography.* Heading **Montserrat**, body **Figtree**, code **JetBrains Mono**. The theme names these
fonts but does not bundle them; they are loaded from Google Fonts in `src/routes/__root.tsx`, and
without that link the theme silently falls back to system fonts.

Scale: base 14px, ratio 1.25. `--font-size-base` `0.875rem` · `lg` `1.125rem` · `xl` `1.375rem` ·
`2xl` `1.6875rem` · `3xl` `2.125rem` · `4xl` `2.6875rem` · `5xl` `3.3125rem`.

The semantic types are the closed vocabulary — these are what gets written, not `size` + `weight`:

| Prop | Size | Weight |
|---|---|---|
| `<Text type="body">` | base | normal |
| `<Text type="label">` | base | medium |
| `<Text type="large">` | lg | semibold |
| `<Text type="supporting">` | 12px (stone override) | normal |
| `<Text type="code">` | base | normal |
| `<Heading level={1}>` | 2xl | semibold |
| `<Heading level={2}>` | xl | semibold |
| `<Heading level={3}>` | lg | bold |
| `<Heading type="display-2">` | 4xl | normal |

*Elevation.* `--shadow-low` `0 2px 4px #28282A0D, 0 4px 8px #28282A1A` · `--shadow-med`
`0 2px 4px #28282A0D, 0 4px 12px #28282A1A` · `--shadow-high`
`0 4px 6px #28282A1A, 0 12px 24px #28282A26`. Consumed as `elevation="none|low|med|high"`; the default
is `none`.

*Motion.* Stone is faster than the Astryx default: `--duration-fast` `125ms`, `--duration-medium`
`300ms`, `--duration-slow` `700ms`, each with a `-min` and `-max` sibling. Easing is
`--ease-standard: cubic-bezier(0.24, 1, 0.4, 1)`.

*Focus and borders.* `--border-width` `1px`. The focus ring is one shared set —
`--focus-outline-width` `2px`, `--focus-outline-style` `solid`, `--focus-outline-color`
`var(--color-accent)`, `--focus-outline-offset` `3px` — and every component draws from it.

**Layout and responsive**

The site is Astryx's "plain content column" archetype: `AppShell height="auto" contentPadding={0}`
with a `TopNav` above a single centred column. The one width budget this repo owns is
`frame.pageWidth`, applied once in `SiteShell`; prose-dominant regions narrow to `frame.proseWidth`.

The responsive contract, which every UI change works at:

```
> 1080px   centred 1080px column, 32px gutters
<= 1080px  column fills the viewport, gutters shrink to 16px
<= 768px   AppShell folds the nav items into its own mobile drawer
```

Verification viewports: **desktop 1280×800** and **mobile 390×844**.

**Colour mode**

`<Theme theme={stoneTheme} mode={mode}>` in `src/components/SiteProviders.tsx`, where `mode` is
`system | light | dark`. Astryx syncs `data-theme` and `data-astryx-theme` onto `<html>`, `reset.css`
maps `data-theme` to `color-scheme`, and `light-dark()` resolves from there. **This repo writes no
dark-mode CSS of its own** — every token pair is already declared by the theme.

Mode starts at `system` on the server and on the first client render, then adopts a stored preference
in an effect, so hydration always matches. The language toggle works the same way, starting at `en`.

**Design source of truth**

The component library itself. There is no prototype file and no design document beyond this one —
`DESIGN.md` was retired at init and its content lives here.

## Tools

**The mechanical defence for UI work** — the same command `dev.md` names, run from the repo root:

```bash
npx tsc --noEmit && npm run build
```

A raw value cannot be caught by these, but a token that does not exist is a TypeScript error, because
`tokens.stylex.ts` is the only surface a StyleX rule can reach a token through.

**Looking a component or token up** — read the answer, never guess the prop:

```bash
npx astryx component <Name>   # props, variants, do/don't, theming targets
npx astryx component --list   # all 156 components
npx astryx docs tokens        # full token reference
npx astryx docs layout        # frame archetypes, cards vs rows
npx astryx docs styling       # xstyle and the styling escape hatches
npx astryx template --list    # page and block recipes
```

**Token registry** — `src/styles/tokens.stylex.ts`.
**Cascade order and vendor imports** — `src/styles/app.css`.
**Component library docs** — <https://astryx.atmeta.com>, and `.claude/CLAUDE.md` for the agent index
(generated by `npx astryx init`; regenerate rather than hand-edit after an `@astryxdesign/core` bump,
with `npx astryx upgrade --apply`).

## Guidance

Binding. Followed while writing, judged by the author — nothing reviews a diff against this section.

**Choosing components.** Reach for a custom component only when Astryx genuinely has nothing that
fits — not because the official one needs configuring, and not because writing one looks faster.
"There is no equivalent" is a claim to check with `npx astryx component <Name>` or
`npx astryx search "<thing>"`, not to assume.

**No raw `<div>` or `<span>` for layout.** Components own layout and spacing, the page frame included.
`VStack`, `HStack`, `Grid`, `Section`, `Card`, `Layout`, `AppShell` — there is one for every case this
site has. The same goes for text: no raw `<p>`, `<h1>`–`<h6>` or `<span>`; `Text` and `Heading` apply
the theme tokens automatically.

**Frame first.** Decide the frame before the content. Content-first layout — writing sections and
wrapping each one in a Card — produces a padded scroll column that reads as a prototype rather than a
product.

**Rows for dense data, cards for discrete things.** `List` / `ListItem` for anything the reader scans:
the posts feed, the essay archive, the secondary channels. `Card` / `ClickableCard` only for items
that could be reordered or removed independently: a project, a channel, a KPI tile. Never wrap a list
item in a card, never nest a card in a card.

**`Section`, not `Card`, for page regions.** A `Card` is a thing; a `Section` is a region. If you are
tempted to wrap a page section in a Card, that is a Section.

**Choosing a token.** Semantic colour tokens carry meaning; categorical hues carry classification. Use
`Badge variant="success|warning|error"` only for a state that needs the reader to act — a badge on
every healthy row is noise, not information. Use the hue variants for grouping and category tags.
`StatusDot` or `Token` for status and metadata; `Badge` for counts and enumerated states.
**A missing token is a stop, not a reason to compose one out of primitives.**

**Spacing is a prop, not a style.** `gap`, `padding`, `paddingInline`, `paddingBlock` on
`Stack` / `Grid` / `Card` / `Section`, passed as the step number: `gap={4}`, never `gap="4"`. Reach for
`space.sN` in StyleX only when no prop exists.

**Headings are the document outline.** `Heading level` sets the outline; `type="display-*"` changes
only the look, so a hero can be a visual display face while staying the page's `h1`. Never skip a
level.

**Vertical stacks stretch their children.** A control that should hug its content — a
`SegmentedControl`, a button row — goes inside an `HStack`, not straight into a `VStack`.

**Interaction states.** Empty, loading and error states are part of the change, not a follow-up. Use
`EmptyState` inside the region when a filter matches nothing, `Skeleton` while content loads, and the
component's own `isLoading` / `isDisabled` props rather than conditionally rendering nothing. Focus is
never restyled per component — the ring is a shared token set.

**Accessible names are props, not markup.** `label` on `Button`, `SegmentedControl`, `StatusDot`,
`ClickableCard`, `Icon`; `alt` / `name` on `Avatar`. Do not hand-roll `aria-*`.

**`:hover` needs a guard.** Any `:hover` inside `stylex.create` is wrapped in
`@media (hover: hover)`.

**Content and tone.** The chrome — nav, buttons, labels, empty states — is bilingual by construction:
authored as an `L10n` object (`{en, zh}`) in `src/content/`, so a half-translated label is a
TypeScript error rather than something a reader discovers. **Entries are not held to that**, because
the alternative is either hiding a post until it is translated or shipping a machine translation. An
entry exists in whatever languages it was written in, and when the reader's language is not among
them the site shows the original and says so. Both languages are written by a person who means them —
the Chinese is not a translation of the English, and neither is filler. The voice is first-person,
plain, specific,
and willing to be dry; no marketing register in either language. `<html lang>` follows the locale
(`en` / `zh-Hans`) so the browser hyphenates and breaks lines correctly.

## Redlines

**A closed list, looked up — never judged.** Do not ask "is this a big deal?"; check whether the
action is on the list. If it is: **route around it, or stop and hand it to the human.** Never
proceed, never approximate, never decide on the human's behalf.

Every entry says which of the two it is — **forbidden outright**, or **not without the human's
explicit approval**. An entry that needs a read-through to apply is not a redline; write it as
Guidance instead (`format.md`, test 2).

1. **Changing a governed token registry** — adding, renaming, removing or retuning a value — not
   without the human's explicit approval. The registries are, by path, so this can be matched against
   a diff without judgement: `src/styles/tokens.stylex.ts`, `src/styles/app.css`. A missing token is a
   stop; reaching for an Astryx primitive or a raw value instead of asking is the evasion this entry
   exists to name.
2. **Adding a raw style value anywhere in `src/`** — a hex or `rgb()` colour, a bare `px` or `rem`
   length, a `ms` duration, a font stack — forbidden outright, including inside `tokens.stylex.ts`,
   whose entries are `var(--…)` references only. The two `frame.*` layout budgets are the whole
   exception and they are named in `## Contract`.
3. **Introducing Tailwind, a CSS file, a CSS module, a `<style>` tag, or any CSS-in-JS other than
   StyleX** — forbidden outright. `src/styles/app.css` is the only stylesheet in the repo and it
   contains nothing but the layer statement and three `@import`s.
4. **Styling an Astryx component through `className` or `style`** — forbidden outright. `xstyle` with
   a `stylex.create()` value is the only channel.
5. **Overriding an Astryx component's internals** — `astryx swizzle`, reaching into `.xds-*` or
   `astryx-*` class selectors, or importing from `@astryxdesign/core/src` — not without the human's
   explicit approval.
6. **Switching the theme, or the theme's entry point** — changing the theme package, or importing
   `@astryxdesign/theme-stone` instead of `@astryxdesign/theme-stone/built` — not without the human's
   explicit approval.
