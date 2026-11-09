import {describe, expect, it} from 'vitest';
import manifest from '../projects/studio-sample/manifest.json';
import {projectManifestSchema} from '../src/schemas/project-schema';
import {buildSceneTimeline, calculateProjectDurationInFrames} from '../src/utils/project';

const project = projectManifestSchema.parse(manifest);

describe('scene timeline', () => {
  it('places the sample scenes contiguously at 30 fps', () => {
    const timeline = buildSceneTimeline(project.scenes, 30);

    expect(timeline.map((entry) => entry.from)).toEqual([0, 120, 240]);
    expect(timeline.map((entry) => entry.durationInFrames)).toEqual([120, 120, 60]);
    expect(timeline.map((entry) => entry.scene.id)).toEqual(['intro', 'principle', 'outro']);
  });

  it('reports the total by summing frames, not by rounding total seconds', () => {
    expect(calculateProjectDurationInFrames(project.scenes, 30)).toBe(300);
  });

  it('sums per-scene rounding, which can differ from rounding the total', () => {
    const base = project.scenes[0];
    if (!base) throw new Error('fixture has no scenes');

    const scenes = [
      {...base, id: 'a', durationSeconds: 1.01},
      {...base, id: 'b', durationSeconds: 1.01},
    ];

    // round(1.01 * 30) = 30 per scene → 60.
    // round((1.01 + 1.01) * 30) = round(60.6) = 61 — the wrong value.
    expect(calculateProjectDurationInFrames(scenes, 30)).toBe(60);
  });

  it('rejects scenes that round to zero frames', () => {
    const base = project.scenes[0];
    if (!base) throw new Error('fixture has no scenes');

    const scenes = [{...base, id: 'blink', durationSeconds: 0.01}];

    expect(() => buildSceneTimeline(scenes, 30)).toThrow(/too short/);
  });

  it('throws on an invalid fps rather than producing NaN ranges', () => {
    expect(() => buildSceneTimeline(project.scenes, 0)).toThrow(/fps/);
  });
});
