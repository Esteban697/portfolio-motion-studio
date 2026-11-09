import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {alpha, colors, easing, fontFamily, letterSpacing} from '../../theme';

type BrandMarkProps = {
  initials: string;
  size?: number;
  /** Frame at which the mark draws in. */
  startFrame?: number;
};

/**
 * Monogram mark: a rounded technical plate with a hexagonal path and the
 * initials. Drawn in code so it scales cleanly and stays editable.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({initials, size = 112, startFrame = 0}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  const ringDraw = interpolate(local, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.out,
  });
  const plateFade = interpolate(local, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hexLength = 6 * 34; // perimeter of the hexagon path below (approx.)

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{opacity: plateFade, overflow: 'visible'}}>
      <rect
        x="1"
        y="1"
        width="98"
        height="98"
        rx="16"
        fill={alpha.cyanFill}
        stroke={alpha.cyanLine}
        strokeWidth="0.9"
      />
      <path
        d="M50 15 L 81.2 33 L 81.2 67 L 50 85 L 18.8 67 L 18.8 33 Z"
        fill="none"
        stroke={alpha.lineStrong}
        strokeWidth="0.9"
        strokeDasharray={hexLength}
        strokeDashoffset={hexLength * (1 - ringDraw)}
      />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.silver}
        fontFamily={fontFamily.mono}
        fontSize="26"
        letterSpacing={letterSpacing.monoLabel / 2}
        style={{opacity: ringDraw}}
      >
        {initials}
      </text>
    </svg>
  );
};
