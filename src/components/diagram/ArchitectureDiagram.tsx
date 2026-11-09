import React, {useId} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {ArchitectureDiagramContent, BrandContent} from '../../schemas/project-schema';
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
import {layoutDiagram} from './layout';

type ArchitectureDiagramProps = {
  brand: BrandContent;
  content: ArchitectureDiagramContent;
};

const AREA_TOP = 334;
const AREA_HEIGHT = 496;
const NODE_WIDTH = 236;
const NODE_HEIGHT = 96;
const NODE_ENTER_FRAMES = 16;
const EDGE_DRAW_FRAMES = 22;

/**
 * Grid-based architecture diagram: nodes arrive column by column, then edges
 * draw from box edge to box edge with an arrowhead once the line lands.
 *
 * The diagram is conceptual unless the content says otherwise — it visualises
 * the manifest's declared relationships, not a runtime trace.
 */
export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({brand, content}) => {
  const frame = useCurrentFrame();

  // Unique marker ids: two diagram scenes can be mounted during premounting.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const mutedArrow = `arrow-muted-${uid}`;
  const accentArrow = `arrow-accent-${uid}`;

  const area = {x: safeArea.x, y: AREA_TOP, width: contentBox.width, height: AREA_HEIGHT};
  const layout = layoutDiagram({
    nodes: content.diagram.nodes,
    edges: content.diagram.edges,
    area,
    nodeWidth: NODE_WIDTH,
    nodeHeight: NODE_HEIGHT,
  });

  const boxById = new Map(layout.nodes.map((node) => [node.id, node.box]));
  const nodeStart = (column: number, row: number): number => 18 + column * 14 + row * 4;

  const edgeStart = (fromId: string, toId: string, index: number): number => {
    const from = content.diagram.nodes.find((node) => node.id === fromId);
    const to = content.diagram.nodes.find((node) => node.id === toId);
    if (!from || !to) {
      return 60;
    }
    return Math.max(nodeStart(from.column, from.row), nodeStart(to.column, to.row)) + 12 + index * 3;
  };

  const footnoteReveal = interpolate(frame - 44, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <Backdrop intensity={0.65} />

      <ScreenChrome brand={brand.name} chapter={content.chapter} startFrame={2} />

      <div style={{position: 'absolute', left: safeArea.x, top: 186, width: 1300}}>
        <SceneHeading
          index={content.index}
          label={content.label}
          headline={content.headline}
          startFrame={6}
          headlineSize={typeScale.title - 8}
        />
      </div>

      <svg
        width={1920}
        height={1080}
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      >
        <defs>
          <marker
            id={mutedArrow}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={alpha.lineStrong} />
          </marker>
          <marker
            id={accentArrow}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={colors.cyan} />
          </marker>
        </defs>

        {layout.edges.map((edge, index) => {
          const start = edgeStart(edge.from, edge.to, index);
          const progress = interpolate(frame - start, [0, EDGE_DRAW_FRAMES], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easing.inOut,
          });
          const arrived = progress > 0.98;

          return (
            <path
              key={`${edge.from}-${edge.to}-${index}`}
              d={edge.d}
              fill="none"
              stroke={edge.accent ? colors.cyan : alpha.lineStrong}
              strokeWidth={1.5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - progress}
              opacity={progress > 0 ? 1 : 0}
              markerEnd={
                arrived ? `url(#${edge.accent ? accentArrow : mutedArrow})` : undefined
              }
            />
          );
        })}
      </svg>

      {content.diagram.nodes.map((node) => {
        const box = boxById.get(node.id);
        if (!box) {
          return null;
        }

        const start = nodeStart(node.column, node.row);
        const local = frame - start;
        const opacity = interpolate(local, [0, NODE_ENTER_FRAMES], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const shift = interpolate(local, [0, 20], [12, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easing.out,
        });

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.height,
              boxSizing: 'border-box',
              padding: '18px 22px',
              borderRadius: 12,
              border: `1px solid ${node.accent ? alpha.cyanLine : alpha.line}`,
              background: node.accent ? alpha.cyanFill : gradients.panel,
              boxShadow: node.accent ? `0 0 36px ${alpha.cyanHalo}` : undefined,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              opacity,
              transform: `translateY(${shift}px)`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              {node.accent ? (
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
                  fontSize: 22,
                  fontWeight: fontWeight.medium,
                  lineHeight: 1.2,
                  color: colors.silver,
                }}
              >
                {node.label}
              </span>
            </div>
            {node.sublabel ? (
              <span
                style={{
                  marginTop: 8,
                  fontFamily: fontFamily.mono,
                  fontSize: 13,
                  letterSpacing: letterSpacing.monoLabel - 1,
                  textTransform: 'uppercase',
                  color: colors.mutedBlueGrey,
                }}
              >
                {node.sublabel}
              </span>
            ) : null}
          </div>
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
