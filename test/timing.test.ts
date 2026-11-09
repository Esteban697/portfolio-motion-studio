import {describe, expect, it} from 'vitest';
import {framesToSeconds, sceneProgress, secondsToFrames} from '../src/utils/timing';

describe('secondsToFrames', () => {
  it('converts whole seconds at the composition fps', () => {
    expect(secondsToFrames(4, 30)).toBe(120);
    expect(secondsToFrames(0, 30)).toBe(0);
    expect(secondsToFrames(2.5, 30)).toBe(75);
  });

  it('rounds to the nearest frame', () => {
    expect(secondsToFrames(0.05, 30)).toBe(2); // 1.5 frames
    expect(secondsToFrames(0.01, 30)).toBe(0); // 0.3 frames
  });

  it('rejects negative or non-finite seconds', () => {
    expect(() => secondsToFrames(-1, 30)).toThrow(/seconds/);
    expect(() => secondsToFrames(Number.NaN, 30)).toThrow(/seconds/);
    expect(() => secondsToFrames(Number.POSITIVE_INFINITY, 30)).toThrow(/seconds/);
  });

  it('rejects a non-positive fps', () => {
    expect(() => secondsToFrames(1, 0)).toThrow(/fps/);
    expect(() => secondsToFrames(1, -30)).toThrow(/fps/);
  });
});

describe('framesToSeconds', () => {
  it('is the inverse at exact frame counts', () => {
    expect(framesToSeconds(120, 30)).toBe(4);
    expect(framesToSeconds(0, 30)).toBe(0);
  });

  it('rejects negative frames', () => {
    expect(() => framesToSeconds(-1, 30)).toThrow(/frames/);
  });
});

describe('sceneProgress', () => {
  it('runs 0 → 1 across a scene', () => {
    expect(sceneProgress(0, 30)).toBe(0);
    expect(sceneProgress(29, 30)).toBe(1);
    expect(sceneProgress(15, 30)).toBeCloseTo(15 / 29);
  });

  it('clamps outside the scene', () => {
    expect(sceneProgress(-5, 30)).toBe(0);
    expect(sceneProgress(60, 30)).toBe(1);
  });

  it('returns 1 for single-frame scenes instead of dividing by zero', () => {
    expect(sceneProgress(0, 1)).toBe(1);
  });
});
