/**
 * Timeline layout math, kept pure so it can be tested without rendering.
 */

export type TimelineGeometry = {
  positions: number[];
  /** Width available for each milestone's title/detail column. */
  textWidth: number;
  startX: number;
  endX: number;
};

/**
 * Distributes `count` milestone nodes evenly between `startX` and `endX`.
 * A single milestone is centred; two or more are spaced edge to edge.
 */
export const timelinePositions = (count: number, startX: number, endX: number): number[] => {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`timelinePositions: count must be a positive integer, received ${count}`);
  }
  if (!(endX > startX)) {
    throw new Error(`timelinePositions: endX must be greater than startX (${startX} → ${endX})`);
  }

  if (count === 1) {
    return [(startX + endX) / 2];
  }

  const step = (endX - startX) / (count - 1);
  return Array.from({length: count}, (_, index) => startX + index * step);
};

/**
 * Column width for milestone copy: narrow enough to avoid collisions, wide
 * enough to hold a two-line title.
 */
export const timelineTextWidth = (
  count: number,
  startX: number,
  endX: number,
  maximum = 400,
): number => {
  if (count < 2) {
    return maximum;
  }
  const step = (endX - startX) / (count - 1);
  return Math.min(maximum, Math.max(180, step - 60));
};

export const timelineGeometry = (count: number, startX: number, endX: number): TimelineGeometry => ({
  positions: timelinePositions(count, startX, endX),
  textWidth: timelineTextWidth(count, startX, endX),
  startX,
  endX,
});
