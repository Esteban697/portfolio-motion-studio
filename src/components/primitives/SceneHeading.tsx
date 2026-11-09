import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {RevealText} from './RevealText';
import {
  alpha,
  colors,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  typeScale,
} from '../../theme';

type SceneHeadingProps = {
  index: string;
  label: string;
  headline: string;
  startFrame?: number;
  headlineSize?: number;
  maxWidth?: number;
};

/**
 * Shared heading for content scenes: index + label metadata, then a revealed
 * headline. Keeps chrome consistent between timeline and diagram scenes.
 */
export const SceneHeading: React.FC<SceneHeadingProps> = ({
  index,
  label,
  headline,
  startFrame = 0,
  headlineSize = typeScale.title,
  maxWidth = 1180,
}) => {
  const frame = useCurrentFrame();
  const metaOpacity = interpolate(frame - startFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: metaOpacity,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontFamily: fontFamily.mono,
            fontSize: typeScale.eyebrow,
            letterSpacing: letterSpacing.monoLabel,
            color: colors.cyan,
          }}
        >
          {index}
        </span>
        <span style={{width: 28, height: 1, backgroundColor: alpha.lineStrong}} />
        <span
          style={{
            fontFamily: fontFamily.mono,
            fontSize: typeScale.eyebrow,
            letterSpacing: letterSpacing.eyebrow,
            textTransform: 'uppercase',
            color: colors.mutedBlueGrey,
          }}
        >
          {label}
        </span>
      </div>

      <RevealText
        startFrame={startFrame + 8}
        durationFrames={30}
        lines={[headline]}
        style={{maxWidth}}
        lineStyle={{
          fontFamily: fontFamily.sans,
          fontSize: headlineSize,
          fontWeight: fontWeight.light,
          lineHeight: lineHeight.headline,
          letterSpacing: letterSpacing.headline,
          color: colors.silver,
        }}
      />
    </div>
  );
};
