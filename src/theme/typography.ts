/**
 * Typography tokens.
 *
 * Fonts: no webfont is downloaded at render time, keeping renders local,
 * offline and deterministic. The stack resolves to an installed system font
 * (Inter if the user has it, otherwise Segoe UI on Windows, SF on macOS).
 *
 * To use a bundled brand font instead, add the file to `public/` and load it
 * with `@remotion/fonts` (see docs/visual-style-guide.md). Document its
 * license before shipping it.
 */
export const fontFamily = {
  sans: "'Inter', 'Segoe UI', 'Helvetica Neue', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Cascadia Code', Consolas, 'SFMono-Regular', monospace",
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Type scale in pixels, calibrated for a 1920×1080 canvas. */
export const typeScale = {
  display: 132,
  headline: 104,
  title: 68,
  subtitle: 44,
  body: 28,
  small: 22,
  eyebrow: 18,
} as const;

/** Line heights are multipliers matching the type scale roles. */
export const lineHeight = {
  display: 1.02,
  headline: 1.06,
  title: 1.14,
  subtitle: 1.25,
  body: 1.55,
  small: 1.5,
  eyebrow: 1.4,
} as const;

/** Letter spacing in px, calibrated for uppercase eyebrow + mono labels. */
export const letterSpacing = {
  display: -1.5,
  headline: -1.0,
  title: -0.4,
  eyebrow: 4.2,
  monoLabel: 3.0,
  body: 0,
} as const;
