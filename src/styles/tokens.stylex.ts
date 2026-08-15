import * as stylex from '@stylexjs/stylex';

/**
 * Every Astryx design token this site is allowed to reach for from StyleX,
 * as compile-time constants.
 *
 * These are `defineConsts`, not `defineVars`: they declare no new custom
 * properties, they only inline a reference to a variable the stone theme
 * already owns. That is the whole point — a StyleX rule in this codebase can
 * never introduce a colour, radius, or spacing step that the theme did not
 * define, and switching themes keeps working because nothing is copied.
 *
 * Adding a raw value here (a hex, a px) instead of a var() reference is the
 * one edit that breaks the contract described in DESIGN.md.
 */

export const color = stylex.defineConsts({
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  accent: 'var(--color-accent)',
  onAccent: 'var(--color-on-accent)',
  backgroundBody: 'var(--color-background-body)',
  backgroundSurface: 'var(--color-background-surface)',
  backgroundMuted: 'var(--color-background-muted)',
  border: 'var(--color-border)',
  borderEmphasized: 'var(--color-border-emphasized)',
  overlayHover: 'var(--color-overlay-hover)',
});

export const space = stylex.defineConsts({
  s0: 'var(--spacing-0)',
  s1: 'var(--spacing-1)',
  s2: 'var(--spacing-2)',
  s3: 'var(--spacing-3)',
  s4: 'var(--spacing-4)',
  s5: 'var(--spacing-5)',
  s6: 'var(--spacing-6)',
  s8: 'var(--spacing-8)',
  s10: 'var(--spacing-10)',
  s12: 'var(--spacing-12)',
});

export const radius = stylex.defineConsts({
  inner: 'var(--radius-inner)',
  element: 'var(--radius-element)',
  container: 'var(--radius-container)',
  page: 'var(--radius-page)',
  full: 'var(--radius-full)',
});

export const border = stylex.defineConsts({
  width: 'var(--border-width)',
});

export const motion = stylex.defineConsts({
  fast: 'var(--duration-fast)',
  medium: 'var(--duration-medium)',
  easeStandard: 'var(--ease-standard)',
});

export const font = stylex.defineConsts({
  heading: 'var(--font-family-heading)',
  body: 'var(--font-family-body)',
  code: 'var(--font-family-code)',
});

/**
 * Layout constants that are not colour, type or spacing — the region budgets
 * the Astryx layout guide asks you to declare up front rather than sprinkle.
 */
export const frame = stylex.defineConsts({
  /** Reading column for prose-dominant regions. */
  proseWidth: '68ch',
  /** Outer page column, shared by every route. */
  pageWidth: '1080px',
});
