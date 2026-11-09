import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, gradients, gridSize} from '../../theme';

type BackdropProps = {
  /** Multiplier for the atmospheric glows. Lower for quieter scenes. */
  intensity?: number;
  /** Slow parallax drift suggesting a floating camera. */
  drift?: boolean;
  /** Show the technical grid lattice. */
  grid?: boolean;
};

/**
 * Shared scene background: layered gradients, an optional technical grid and
 * a vignette. Sits beneath every scene so the whole film shares one
 * atmosphere.
 */
export const Backdrop: React.FC<BackdropProps> = ({intensity = 1, drift = true, grid = true}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const progress = durationInFrames > 1 ? Math.min(1, frame / (durationInFrames - 1)) : 1;
  const driftX = drift ? interpolate(progress, [0, 1], [0, 28]) : 0;
  const driftY = drift ? interpolate(progress, [0, 1], [0, -20]) : 0;

  const gridLines =
    'linear-gradient(to right, rgba(232, 237, 245, 0.055) 1px, transparent 1px), ' +
    'linear-gradient(to bottom, rgba(232, 237, 245, 0.055) 1px, transparent 1px)';

  const gridMask =
    'radial-gradient(ellipse 68% 62% at 52% 46%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.25) 58%, rgba(0,0,0,0) 88%)';

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <AbsoluteFill style={{backgroundImage: gradients.base}} />

      <AbsoluteFill
        style={{
          backgroundImage: gradients.glowUpperLeft,
          opacity: intensity,
          transform: `translate(${driftX}px, ${driftY}px) scale(1.05)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: gradients.glowLowerRight,
          opacity: intensity * 0.9,
        }}
      />

      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: gridLines,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            opacity: 0.55,
            transform: `translate(${driftX * 0.4}px, ${driftY * 0.4}px)`,
            maskImage: gridMask,
            WebkitMaskImage: gridMask,
          }}
        />
      ) : null}

      <AbsoluteFill style={{backgroundImage: gradients.vignette}} />
    </AbsoluteFill>
  );
};
