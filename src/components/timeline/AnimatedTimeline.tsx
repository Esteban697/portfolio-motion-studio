import React, {Fragment} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {AnimatedTimelineContent, BrandContent} from '../../schemas/project-schema';
import {
  alpha,
  colors,
  defaultProfile,
  easing,
  fontFamily,
  fontWeight,
  letterSpacing,
  safeArea,
  typeScale,
} from '../../theme';
import {Backdrop} from '../primitives/Backdrop';
import {ScreenChrome} from '../primitives/Chrome';
import {SceneHeading} from '../primitives/SceneHeading';
import {timelineGeometry} from './layout';

type AnimatedTimelineProps = {
  brand: BrandContent;
  content: AnimatedTimelineContent;
};

/** Vertical position of the rail inside the 1080p frame. */
const RAIL_TOP = 616;
/** Horizontal inset beyond the safe area, leaving room for edge labels. */
const RAIL_INSET = 150;
/** Frames between milestone reveals. */
const NODE_STAGGER = 10;

/**
 * Horizontal milestone timeline: the rail draws, nodes land in sequence with
 * their marker, title and detail, and travelled segments light up in cyan.
 */
export const AnimatedTimeline: React.FC<AnimatedTimelineProps> = ({brand, content}) => {
  const frame = useCurrentFrame();

  const startX = safeArea.x + RAIL_INSET;
  const endX = defaultProfile.width - safeArea.x - RAIL_INSET;
  const geometry = timelineGeometry(content.milestones.length, startX, endX);

  const railDraw = interpolate(frame - 16, [0, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });
  const footnoteReveal = interpolate(frame - 40, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <Backdrop intensity={0.7} />
      <ScreenChrome brand={brand.name} chapter={content.chapter} startFrame={2} />

      <div style={{position: 'absolute', left: safeArea.x, top: 188, width: 1240}}>
        <SceneHeading
          index={content.index}
          label={content.label}
          headline={content.headline}
          startFrame={8}
        />
      </div>

      {/* Rail */}
      <div
        style={{
          position: 'absolute',
          left: startX,
          top: RAIL_TOP,
          width: endX - startX,
          height: 1,
          backgroundColor: alpha.line,
          transformOrigin: 'left center',
          transform: `scaleX(${railDraw})`,
        }}
      />

      {/* Travelled segments light up behind each revealed milestone. */}
      {geometry.positions.slice(0, -1).map((x, index) => {
        const nextX = geometry.positions[index + 1] ?? endX;
        const reveal = 30 + index * NODE_STAGGER;
        const progress = interpolate(frame - reveal, [0, 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easing.out,
        });

        return (
          <div
            key={`segment-${index}`}
            style={{
              position: 'absolute',
              left: x,
              top: RAIL_TOP,
              width: nextX - x,
              height: 1,
              backgroundColor: colors.cyan,
              opacity: 0.5 * progress,
              transformOrigin: 'left center',
              transform: `scaleX(${progress})`,
            }}
          />
        );
      })}

      {content.milestones.map((milestone, index) => {
        const x = geometry.positions[index] ?? geometry.startX;
        const reveal = 30 + index * NODE_STAGGER;
        const local = frame - reveal;
        const opacity = interpolate(local, [0, 16], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const scale = interpolate(local, [0, 14], [0.4, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easing.out,
        });
        const shift = interpolate(local, [0, 20], [14, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easing.out,
        });
        const isLast = index === content.milestones.length - 1;
        const markerColor = isLast ? colors.cyan : alpha.lineStrong;

        return (
          <Fragment key={`${milestone.marker}-${index}`}>
            <span
              style={{
                position: 'absolute',
                left: x,
                top: RAIL_TOP - 54,
                transform: 'translateX(-50%)',
                fontFamily: fontFamily.mono,
                fontSize: 16,
                letterSpacing: letterSpacing.monoLabel,
                color: isLast ? colors.cyan : colors.mutedBlueGrey,
                opacity,
              }}
            >
              {milestone.marker}
            </span>

            <span
              style={{
                position: 'absolute',
                left: x,
                top: RAIL_TOP - 7,
                width: 14,
                height: 14,
                transform: `translateX(-50%) rotate(45deg) scale(${scale})`,
                border: `1px solid ${markerColor}`,
                backgroundColor: isLast ? colors.cyan : colors.midnight,
                opacity,
                boxSizing: 'border-box',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: x,
                top: RAIL_TOP + 36,
                width: geometry.textWidth,
                transform: `translateX(-50%) translateY(${shift}px)`,
                textAlign: 'center',
                opacity,
              }}
            >
              <div
                style={{
                  fontFamily: fontFamily.sans,
                  fontSize: 28,
                  fontWeight: fontWeight.medium,
                  lineHeight: 1.2,
                  color: colors.silver,
                }}
              >
                {milestone.title}
              </div>
              {milestone.detail ? (
                <div
                  style={{
                    marginTop: 10,
                    fontFamily: fontFamily.sans,
                    fontSize: 19,
                    lineHeight: 1.45,
                    color: colors.mutedBlueGrey,
                  }}
                >
                  {milestone.detail}
                </div>
              ) : null}
            </div>
          </Fragment>
        );
      })}

      {content.footnote ? (
        <div style={{position: 'absolute', left: safeArea.x, right: safeArea.x, bottom: 96}}>
          <div
            style={{
              height: 1,
              backgroundColor: alpha.line,
              transformOrigin: 'left center',
              transform: `scaleX(${footnoteReveal})`,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginTop: 22,
              fontFamily: fontFamily.mono,
              fontSize: typeScale.eyebrow,
              letterSpacing: letterSpacing.monoLabel,
              color: colors.mutedBlueGrey,
              opacity: footnoteReveal,
            }}
          >
            <span>{content.footnote}</span>
            <span style={{color: alpha.silverSoft}}>PORTFOLIO MOTION STUDIO</span>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
