import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {sceneFadeFrames} from '../../theme';

/**
 * Dips a scene in and out over a short beat. Phase 1 uses this for scene
 * boundaries; richer transitions (light-fade, camera-push) land in Phase 2 as
 * a dedicated transition layer.
 */
export const SceneFade: React.FC<{children: React.ReactNode; fadeFrames?: number}> = ({
  children,
  fadeFrames = sceneFadeFrames,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // On scenes shorter than two fades, compress rather than invert the curve.
  const fade = Math.min(fadeFrames, Math.floor(durationInFrames / 2));

  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
