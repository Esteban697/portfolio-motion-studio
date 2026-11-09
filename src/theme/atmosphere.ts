/**
 * Background atmosphere tokens: layered gradients that give the dark canvas
 * depth without decorative noise.
 */
export const gradients = {
  /** Base canvas: a barely perceptible diagonal lift. */
  base: 'linear-gradient(158deg, #0B1322 0%, #080D19 46%, #060A12 100%)',
  /** Soft cool light from the upper left. */
  glowUpperLeft:
    'radial-gradient(ellipse 72% 58% at 20% 16%, rgba(23, 43, 69, 0.85) 0%, rgba(23, 43, 69, 0) 64%)',
  /** Faint cyan lift from the lower right. */
  glowLowerRight:
    'radial-gradient(ellipse 58% 48% at 82% 90%, rgba(49, 197, 217, 0.10) 0%, rgba(49, 197, 217, 0) 62%)',
  /** Vignette that focuses the middle of frame. */
  vignette:
    'radial-gradient(ellipse 80% 72% at 50% 46%, rgba(0, 0, 0, 0) 40%, rgba(2, 5, 11, 0.62) 100%)',
  /** Subtle sheen for panels. */
  panel: 'linear-gradient(180deg, rgba(23, 43, 69, 0.55) 0%, rgba(11, 19, 34, 0.35) 100%)',
} as const;

/** Grid spacing in px for the technical backdrop lattice. */
export const gridSize = 80;
