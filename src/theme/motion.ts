import {Easing} from 'remotion';

/**
 * Motion tokens. Everything is expressed in frames at the composition's fps
 * (30 for the landscape profile), so a component's feel is independent of
 * wall-clock time and stays deterministic.
 */

/** Easing curves. Expo-out is the house curve: fast entry, long settle. */
export const easing = {
  /** Default reveal curve — confident, decelerating. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Softer variant for small supporting moves. */
  outSoft: Easing.bezier(0.33, 1, 0.68, 1),
  /** Symmetric curve for in-and-out moves. */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Accel-only curve for exits. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
} as const;

/** Duration presets in frames at 30fps. */
export const duration = {
  instant: 6,
  fast: 18,
  base: 30,
  slow: 48,
  glacial: 90,
} as const;

/** Stagger between related elements in frames. */
export const stagger = {
  tight: 3,
  base: 7,
  loose: 12,
} as const;

/** Standard scene fade in/out length in frames. */
export const sceneFadeFrames = 12;
