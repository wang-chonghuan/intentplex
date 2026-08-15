---
title: "Where Did the Secondary Colour Go?"
date: "2026-07-31T12:00:00.000Z"
lang: "en"
image: "/media/linkedin/li-53ebfae7503c.jpg"
source: "https://www.linkedin.com/pulse/where-did-secondary-colour-go-chonghuan-wang-wxeif"
---

### Does UI Design in 2026 Still Need a Second Brand Colour?

If you look through product interfaces launched over the past two years, you will notice a fairly consistent pattern: most of them use only one chromatic colour.

The primary button uses it. The focus ring uses it. Links use it. Selected states use it too. Everything else is made up of different shades of grey.

This is very different from design systems ten years ago. Back then, the standard formula was “primary colour + secondary colour”. Two hues were selected and used together almost by default. In many design-system documents today, you may not even find a section called “secondary colour”.

So the question is: **has the secondary colour been phased out?**

### The Conclusion First

The secondary colour has not disappeared, but its definition has changed.

It has shifted from “a second brand hue” to “a second level of emphasis”.

This distinction matters because it changes how you should think when building a design system.

### 1. The Semantic Shift of “Secondary”

In the Material Design 2 era, primary + accent referred to two genuinely independent brand hues. Designers would choose a complementary or adjacent pair from the colour wheel. One handled primary actions, while the other was used for decoration and emphasis.

In widely adopted systems today, such as shadcn/ui, Radix, and Geist, the secondary token still exists, but it is usually **neutral grey**.

A secondary button is a grey button, not “a second colourful button”. The same is true of tokens such as muted, accent, and subtle, which are also usually derived from the neutral scale.

A more accurate description is therefore: **there are fewer hues, but more roles**.

Primary and secondary importance are distinguished through lightness, saturation, and hierarchy rather than by switching to another hue. When two buttons use different colours, users must spend additional cognitive effort deciding which one matters more. When the choice is between a solid blue button and a grey outlined button, the hierarchy is immediately clear.

### 2. The Neutral Scale Is the Real Second Protagonist

This is easy to overlook: in modern interfaces, **more than 85% of the pixels are neutral colours**.

Backgrounds, cards, dividers, body text, secondary text, disabled states, hover backgrounds, zebra-striped tables, and skeleton screens are all grey. Brand colour, by contrast, is tightly restricted to a narrow range of uses: primary buttons, focus rings, links, selected states, and progress indicators.

This is counterintuitive but effective: **the more restrained the brand colour is, the stronger its signal becomes when it appears**.

When brand colour is used everywhere, it no longer means “this is interactive”. When it appears in only three or four places, the user’s attention is automatically drawn towards it. That is its real value.

For this reason, a well-designed neutral scale is far more important than a second brand colour. Radix Colors divides its scale into 12 steps and assigns a role to each one: 1–2 for page backgrounds, 3–5 for component backgrounds, 6–8 for borders, 9–10 for solid fills, and 11–12 for text. This structure has since become close to an industry default.

The underlying problem it solves is simple: **one grey is not enough**. What you need is not more colour, but a more granular range of greys.

### 3. Material 3 Looks Like a Counterexample, but Actually Confirms the Trend

Some people may point to Material 3 as a counterexample because it explicitly retains three layers: primary, secondary, and tertiary.

But look more closely at how it works. These three colours are not selected independently by the designer. They are generated algorithmically from **a single source colour** through tonal palettes. You provide one brand colour, and the system derives all of the role-based colours, including the so-called secondary and tertiary colours.

In other words, even though the label “secondary colour” remains, it has become a mathematical derivative of the primary colour rather than an independent brand decision.

The shift from “the designer chooses two colours” to “the system derives all roles from one colour” is another expression of the same trend.

### 4. Semantic Colours Go Far Beyond Badges

Treating semantic colours as merely “colours used for badges” seriously underestimates their role.

Semantic colour is the language of the entire **feedback system**:

Form validation errors and success statesToasts, alerts, and bannersDestructive buttons, such as delete, sign out, or disconnectStatus indicators and labels in listsThreshold lines and out-of-range regions in chartsEmpty states and restricted-access messages

