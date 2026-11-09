import {describe, expect, it} from 'vitest';
import {
  timelineGeometry,
  timelinePositions,
  timelineTextWidth,
} from '../src/components/timeline/layout';

describe('timelinePositions', () => {
  it('spaces nodes evenly, including both ends', () => {
    expect(timelinePositions(4, 300, 1620)).toEqual([300, 740, 1180, 1620]);
    expect(timelinePositions(2, 300, 1620)).toEqual([300, 1620]);
  });

  it('centres a single milestone', () => {
    expect(timelinePositions(1, 300, 1620)).toEqual([960]);
  });

  it('rejects impossible geometry', () => {
    expect(() => timelinePositions(0, 300, 1620)).toThrow(/positive integer/);
    expect(() => timelinePositions(2, 1620, 300)).toThrow(/endX/);
    expect(() => timelinePositions(2, 300, 300)).toThrow(/endX/);
  });
});

describe('timelineTextWidth', () => {
  it('stays inside sensible bounds as milestones get denser', () => {
    const wide = timelineTextWidth(2, 300, 1620);
    const dense = timelineTextWidth(6, 300, 1620);

    expect(wide).toBe(400);
    expect(dense).toBeLessThanOrEqual(400);
    expect(dense).toBeGreaterThanOrEqual(180);
  });

  it('is wide enough for a two-line title at 1080p', () => {
    expect(timelineTextWidth(3, 300, 1620)).toBeGreaterThanOrEqual(260);
  });
});

describe('timelineGeometry', () => {
  it('returns positions and text width together', () => {
    const geometry = timelineGeometry(3, 300, 1620);

    expect(geometry.positions).toHaveLength(3);
    expect(geometry.positions[0]).toBe(300);
    expect(geometry.positions[2]).toBe(1620);
    expect(geometry.textWidth).toBe(400);
  });
});
