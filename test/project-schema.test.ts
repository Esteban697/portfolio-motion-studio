import {describe, expect, it} from 'vitest';
import manifest from '../projects/studio-sample/manifest.json';
import {
  formatIssues,
  parseProjectManifest,
  projectManifestSchema,
  supportedSceneTypes,
} from '../src/schemas/project-schema';

/** Loosely-typed copy of the sample so tests can introduce deliberate faults. */
type MutableScene = {
  id: string;
  type: string;
  durationSeconds: number;
  transitionOut?: string;
  content: Record<string, unknown>;
  [key: string]: unknown;
};

type MutableManifest = {
  schemaVersion: number;
  projectId: string;
  title: string;
  profile: string;
  narrative: Record<string, unknown>;
  brand: Record<string, unknown>;
  scenes: MutableScene[];
  [key: string]: unknown;
};

const mutableManifest = (): MutableManifest =>
  JSON.parse(JSON.stringify(manifest)) as MutableManifest;

const issuePaths = (input: unknown): string[] => {
  const result = projectManifestSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
};

const issueMessages = (input: unknown): string[] => {
  const result = projectManifestSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

const firstScene = (m: MutableManifest): MutableScene => {
  const scene = m.scenes[0];
  if (!scene) throw new Error('fixture has no scenes');
  return scene;
};

describe('project manifest schema', () => {
  it('accepts the bundled studio sample', () => {
    const result = projectManifestSchema.safeParse(manifest);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.projectId).toBe('studio-sample');
    expect(result.data.scenes.map((scene) => scene.id)).toEqual(['intro', 'principle', 'outro']);
    expect(result.data.profile).toBe('landscape-1080p');
  });

  it('declares every supported scene type in the schema union', () => {
    expect(supportedSceneTypes).toEqual(['cinematic-intro', 'title-statement', 'cinematic-outro']);
  });

  it('defaults a missing transitionOut to cut', () => {
    const m = mutableManifest();
    delete firstScene(m).transitionOut;

    const result = projectManifestSchema.safeParse(m);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scenes[0]?.transitionOut).toBe('cut');
    }
  });

  it('accepts every supported transition name', () => {
    for (const transitionOut of ['cut', 'fade', 'light-fade', 'camera-push']) {
      const m = mutableManifest();
      firstScene(m).transitionOut = transitionOut;

      expect(projectManifestSchema.safeParse(m).success).toBe(true);
    }
  });

  it('rejects an unknown transition name', () => {
    const m = mutableManifest();
    firstScene(m).transitionOut = 'wipe';

    expect(issuePaths(m)).toContain('scenes.0.transitionOut');
  });

  it('rejects duplicate scene ids', () => {
    const m = mutableManifest();
    firstScene(m).id = 'outro';

    expect(issueMessages(m).some((message) => message.includes('duplicate scene id "outro"'))).toBe(
      true,
    );
  });

  it('rejects an unknown scene type', () => {
    const m = mutableManifest();
    firstScene(m).type = 'kinetic-text';

    expect(issuePaths(m)).toContain('scenes.0.type');
  });

  it('rejects unknown fields instead of silently dropping them', () => {
    const m = mutableManifest();
    firstScene(m).durationSecond = 4;

    expect(issuePaths(m)).toContain('scenes.0');
    expect(issueMessages(m).some((message) => message.toLowerCase().includes('unrecognized'))).toBe(
      true,
    );
  });

  it('rejects non-positive scene durations', () => {
    const m = mutableManifest();
    firstScene(m).durationSeconds = 0;

    expect(issuePaths(m)).toContain('scenes.0.durationSeconds');
  });

  it('rejects a project id that is not kebab-case', () => {
    const m = mutableManifest();
    m.projectId = 'Studio Sample';

    expect(issuePaths(m)).toContain('projectId');
  });

  it('rejects an unsupported schema version', () => {
    const m = mutableManifest();
    m.schemaVersion = 2;

    expect(issuePaths(m)).toContain('schemaVersion');
  });

  it('rejects an unsupported profile', () => {
    const m = mutableManifest();
    m.profile = 'portrait-1080p';

    expect(issuePaths(m)).toContain('profile');
  });

  it('rejects scene content that does not match the scene type', () => {
    const m = mutableManifest();
    delete firstScene(m).content.headline;

    expect(issuePaths(m).some((path) => path.startsWith('scenes.0.content'))).toBe(true);
  });

  it('rejects more than one accented line per scene', () => {
    const m = mutableManifest();
    const headline = firstScene(m).content.headline as {text: string; accent?: boolean}[];
    for (const line of headline) {
      line.accent = true;
    }

    expect(issueMessages(m).some((message) => message.includes('at most one line'))).toBe(true);
  });

  it('rejects a brand URL that includes a protocol', () => {
    const m = mutableManifest();
    m.brand.url = 'https://example.dev';

    expect(issueMessages(m).some((message) => message.includes('without protocol'))).toBe(true);
  });

  it('formats issues one per line with readable paths', () => {
    const m = mutableManifest();
    m.projectId = 'Bad_Id';

    const result = projectManifestSchema.safeParse(m);
    expect(result.success).toBe(false);
    if (result.success) return;

    const formatted = formatIssues(result.error);
    expect(formatted).toContain('  - projectId:');
    expect(formatted.split('\n').length).toBe(result.error.issues.length);
  });

  it('throws a readable error from parseProjectManifest', () => {
    const m = mutableManifest();
    m.scenes = [];

    expect(() => parseProjectManifest(m)).toThrow(/Invalid project manifest:[\s\S]*at least one scene/);
  });
});
