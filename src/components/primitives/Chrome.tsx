import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {
  alpha,
  colors,
  easing,
  fontFamily,
  fontWeight,
  letterSpacing,
  safeArea,
  typeScale,
} from '../../theme';

const labelStyle: React.CSSProperties = {
  fontFamily: fontFamily.mono,
  fontSize: typeScale.eyebrow - 3,
  fontWeight: fontWeight.medium,
  letterSpacing: letterSpacing.monoLabel,
  textTransform: 'uppercase',
  color: colors.mutedBlueGrey,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

/**
 * Top chrome: brand label left, chapter label right. A thin structural
 * element shared by scenes so the film reads as one system.
 */
export const ScreenChrome: React.FC<{
  brand: string;
  chapter: string;
  startFrame?: number;
}> = ({brand, chapter, startFrame = 0}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - startFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 76,
        left: safeArea.x,
        right: safeArea.x,
        display: 'flex',
        justifyContent: 'space-between',
        opacity,
      }}
    >
      <span style={labelStyle}>
        <span
          style={{
            width: 6,
            height: 6,
            backgroundColor: colors.cyan,
            borderRadius: 1,
            display: 'inline-block',
          }}
        />
        {brand}
      </span>
      <span style={{...labelStyle, color: alpha.silverSoft}}>{chapter}</span>
    </div>
  );
};

/**
 * Right-edge rail: a drawn hairline with ticks, the scene index and a rotated
 * label. Reads as instrumentation, not decoration.
 */
export const SideRail: React.FC<{
  index: string;
  label: string;
  startFrame?: number;
}> = ({index, label, startFrame = 0}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - startFrame, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  const tick = (top: number, opacity: number): React.CSSProperties => ({
    position: 'absolute',
    right: 0,
    top,
    width: 12,
    height: 1,
    backgroundColor: alpha.lineStrong,
    opacity: opacity * draw,
  });

  return (
    <div
      style={{
        position: 'absolute',
        right: safeArea.x - 26,
        top: 220,
        width: 46,
        height: 480,
        opacity: draw,
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 1,
          height: '100%',
          backgroundColor: alpha.line,
          transformOrigin: 'top',
          transform: `scaleY(${draw})`,
        }}
      />
      <div style={tick(0, 1)} />
      <div style={tick(239, 0.6)} />
      <div style={tick(479, 1)} />

      <span
        style={{
          position: 'absolute',
          right: 20,
          top: 0,
          writingMode: 'vertical-rl',
          fontFamily: fontFamily.mono,
          fontSize: 13,
          letterSpacing: letterSpacing.monoLabel + 1,
          textTransform: 'uppercase',
          color: alpha.silverSoft,
        }}
      >
        {label}
      </span>
      <span
        style={{
          position: 'absolute',
          right: 20,
          top: 452,
          fontFamily: fontFamily.mono,
          fontSize: 13,
          letterSpacing: letterSpacing.monoLabel,
          color: colors.cyan,
        }}
      >
        {index}
      </span>
    </div>
  );
};
