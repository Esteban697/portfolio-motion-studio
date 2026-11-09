/**
 * Linear data-flow layout math, kept pure so it can be tested.
 * Stages are equal-width boxes separated by fixed gaps.
 */

export type FlowGeometry = {
  boxWidth: number;
  gap: number;
  /** Left edge of each stage box. */
  lefts: number[];
  /** Horizontal centre of each stage box. */
  centers: number[];
  /** Connector start/end x positions, between consecutive stages. */
  connectors: {start: number; end: number}[];
};

export const flowGeometry = (
  count: number,
  startX: number,
  endX: number,
  gap = 120,
): FlowGeometry => {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`flowGeometry: count must be a positive integer, received ${count}`);
  }
  if (!(endX > startX)) {
    throw new Error(`flowGeometry: endX must be greater than startX (${startX} → ${endX})`);
  }
  if (gap < 0) {
    throw new Error(`flowGeometry: gap must be non-negative, received ${gap}`);
  }

  const total = endX - startX;
  const boxWidth = (total - gap * (count - 1)) / count;

  if (boxWidth <= 0) {
    throw new Error(
      `flowGeometry: ${count} stages cannot fit in ${total}px with ${gap}px gaps`,
    );
  }

  const lefts = Array.from({length: count}, (_, index) => startX + index * (boxWidth + gap));

  return {
    boxWidth,
    gap,
    lefts,
    centers: lefts.map((left) => left + boxWidth / 2),
    connectors: lefts.slice(0, -1).map((left, index) => ({
      start: left + boxWidth,
      end: startX + (index + 1) * (boxWidth + gap),
    })),
  };
};
