import {describe, expect, it} from 'vitest';
import manifest from '../projects/studio-sample/manifest.json';
import {projectManifestSchema} from '../src/schemas/project-schema';
import {dbToGain, resolveProjectAsset} from '../src/utils/assets';

const project = projectManifestSchema.parse(manifest);

describe('resolveProjectAsset', () => {
  it('resolves every voiceover referenced by the sample manifest', () => {
    const voiceovers = project.scenes
      .map((scene) => scene.voiceover)
      .filter((voiceover): voiceover is NonNullable<typeof voiceover> => voiceover !== undefined);

    expect(voiceovers).toHaveLength(3);

    for (const voiceover of voiceovers) {
      const resolved = resolveProjectAsset(project.projectId, voiceover.src);
      expect(typeof resolved).toBe('string');
      expect(resolved.length).toBeGreaterThan(0);
    }
  });

  it('throws for an unregistered asset path', () => {
    expect(() => resolveProjectAsset(project.projectId, 'assets/voice/missing.wav')).toThrow(
      /not registered/,
    );
  });

  it('throws for an unknown project', () => {
    expect(() => resolveProjectAsset('no-such-project', 'assets/voice/a.wav')).toThrow(
      /No assets are registered/,
    );
  });
});

describe('dbToGain', () => {
  it('leaves narration at unity when no gain is set', () => {
    expect(dbToGain(undefined)).toBe(1);
    expect(dbToGain(0)).toBe(1);
  });

  it('converts attenuation to linear gain', () => {
    expect(dbToGain(-6)).toBeCloseTo(0.5012, 3);
    expect(dbToGain(-40)).toBeCloseTo(0.01, 3);
  });

  it('never boosts past unity', () => {
    expect(dbToGain(6)).toBe(1);
  });

  it('rejects non-finite values', () => {
    expect(() => dbToGain(Number.NaN)).toThrow(/finite/);
  });
});
