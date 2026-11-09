import {describe, expect, it} from 'vitest';
import {transitionNames} from '../src/schemas/project-schema';
import {
  transitionEnvelope,
  transitionFrameCost,
  transitionSpecs,
} from '../src/transitions/transitions';

const identity = {opacity: 1, scale: 1, veilOpacity: 0};

describe('transition specs', () => {
  it('defines a spec for every transition name', () => {
    expect(Object.keys(transitionSpecs).sort()).toEqual([...transitionNames].sort());
  });

  it('reports the frame cost of each transition', () => {
    expect(transitionFrameCost('cut')).toBe(0);
    expect(transitionFrameCost('fade')).toBe(24);
    expect(transitionFrameCost('light-fade')).toBeGreaterThan(0);
    expect(transitionFrameCost('camera-push')).toBeGreaterThan(0);
  });
});

describe('cut', () => {
  it('is the identity envelope in both phases', () => {
    expect(transitionEnvelope('cut', 'enter', 0, 100)).toEqual(identity);
    expect(transitionEnvelope('cut', 'exit', 99, 100)).toEqual(identity);
  });
});

describe('fade', () => {
  it('enters from transparent and settles at full opacity', () => {
    expect(transitionEnvelope('fade', 'enter', 0, 100).opacity).toBe(0);
    expect(transitionEnvelope('fade', 'enter', 12, 100).opacity).toBe(1);
    expect(transitionEnvelope('fade', 'enter', 60, 100).opacity).toBe(1);
  });

  it('is fully present before the exit window and transparent at the last frame', () => {
    expect(transitionEnvelope('fade', 'exit', 87, 100).opacity).toBe(1);
    expect(transitionEnvelope('fade', 'exit', 99, 100).opacity).toBe(0);
  });

  it('does not scale or veil', () => {
    const envelope = transitionEnvelope('fade', 'enter', 6, 100);
    expect(envelope.scale).toBe(1);
    expect(envelope.veilOpacity).toBe(0);
  });
});

describe('light-fade', () => {
  it('blooms across the boundary while keeping the scene faintly visible', () => {
    const firstFrame = transitionEnvelope('light-fade', 'enter', 0, 100);
    expect(firstFrame.veilOpacity).toBeCloseTo(0.88, 5);
    expect(firstFrame.opacity).toBeCloseTo(0.3, 5);

    const lastFrame = transitionEnvelope('light-fade', 'exit', 99, 100);
    expect(lastFrame.veilOpacity).toBeCloseTo(0.88, 5);
    expect(lastFrame.opacity).toBeCloseTo(0.3, 5);
  });

  it('clears the veil and settles to full opacity', () => {
    const entered = transitionEnvelope('light-fade', 'enter', 14, 100);
    expect(entered.veilOpacity).toBe(0);
    expect(entered.opacity).toBe(1);

    const exited = transitionEnvelope('light-fade', 'exit', 89, 100);
    expect(exited.veilOpacity).toBe(0);
    expect(exited.opacity).toBe(1);
  });

  it('uses a light veil rather than black', () => {
    expect(transitionSpecs['light-fade'].veilBackground).toMatch(/linear-gradient/);
  });
});

describe('camera-push', () => {
  it('settles from a pushed-in scale when entering', () => {
    expect(transitionEnvelope('camera-push', 'enter', 0, 100).scale).toBeCloseTo(1.06, 5);
    expect(transitionEnvelope('camera-push', 'enter', 20, 100).scale).toBe(1);
  });

  it('pushes further in while exiting', () => {
    expect(transitionEnvelope('camera-push', 'exit', 99, 100).scale).toBeCloseTo(1.1, 5);
    expect(transitionEnvelope('camera-push', 'exit', 83, 100).scale).toBe(1);
  });

  it('fades through the hand-off so the scale change is hidden', () => {
    expect(transitionEnvelope('camera-push', 'exit', 99, 100).opacity).toBe(0);
    expect(transitionEnvelope('camera-push', 'enter', 0, 100).opacity).toBe(0);
  });
});

describe('short scenes', () => {
  it('compresses transitions instead of inverting the curve', () => {
    // A 20-frame scene cannot afford 12 frames in plus 12 out.
    expect(transitionEnvelope('fade', 'enter', 0, 20).opacity).toBe(0);
    expect(transitionEnvelope('fade', 'enter', 10, 20).opacity).toBe(1);
    expect(transitionEnvelope('fade', 'exit', 19, 20).opacity).toBe(0);
  });

  it('degrades to a cut when there is room for no frames', () => {
    expect(transitionEnvelope('fade', 'enter', 0, 1)).toEqual(identity);
    expect(transitionEnvelope('camera-push', 'exit', 0, 0)).toEqual(identity);
  });
});
