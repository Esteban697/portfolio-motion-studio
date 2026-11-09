import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop} from './primitives/Backdrop';
import {BrandMark} from './primitives/BrandMark';
import type {BrandContent, CinematicOutroContent} from '../content/types';
import {
  alpha,
  colors,
  easing,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  typeScale,
} from '../theme';

type CinematicOutroProps = {
  brand: BrandContent;
  content: CinematicOutroContent;
};

const rise = (frame: number, delay: number): {opacity: number; transform: string} => {
  const local = frame - delay;
  const opacity = interpolate(local, [0, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shift = interpolate(local, [0, 30], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });
  return {opacity, transform: `translateY(${shift}px)`};
};

/**
 * Closing scene: brand mark, name, tagline and a single call to action.
 * Centred, symmetric and quiet — deliberately the opposite weight of the
 * intro so the film lands.
 */
export const CinematicOutro: React.FC<CinematicOutroProps> = ({brand, content}) => {
  const frame = useCurrentFrame();

  const kickerFade = interpolate(frame - 2, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <Backdrop intensity={0.8} grid={false} />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
        }}
      >
        <span
          style={{
            fontFamily: fontFamily.mono,
            fontSize: typeScale.eyebrow - 3,
            letterSpacing: letterSpacing.eyebrow,
            textTransform: 'uppercase',
            color: colors.mutedBlueGrey,
            opacity: kickerFade,
            marginBottom: 44,
          }}
        >
          {content.kicker}
        </span>

        <BrandMark initials={brand.initials} size={104} startFrame={6} />

        <h2
          style={{
            ...rise(frame, 16),
            margin: '40px 0 0',
            fontFamily: fontFamily.sans,
            fontSize: typeScale.title - 6,
            fontWeight: fontWeight.regular,
            letterSpacing: -0.6,
            lineHeight: lineHeight.title,
            color: colors.silver,
          }}
        >
          {brand.name}
        </h2>

        <p
          style={{
            ...rise(frame, 24),
            margin: '18px 0 0',
            fontFamily: fontFamily.sans,
            fontSize: typeScale.body - 3,
            fontWeight: fontWeight.regular,
            lineHeight: lineHeight.body,
            color: colors.mutedBlueGrey,
          }}
        >
          {brand.tagline}
        </p>

        <p
          style={{
            ...rise(frame, 32),
            margin: '44px 0 0',
            padding: '14px 30px',
            border: `1px solid ${alpha.cyanLine}`,
            borderRadius: 999,
            backgroundColor: alpha.cyanFill,
            fontFamily: fontFamily.mono,
            fontSize: typeScale.small - 2,
            letterSpacing: letterSpacing.monoLabel,
            color: colors.cyan,
          }}
        >
          {brand.url}
        </p>

        <p
          style={{
            ...rise(frame, 40),
            margin: '36px 0 0',
            fontFamily: fontFamily.sans,
            fontSize: typeScale.small - 2,
            lineHeight: lineHeight.small,
            color: colors.mutedBlueGrey,
          }}
        >
          {content.closingLine}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
