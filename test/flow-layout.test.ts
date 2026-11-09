import {describe, expect, it} from 'vitest';
import {flowGeometry} from '../src/components/flow/layout';

describe('flowGeometry', () => {
  it('lays out four equal stages with fixed gaps', () => {
    const geometry = flowGeometry(4, 140, 1780, 120);

    expect(geometry.boxWidth).toBe(320);
    expect(geometry.lefts).toEqual([140, 580, 1020, 1460]);
    expect(geometry.connectors).toEqual([
      {start: 460, end: 580},
      {start: 900, end: 1020},
      {start: 1340, end: 1460},
    ]);
  });

  it('keeps the last stage flush with the end edge', () => {
    const geometry = flowGeometry(3, 100, 1000, 80);
    const lastLeft = geometry.lefts[geometry.lefts.length - 1];

    expect(lastLeft).toBeDefined();
    expect((lastLeft ?? 0) + geometry.boxWidth).toBeCloseTo(1000, 6);
  });

  it('never overlaps two stages', () => {
    const geometry = flowGeometry(4, 140, 1780, 120);
    for (let index = 0; index < geometry.lefts.length - 1; index++) {
      const left = geometry.lefts[index];
      const next = geometry.lefts[index + 1];
      if (left === undefined || next === undefined) continue;
      expect(left + geometry.boxWidth).toBeLessThanOrEqual(next);
    }
  });

  it('centres each stage inside its box', () => {
    const geometry = flowGeometry(2, 0, 300, 100);
    expect(geometry.centers[0]).toBe(50);
    expect(geometry.centers[1]).toBe(250);
  });

  it('rejects layouts that cannot fit the stages', () => {
    expect(() => flowGeometry(4, 0, 200, 120)).toThrow(/cannot fit/);
  });

  it('rejects invalid input', () => {
    expect(() => flowGeometry(0, 0, 100)).toThrow(/positive integer/);
    expect(() => flowGeometry(2, 100, 100)).toThrow(/endX/);
    expect(() => flowGeometry(2, 0, 100, -1)).toThrow(/gap/);
  });
});
