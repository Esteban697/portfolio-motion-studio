/**
 * Color system for Portfolio Motion Studio.
 *
 * Palette values are the single source of truth. Components must never
 * hardcode a color literal — add a token here instead.
 */
export const colors = {
  /** Main background. */
  midnight: '#080D19',
  /** Secondary surfaces, panels, diagram nodes. */
  deepBlue: '#172B45',
  /** Highlights and active connections. Use sparingly. */
  cyan: '#31C5D9',
  /** Main typography. */
  silver: '#E8EDF5',
  /** Supporting text. */
  mutedBlueGrey: '#8EA0B8',
} as const;

/**
 * Translucent helpers derived from the palette. Kept as explicit tokens so
 * opacity choices stay consistent across scenes.
 */
export const alpha = {
  /** Hairline dividers and grid lines. */
  line: 'rgba(232, 237, 245, 0.10)',
  /** Emphasised rules and borders. */
  lineStrong: 'rgba(232, 237, 245, 0.22)',
  /** Cyan fill for panels and badges. */
  cyanFill: 'rgba(49, 197, 217, 0.08)',
  /** Cyan borders and drawn rules. */
  cyanLine: 'rgba(49, 197, 217, 0.42)',
  /** Cyan text glow tint. */
  cyanGlow: 'rgba(49, 197, 217, 0.30)',
  /** Muted supporting text at full legibility. */
  silverSoft: 'rgba(232, 237, 245, 0.62)',
  /** Deep shadow used for vignette. */
  shadow: 'rgba(2, 5, 11, 0.65)',
} as const;

export type ColorToken = keyof typeof colors;
