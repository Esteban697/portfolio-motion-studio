import {describe, expect, it} from 'vitest';
import {evaluateNarrationFit, type AudioInfo} from '../src/utils/audio';

const audio = (overrides: Partial<AudioInfo> = {}): AudioInfo => ({
  durationSeconds: 3,
  sampleRate: 48000,
  channels: 1,
  codec: 'pcm_s16le',
  ...overrides,
});

describe('evaluateNarrationFit', () => {
  it('accepts narration that fits inside its scene at 48 kHz', () => {
    expect(
      evaluateNarrationFit({sceneId: 'intro', sceneSeconds: 4, narration: audio()}),
    ).toEqual([]);
  });

  it('accepts a small measurement overshoot within the epsilon', () => {
    const issues = evaluateNarrationFit({
      sceneId: 'intro',
      sceneSeconds: 4,
      narration: audio({durationSeconds: 4.03}),
    });

    expect(issues).toEqual([]);
  });

  it('errors when narration would be cut off by the scene boundary', () => {
    const issues = evaluateNarrationFit({
      sceneId: 'principle',
      sceneSeconds: 4,
      narration: audio({durationSeconds: 5.54}),
    });

    const error = issues.find((issue) => issue.severity === 'error');
    expect(error?.message).toContain('would be cut off');
    expect(error?.message).toContain('5.54s');
    expect(error?.message).toContain('4.00s');
  });

  it('warns when narration covers less than half the scene', () => {
    const issues = evaluateNarrationFit({
      sceneId: 'outro',
      sceneSeconds: 5,
      narration: audio({durationSeconds: 1}),
    });

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('warning');
    expect(issues[0]?.message).toContain('20%');
  });

  it('warns about a non-48 kHz sample rate without failing', () => {
    const issues = evaluateNarrationFit({
      sceneId: 'intro',
      sceneSeconds: 4,
      narration: audio({sampleRate: 44100}),
    });

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('warning');
    expect(issues[0]?.message).toContain('44100 Hz');
  });

  it('reports fit and format problems independently', () => {
    const issues = evaluateNarrationFit({
      sceneId: 'intro',
      sceneSeconds: 4,
      narration: audio({durationSeconds: 1, sampleRate: 22050}),
    });

    expect(issues.map((issue) => issue.severity)).toEqual(['warning', 'warning']);
  });
});
