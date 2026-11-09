import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion';
import type {ImageShowcaseContent, BrandContent, ShowcaseImageContent} from '../../schemas/project-schema';
import {
  alpha,
  colors,
  contentBox,
  easing,
  fontFamily,
  gradients,
  letterSpacing,
  safeArea,
  typeScale,
} from '../../theme';
import {resolveProjectAsset} from '../../utils/assets';
import {Backdrop} from '../primitives/Backdrop';
import {ScreenChrome} from '../primitives/Chrome';
import {SceneHeading} from '../primitives/SceneHeading';

type ImageShowcaseProps = {
  brand: BrandContent;
  projectId: string;
  content: ImageShowcaseContent;
};

const MEDIA_TOP = 340;
const HERO_SINGLE = {width: 960, height: 540};
const HERO_WITH_SIDE = {width: 940, height: 500};
const SIDE_CARD = {width: 650, height: 230};
const CHROME_HEIGHT = 44;

const BrowserChrome: React.FC<{url: string}> = ({url}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: CHROME_HEIGHT,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 18px',
      backgroundColor: 'rgba(8, 13, 25, 0.92)',
      borderBottom: `1px solid ${alpha.line}`,
    }}
  >
    {[0, 1, 2].map((dot) => (
      <span
        key={dot}
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          backgroundColor: alpha.lineStrong,
        }}
      />
    ))}
    <span
      style={{
        flex: 1,
        marginLeft: 14,
        padding: '5px 14px',
        borderRadius: 999,
        backgroundColor: 'rgba(232, 237, 245, 0.05)',
        fontFamily: fontFamily.mono,
        fontSize: 12,
        letterSpacing: 1.2,
        color: colors.mutedBlueGrey,
      }}
    >
      {url}
    </span>
  </div>
);

const MediaCard: React.FC<{
  image: ShowcaseImageContent;
  projectId: string;
  brand: BrandContent;
  left: number;
  top: number;
  width: number;
  height: number;
  captionTop: number;
  index: number;
  delay: number;
}> = ({image, projectId, brand, left, top, width, height, captionTop, index, delay}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;

  const opacity = interpolate(local, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shift = interpolate(local, [0, 24], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });
  const scale = interpolate(local, [0, 24], [0.988, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  const isConcept = image.kind === 'concept';
  // Concept art fills the frame; captures sit inside a browser window.
  const imageInset = isConcept ? 0 : CHROME_HEIGHT + 14;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width,
          height,
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${isConcept ? alpha.lineStrong : alpha.line}`,
          background: gradients.panel,
          boxShadow: '0 30px 80px rgba(2, 5, 11, 0.45)',
          opacity,
          transform: `translateY(${shift}px) scale(${scale})`,
        }}
      >
        {isConcept ? null : <BrowserChrome url={brand.url} />}

        <div
          style={{
            position: 'absolute',
            left: imageInset,
            right: imageInset,
            top: imageInset,
            bottom: imageInset,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isConcept ? 'transparent' : 'rgba(10, 16, 28, 0.9)',
            borderRadius: isConcept ? 0 : 8,
            overflow: 'hidden',
          }}
        >
          <Img
            src={resolveProjectAsset(projectId, image.src)}
            style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
          />
        </div>

        <span
          style={{
            position: 'absolute',
            top: isConcept ? 14 : CHROME_HEIGHT + 14,
            right: 14,
            padding: '5px 10px',
            borderRadius: 5,
            border: `1px solid ${isConcept ? alpha.cyanLine : alpha.line}`,
            backgroundColor: 'rgba(8, 13, 25, 0.8)',
            fontFamily: fontFamily.mono,
            fontSize: 11,
            letterSpacing: 1.8,
            color: isConcept ? colors.cyan : colors.mutedBlueGrey,
          }}
        >
          {isConcept ? 'CONCEPT' : 'CAPTURE'}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          left,
          top: captionTop,
          width,
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          opacity,
        }}
      >
        <span
          style={{
            fontFamily: fontFamily.mono,
            fontSize: 13,
            letterSpacing: letterSpacing.monoLabel,
            color: isConcept ? colors.cyan : colors.mutedBlueGrey,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          style={{
            fontFamily: fontFamily.sans,
            fontSize: 19,
            lineHeight: 1.4,
            color: colors.mutedBlueGrey,
          }}
        >
          {image.caption}
        </span>
      </div>
    </>
  );
};

/**
 * Screenshot / illustration showcase: one hero frame with up to two detail
 * frames beside it. Conceptual images are always badged CONCEPT; real
 * captures get a browser frame and a CAPTURE badge.
 */
export const ImageShowcase: React.FC<ImageShowcaseProps> = ({brand, projectId, content}) => {
  const frame = useCurrentFrame();
  const [hero, ...details] = content.images;
  if (!hero) {
    return null;
  }

  const hasSide = details.length > 0;
  const heroSize = hasSide ? HERO_WITH_SIDE : HERO_SINGLE;
  const heroLeft = hasSide
    ? safeArea.x
    : safeArea.x + (contentBox.width - heroSize.width) / 2;

  const footnoteReveal = interpolate(frame - 48, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <Backdrop intensity={0.6} grid={false} />
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

      <MediaCard
        image={hero}
        projectId={projectId}
        brand={brand}
        left={heroLeft}
        top={MEDIA_TOP}
        width={heroSize.width}
        height={heroSize.height}
        captionTop={MEDIA_TOP + heroSize.height + 18}
        index={0}
        delay={14}
      />

      {details.map((image, index) => {
        const gap = 26;
        const captionHeight = 30;
        const blockHeight = SIDE_CARD.height + 18 + captionHeight;
        const top = MEDIA_TOP + index * (blockHeight + gap);
        const left = safeArea.x + heroSize.width + 50;

        return (
          <MediaCard
            key={image.src}
            image={image}
            projectId={projectId}
            brand={brand}
            left={left}
            top={top}
            width={SIDE_CARD.width}
            height={SIDE_CARD.height}
            captionTop={top + SIDE_CARD.height + 18}
            index={index + 1}
            delay={22 + index * 8}
          />
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
