import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {easing} from '../../theme';

type RevealTextProps = {
  /** One entry per rendered line. Line breaks are part of the design. */
  lines: React.ReactNode[];
  /** Frame at which the first line starts moving. */
  startFrame: number;
  /** Frames between line starts. */
  staggerFrames?: number;
  /** Frames each line takes to settle. */
  durationFrames?: number;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
};

const RevealLine: React.FC<{
  startFrame: number;
  durationFrames: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({startFrame, durationFrames, style, children}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  const settle = interpolate(local, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });
  const fade = interpolate(local, [0, Math.max(1, durationFrames * 0.55)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <span
      style={{
        display: 'block',
        overflow: 'hidden',
        paddingBottom: '0.14em',
        marginBottom: '-0.14em',
      }}
    >
      <span
        style={{
          display: 'block',
          transform: `translateY(${(1 - settle) * 105}%)`,
          opacity: fade,
          ...style,
        }}
      >
        {children}
      </span>
    </span>
  );
};

/**
 * Staggered line reveal with a masked slide-up. Text is never typewritten —
 * lines arrive as complete thoughts, which reads more cinematic.
 */
export const RevealText: React.FC<RevealTextProps> = ({
  lines,
  startFrame,
  staggerFrames = 7,
  durationFrames = 34,
  style,
  lineStyle,
}) => {
  return (
    <div style={style}>
      {lines.map((line, index) => (
        <RevealLine
          // Lines are a static, ordered design; index is a stable identity.
          key={index}
          startFrame={startFrame + index * staggerFrames}
          durationFrames={durationFrames}
          style={lineStyle}
        >
          {line}
        </RevealLine>
      ))}
    </div>
  );
};
