import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop} from './primitives/Backdrop';
import {ScreenChrome, SideRail} from './primitives/Chrome';
import {RevealText} from './primitives/RevealText';
import type {BrandContent, CinematicIntroContent} from '../schemas/project-schema';
import {
  alpha,
  colors,
  easing,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  safeArea,
  typeScale,
} from '../theme';

type CinematicIntroProps = {
  brand: BrandContent;
  content: CinematicIntroContent;
};

/**
 * Opening scene: identity line, a three-line headline revealed line by line,
 * a drawn rule and a supporting sentence. Left-weighted composition leaves
 * deliberate negative space on the right.
 */
export const CinematicIntro: React.FC<CinematicIntroProps> = ({brand, content}) => {
  const frame = useCurrentFrame();

  const eyebrowOpacity = interpolate(frame - 8, [0, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eyebrowShift = interpolate(frame - 8, [0, 26], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  const ruleProgress = interpolate(frame - 46, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  const sublineOpacity = interpolate(frame - 54, [0, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sublineShift = interpolate(frame - 54, [0, 28], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <Backdrop />

      <ScreenChrome brand={brand.name} chapter={content.chapter} startFrame={2} />
      <SideRail index={content.index} label={content.railLabel} startFrame={18} />

      <div
        style={{
          position: 'absolute',
          left: safeArea.x,
          top: safeArea.y,
          bottom: safeArea.y,
          width: 1120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            opacity: eyebrowOpacity,
            transform: `translateY(${eyebrowShift}px)`,
            marginBottom: 34,
          }}
        >
          <span
            style={{
              width: 48 * eyebrowOpacity,
              height: 1,
              backgroundColor: alpha.cyanLine,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: fontFamily.mono,
              fontSize: typeScale.eyebrow,
              fontWeight: fontWeight.medium,
              letterSpacing: letterSpacing.eyebrow,
              textTransform: 'uppercase',
              color: colors.mutedBlueGrey,
            }}
          >
            {content.eyebrow}
          </span>
        </div>

        <RevealText
          startFrame={20}
          staggerFrames={8}
          durationFrames={36}
          lines={content.headline.map((line) =>
            line.accent ? (
              <span key={line.text} style={{color: colors.cyan}}>
                {line.text}
              </span>
            ) : (
              line.text
            ),
          )}
          lineStyle={{
            fontFamily: fontFamily.sans,
            fontSize: typeScale.display,
            fontWeight: fontWeight.light,
            lineHeight: lineHeight.display,
            letterSpacing: letterSpacing.display,
            color: colors.silver,
          }}
        />

        <div
          style={{
            marginTop: 46,
            height: 1,
            width: 220,
            backgroundColor: alpha.cyanLine,
            transformOrigin: 'left center',
            transform: `scaleX(${ruleProgress})`,
          }}
        />

        <p
          style={{
            marginTop: 30,
            marginBottom: 0,
            maxWidth: 720,
            fontFamily: fontFamily.sans,
            fontSize: typeScale.body - 2,
            fontWeight: fontWeight.regular,
            lineHeight: lineHeight.body,
            color: colors.mutedBlueGrey,
            opacity: sublineOpacity,
            transform: `translateY(${sublineShift}px)`,
          }}
        >
          {content.subline}
        </p>
      </div>
    </AbsoluteFill>
  );
};
