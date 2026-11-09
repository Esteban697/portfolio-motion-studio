import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop} from './primitives/Backdrop';
import {RevealText} from './primitives/RevealText';
import {ScreenChrome} from './primitives/Chrome';
import type {BrandContent, TitleStatementContent} from '../content/types';
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

type TitleStatementProps = {
  brand: BrandContent;
  content: TitleStatementContent;
};

/**
 * Statement scene: an editorial, left-aligned claim with one accented line,
 * a drawn underline, and a small proof line. A ghost numeral adds depth
 * without competing for attention.
 */
export const TitleStatement: React.FC<TitleStatementProps> = ({brand, content}) => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame - 4, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const underline = interpolate(frame - 40, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  const hairline = interpolate(frame - 44, [0, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  const footnoteOpacity = interpolate(frame - 52, [0, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ghostOpacity = interpolate(frame - 6, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <Backdrop intensity={0.75} grid={false} />

      <div
        style={{
          position: 'absolute',
          right: 40,
          top: 150,
          fontFamily: fontFamily.mono,
          fontSize: 520,
          fontWeight: fontWeight.light,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: colors.silver,
          opacity: 0.035 * ghostOpacity,
          userSelect: 'none',
        }}
      >
        {content.ghostNumeral}
      </div>

      <ScreenChrome brand={brand.name} chapter="Statement" startFrame={2} />

      <div
        style={{
          position: 'absolute',
          left: safeArea.x,
          top: safeArea.y,
          bottom: safeArea.y,
          width: 1320,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            opacity: labelOpacity,
            marginBottom: 40,
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
            {content.index}
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
            {content.label}
          </span>
        </div>

        <RevealText
          startFrame={12}
          staggerFrames={8}
          durationFrames={34}
          lines={content.lines.map((line) =>
            line.accent ? (
              <span
                key={line.text}
                style={{color: colors.cyan, position: 'relative', display: 'inline-block'}}
              >
                {line.text}
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 4,
                    height: 2,
                    backgroundColor: colors.cyan,
                    opacity: 0.55,
                    transformOrigin: 'left center',
                    transform: `scaleX(${underline})`,
                  }}
                />
              </span>
            ) : (
              line.text
            ),
          )}
          lineStyle={{
            fontFamily: fontFamily.sans,
            fontSize: typeScale.headline - 8,
            fontWeight: fontWeight.light,
            lineHeight: lineHeight.headline,
            letterSpacing: letterSpacing.headline,
            color: colors.silver,
          }}
        />

        <div
          style={{
            marginTop: 76,
            height: 1,
            width: '100%',
            backgroundColor: alpha.line,
            transformOrigin: 'left center',
            transform: `scaleX(${hairline})`,
          }}
        />

        <p
          style={{
            marginTop: 26,
            marginBottom: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontFamily: fontFamily.mono,
            fontSize: typeScale.eyebrow,
            letterSpacing: letterSpacing.monoLabel,
            color: colors.mutedBlueGrey,
            opacity: footnoteOpacity,
          }}
        >
          <span>{content.footnote}</span>
          <span style={{color: alpha.silverSoft}}>PORTFOLIO MOTION STUDIO</span>
        </p>
      </div>
    </AbsoluteFill>
  );
};