Badges are only the most visible outlet. They are not the whole system.

The presentation of semantic colour has also changed in recent years. Highly saturated solid blocks are increasingly being replaced by softer combinations of “light background + darker text from the same hue family”. Solid colour blocks create too much visual noise in dense lists and often make contrast requirements harder to satisfy.

Each semantic colour group only needs three practical levels:

LevelUseLightBadge backgrounds and notification-panel backgroundsMidBorders, icons, and chart fillsDarkText, solid buttons, and strong emphasis

There is also one rule that must always be followed: **semantic colour must be paired with an icon or text and must never communicate status through colour alone**.

Around 8% of men have some form of colour-vision deficiency. Red and green are among the easiest colours to confuse, yet they are also the default colours for failure and success.

### 5. When Do You Still Need a Genuine Second Colour?

This trend is not absolute. Some scenarios still require multiple hues, and forcing them into a single-colour system would remove useful information.

**Data visualisation.** Charts may need six to eight clearly distinguishable category colours. This palette is usually maintained separately from the UI token system because its constraints are completely different. Its purpose is to make categories distinguishable from one another, not to establish hierarchy.

**Labels and classification systems.** Linear labels, Notion tags, and calendar categories use colour to express **identity**, not hierarchy. A red label is not more important than a blue label; it simply represents something different. Whenever colour means “different” rather than “more important”, multiple hues are justified.

**Separate rules for marketing pages and product interfaces.** Landing pages can use colour more freely because their purpose is emotion and memorability. Product interfaces should be more restrained because their purpose is efficiency and error prevention. These two contexts do not need to follow the same colour rules.

**Consumer brands with strong personalities.** Duolingo, Figma, and Slack use multiple hues as part of their identity. Their users are not necessarily staring at the interface for eight hours at a desk, and the playfulness of the colour system is itself part of the product value.

The test is straightforward: **ask whether the colour is expressing “more important” or “different”.**

Use hierarchy for the former. Use hue for the latter.

### 6. Why Did Design Move in This Direction?

This is not merely an aesthetic trend. It is the result of several practical pressures.

**Dark mode doubles the cost.** Maintaining all states of one brand colour across light and dark themes—default, hover, active, disabled, and focus—is already substantial work. Two brand colours double that workload, and their relationship must remain consistent across both modes.

**Tokenisation changed the way designers think.** Design handoff moved from “this button is #3B82F6” to “this button uses --color-action-primary”. Once colours are named by role, the idea of a “secondary colour” defined primarily by hue starts to feel out of place.

**Accessibility narrowed the available options.** WCAG contrast requirements prevent many visually appealing high-saturation colours from being used for text or small icons. Once a carefully chosen second brand colour can only be used in large blocks, its practical value drops sharply.

**Component libraries need predictability.** A Button component may already have five variants: primary, secondary, destructive, ghost, and outline. Multiplying each of these by two brand colours quickly makes the system unmanageable. Reducing the number of hues is necessary to keep the component API coherent.

**Brand differentiation moved elsewhere.** Products increasingly differentiate themselves through typefaces, spacing rhythm, corner-radius language, motion curves, and illustration style. Linear and Vercel both use interfaces built around “grey plus a small amount of colour”, yet they are difficult to confuse. The difference comes from density, typography, and motion rather than colour palette.

### Practical Checklist

When building a colour system today, the following configuration will cover most products:

**One neutral scale with 10–12 steps**, with a clearly defined purpose for each step. This deserves the most attention.**One brand-colour scale with the same number of steps**, although only three or four will be used frequently.**Three or four semantic colour groups**—success, warning, danger, and info—with only three levels in each group.**A separate categorical chart palette**, kept outside the main UI token system.Optionally, **a set of label colours** for products that support user-defined categories.

The main point is this: do not begin by asking, “Which secondary colour looks good with the primary colour?”

Build the neutral scale properly first. Then decide where the brand colour should appear.

### Conclusion

So, does UI design in 2026 still need a secondary colour?

Yes, but it is no longer a colour.

It is a level of hierarchy.

And the thing that has truly taken the place of the second brand colour is a carefully designed scale of grey.
