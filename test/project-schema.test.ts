import {describe, expect, it} from 'vitest';
import manifest from '../projects/studio-sample/manifest.json';
import {
  animatedTimelineContentSchema,
  architectureDiagramContentSchema,
  dataFlowContentSchema,
  formatIssues,
  imageShowcaseContentSchema,
  parseProjectManifest,
  projectManifestSchema,
  showcaseImageSchema,
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
    expect(supportedSceneTypes).toEqual([
      'cinematic-intro',
      'title-statement',
      'animated-timeline',
      'architecture-diagram',
      'image-showcase',
      'data-flow',
      'cinematic-outro',
    ]);
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

const timelineContent = {
  index: '04',
  label: 'The pipeline',
  chapter: 'Pipeline',
  headline: 'From facts to frames.',
  milestones: [
    {marker: '01', title: 'Facts'},
    {marker: '02', title: 'Render'},
  ],
};

const diagramContent = {
  index: '05',
  label: 'The architecture',
  chapter: 'Architecture',
  headline: 'How the pieces connect.',
  diagram: {
    nodes: [
      {id: 'manifest', label: 'Manifest', column: 0, row: 0},
      {id: 'render', label: 'Render', column: 1, row: 0},
    ],
    edges: [{from: 'manifest', to: 'render'}],
  },
};

describe('animated timeline content', () => {
  it('accepts a minimal two-milestone timeline', () => {
    expect(animatedTimelineContentSchema.safeParse(timelineContent).success).toBe(true);
  });

  it('rejects a timeline with fewer than two milestones', () => {
    const result = animatedTimelineContentSchema.safeParse({
      ...timelineContent,
      milestones: [timelineContent.milestones[0]],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path.join('.')).toBe('milestones');
    }
  });

  it('rejects more milestones than the layout supports', () => {
    const milestones = Array.from({length: 7}, (_, index) => ({
      marker: String(index + 1),
      title: `Step ${index + 1}`,
    }));

    expect(animatedTimelineContentSchema.safeParse({...timelineContent, milestones}).success).toBe(
      false,
    );
  });
});

describe('architecture diagram content', () => {
  it('accepts a minimal diagram', () => {
    expect(architectureDiagramContentSchema.safeParse(diagramContent).success).toBe(true);
  });

  it('rejects an edge to an unknown node', () => {
    const result = architectureDiagramContentSchema.safeParse({
      ...diagramContent,
      diagram: {...diagramContent.diagram, edges: [{from: 'manifest', to: 'ghost'}]},
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('unknown node'))).toBe(true);
    }
  });

  it('rejects two nodes in the same grid cell', () => {
    const result = architectureDiagramContentSchema.safeParse({
      ...diagramContent,
      diagram: {
        nodes: [
          {id: 'a', label: 'A', column: 0, row: 0},
          {id: 'b', label: 'B', column: 0, row: 0},
        ],
        edges: [],
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('share column'))).toBe(true);
    }
  });

  it('rejects self-referencing edges and duplicate node ids', () => {
    const result = architectureDiagramContentSchema.safeParse({
      ...diagramContent,
      diagram: {
        nodes: [
          {id: 'a', label: 'A', column: 0, row: 0},
          {id: 'a', label: 'A again', column: 1, row: 0},
        ],
        edges: [{from: 'a', to: 'a'}],
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages.some((message) => message.includes('duplicate node id'))).toBe(true);
      expect(messages.some((message) => message.includes('node to itself'))).toBe(true);
    }
  });

  it('rejects nodes outside the supported grid', () => {
    const result = architectureDiagramContentSchema.safeParse({
      ...diagramContent,
      diagram: {
        nodes: [
          {id: 'a', label: 'A', column: 4, row: 0},
          {id: 'b', label: 'B', column: 0, row: 0},
        ],
        edges: [],
      },
    });

    expect(result.success).toBe(false);
  });
});

const showcaseContent = {
  index: '06',
  label: 'Your assets',
  chapter: 'Project assets',
  headline: 'Your files stay yours.',
  images: [
    {
      src: 'assets/images/workspace-placeholder.svg',
      caption: 'Studio workspace',
      kind: 'concept',
    },
  ],
};

const flowContent = {
  index: '07',
  label: 'The result',
  chapter: 'Data flow',
  headline: 'Same inputs, same frames.',
  stages: [
    {id: 'manifest', label: 'Manifest'},
    {id: 'render', label: 'Render'},
  ],
};

describe('image showcase content', () => {
  it('accepts a showcase with a conceptual image', () => {
    expect(imageShowcaseContentSchema.safeParse(showcaseContent).success).toBe(true);
  });

  it('defaults image kind to capture', () => {
    const result = imageShowcaseContentSchema.safeParse({
      ...showcaseContent,
      images: [{src: 'assets/images/a.png', caption: 'A screenshot'}],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.images[0]?.kind).toBe('capture');
    }
  });

  it('rejects more than three images', () => {
    const images = Array.from({length: 4}, (_, index) => ({
      src: `assets/images/${index}.png`,
      caption: `Image ${index}`,
    }));

    expect(imageShowcaseContentSchema.safeParse({...showcaseContent, images}).success).toBe(false);
  });

  it('rejects paths that escape the project directory', () => {
    expect(showcaseImageSchema.safeParse({src: '../secret.png', caption: 'x'}).success).toBe(false);
    expect(showcaseImageSchema.safeParse({src: '/absolute.png', caption: 'x'}).success).toBe(false);
    expect(showcaseImageSchema.safeParse({src: 'https://x.dev/a.png', caption: 'x'}).success).toBe(
      false,
    );
  });

  it('requires a caption on every image', () => {
    expect(showcaseImageSchema.safeParse({src: 'assets/images/a.png'}).success).toBe(false);
  });
});

describe('data flow content', () => {
  it('accepts a linear flow', () => {
    expect(dataFlowContentSchema.safeParse(flowContent).success).toBe(true);
  });

  it('rejects fewer than two stages', () => {
    expect(
      dataFlowContentSchema.safeParse({...flowContent, stages: [flowContent.stages[0]]}).success,
    ).toBe(false);
  });

  it('rejects more than four stages', () => {
    const stages = Array.from({length: 5}, (_, index) => ({
      id: `stage-${index}`,
      label: `Stage ${index}`,
    }));

    expect(dataFlowContentSchema.safeParse({...flowContent, stages}).success).toBe(false);
  });

  it('rejects duplicate stage ids', () => {
    const result = dataFlowContentSchema.safeParse({
      ...flowContent,
      stages: [
        {id: 'same', label: 'A'},
        {id: 'same', label: 'B'},
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('duplicate stage id'))).toBe(
        true,
      );
    }
  });
});
