import React, {Fragment} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {BrandContent, DataFlowContent} from '../../schemas/project-schema';
import {
  alpha,
  colors,
  contentBox,
  easing,
  fontFamily,
  fontWeight,
  gradients,
  letterSpacing,
  safeArea,
  typeScale,
} from '../../theme';
import {Backdrop} from '../primitives/Backdrop';
import {ScreenChrome} from '../primitives/Chrome';
import {SceneHeading} from '../primitives/SceneHeading';
import {flowGeometry} from './layout';

type DataFlowProps = {
  brand: BrandContent;
  content: DataFlowContent;
};

const CENTER_Y = 574;
const BOX_HEIGHT = 150;
const PACKET_PERIOD = 76;
const FLOW_START = 46;

/**
 * Linear data-flow: equal-width stages reveal left to right, connectors draw,
 * then small cyan packets travel between stages, fading in and out at the
 * ends. The motion repeats deterministically from the frame number.
 */
export const DataFlow: React.FC<DataFlowProps> = ({brand, content}) => {
  const frame = useCurrentFrame();

  const geometry = flowGeometry(
    content.stages.length,
    safeArea.x,
    safeArea.x + contentBox.width,
    120,
  );

  const footnoteReveal = interpolate(frame - 46, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <Backdrop intensity={0.65} grid={false} />
      <ScreenChrome brand={brand.name} chapter={content.chapter} startFrame={2} />

      <div style={{position: 'absolute', left: safeArea.x, top: 188, width: 1300}}>
        <SceneHeading
          index={content.index}
          label={content.label}
          headline={content.headline}
          startFrame={6}
          headlineSize={typeScale.title - 8}
        />
      </div>

      {/* Connectors and travelling packets sit beneath the stage boxes. */}
      {geometry.connectors.map((connector, index) => {
        const drawStart = 30 + index * 9;
        const draw = interpolate(frame - drawStart, [0, 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easing.out,
        });

        return (
          <Fragment key={`connector-${index}`}>
            <div
              style={{
                position: 'absolute',
                left: connector.start,
                top: CENTER_Y,
                width: connector.end - connector.start,
                height: 1,
                backgroundColor: alpha.line,
                transformOrigin: 'left center',
                transform: `scaleX(${draw})`,
              }}
            />

            {[0, 1].map((packet) => {
              const elapsed = frame - FLOW_START - index * 22;
              if (elapsed < 0) {
                return null;
              }

              const phase = (elapsed / PACKET_PERIOD + packet * 0.5) % 1;
              const opacity = Math.sin(Math.PI * phase) * 0.85 * draw;

              return (
                <span
                  key={`packet-${packet}`}
                  style={{
                    position: 'absolute',
                    left: connector.start + phase * (connector.end - connector.start),
                    top: CENTER_Y - 3.5,
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    backgroundColor: colors.cyan,
                    opacity,
                  }}
                />
              );
            })}
          </Fragment>
        );
      })}

      {content.stages.map((stage, index) => {
        const left = geometry.lefts[index] ?? safeArea.x;
        const delay = 16 + index * 9;
        const local = frame - delay;
        const opacity = interpolate(local, [0, 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const shift = interpolate(local, [0, 22], [14, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easing.out,
        });
        const isLast = index === content.stages.length - 1;

        return (
          <Fragment key={stage.id}>
            <span
              style={{
                position: 'absolute',
                left: left + geometry.boxWidth / 2,
                top: CENTER_Y - BOX_HEIGHT / 2 - 34,
                transform: 'translateX(-50%)',
                fontFamily: fontFamily.mono,
                fontSize: 14,
                letterSpacing: letterSpacing.monoLabel,
                color: isLast ? colors.cyan : colors.mutedBlueGrey,
                opacity,
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            <div
              style={{
                position: 'absolute',
                left,
                top: CENTER_Y - BOX_HEIGHT / 2,
                width: geometry.boxWidth,
                height: BOX_HEIGHT,
                boxSizing: 'border-box',
                padding: '22px 24px',
                borderRadius: 12,
                border: `1px solid ${isLast ? alpha.cyanLine : alpha.line}`,
                background: isLast ? alpha.cyanFill : gradients.panel,
                boxShadow: isLast ? `0 0 36px ${alpha.cyanHalo}` : undefined,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                opacity,
                transform: `translateY(${shift}px)`,
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                {isLast ? (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      backgroundColor: colors.cyan,
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                <span
                  style={{
                    fontFamily: fontFamily.sans,
                    fontSize: 24,
                    fontWeight: fontWeight.medium,
                    lineHeight: 1.2,
                    color: colors.silver,
                  }}
                >
                  {stage.label}
                </span>
              </div>
              {stage.sublabel ? (
                <span
                  style={{
                    marginTop: 9,
                    fontFamily: fontFamily.mono,
                    fontSize: 12,
                    letterSpacing: letterSpacing.monoLabel - 1,
                    textTransform: 'uppercase',
                    color: colors.mutedBlueGrey,
                  }}
                >
                  {stage.sublabel}
                </span>
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
