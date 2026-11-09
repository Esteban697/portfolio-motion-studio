import {Easing} from 'remotion';
import type {TransitionName} from '../schemas/project-schema';

/**
 * Transition system.
 *
 * A transition is a pair of envelopes: the outgoing scene exits with it and
 * the incoming scene enters with it. The two scenes do not overlap — each
 * envelope is clipped to its own scene — so scene durations and the total
 * frame count stay exact. The hand-off happens under the veil or on darkness,
 * where a frame of difference is invisible.
 *
 * Everything here is a pure function of (name, phase, frame, duration), so it
 * is unit-tested without rendering.
 */

export type TransitionPhase = 'enter' | 'exit';

export type TransitionSpec = {
  /** Frames for the incoming scene to settle. */
  enterFrames: number;
  /** Frames for the outgoing scene to leave. */
  exitFrames: number;
  /** Full CSS background used by the veil, or null for no veil. */
  veilBackground: string | null;
};

export const transitionSpecs: Record<TransitionName, TransitionSpec> = {
  cut: {enterFrames: 0, exitFrames: 0, veilBackground: null},
  fade: {enterFrames: 12, exitFrames: 12, veilBackground: null},
  'light-fade': {
    enterFrames: 14,
    exitFrames: 10,
    // Silver-to-cool light, never pure white: a bloom, not a flash.
    veilBackground: 'linear-gradient(180deg, #E8EDF5 0%, #BFE6EE 100%)',
  },
  'camera-push': {enterFrames: 20, exitFrames: 16, veilBackground: null},
};

export type TransitionEnvelope = {
  /** Scene opacity, 0–1. */
  opacity: number;
  /** Uniform scale, suggesting a camera move. */
  scale: number;
  /** Opacity of the light veil drawn above the scene, 0–1. */
  veilOpacity: number;
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const IDENTITY: TransitionEnvelope = {opacity: 1, scale: 1, veilOpacity: 0};

/**
 * Computes the envelope for one side of a transition.
 *
 * `progress` is always "how visible this scene should be": 0 = fully
 * transitioned away, 1 = fully present. For an entering scene it runs from the
 * scene's first frame; for an exiting scene it runs backwards from the scene's
 * last frame.
 */
export const transitionEnvelope = (
  name: TransitionName,
  phase: TransitionPhase,
  frame: number,
  durationInFrames: number,
): TransitionEnvelope => {
  if (name === 'cut') {
    return IDENTITY;
  }

  const spec = transitionSpecs[name];
  const requested = phase === 'enter' ? spec.enterFrames : spec.exitFrames;

  // Short scenes get compressed transitions rather than inverted curves, and
  // never overlap into each other across the halfway point.
  const frames = Math.min(requested, Math.max(0, Math.floor(durationInFrames / 2)));

  if (frames === 0) {
    return IDENTITY;
  }

  const local = phase === 'enter' ? frame : durationInFrames - 1 - frame;
  const progress = clamp01(local / frames);

  switch (name) {
    case 'fade':
      return {opacity: easeOut(progress), scale: 1, veilOpacity: 0};

    case 'light-fade': {
      // The scene stays faintly visible while a light bloom covers the
      // hand-off; the boundary frame is a soft light wash rather than white.
      const opacity = 0.3 + 0.7 * easeOut(progress);
      const veilExponent = phase === 'enter' ? 0.7 : 2;
      return {
        opacity,
        scale: 1,
        veilOpacity: 0.88 * Math.pow(1 - progress, veilExponent),
      };
    }

    case 'camera-push':
      return phase === 'enter'
        ? {
            opacity: easeOut(progress),
            scale: 1 + 0.06 * (1 - easeOut(progress)),
            veilOpacity: 0,
          }
        : {
            opacity: easeOut(progress),
            scale: 1 + 0.1 * Math.pow(1 - progress, 1.4),
            veilOpacity: 0,
          };

    default: {
      const exhaustive: never = name;
      return exhaustive;
    }
  }
};

/** Convenience for tests and tooling: the total frames a transition touches. */
export const transitionFrameCost = (name: TransitionName): number => {
  const spec = transitionSpecs[name];
  return spec.enterFrames + spec.exitFrames;
};
