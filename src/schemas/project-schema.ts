import {z} from 'zod';
import {profileIds} from '../theme/dimensions';

/**
 * Project manifest schema — the contract between content and rendering.
 *
 * A manifest is versioned JSON with no executable code. Everything a
 * composition needs (brand, scene order, durations, on-screen copy) lives
 * here; components receive it as props and never read manifests directly.
 *
 * Objects are strict: an unknown field is an error, because a typo in a
 * hand-edited manifest should fail loudly rather than silently drop data.
 * Any schema change must bump `schemaVersion`.
 */

/** Lowercase kebab-case identifier used for project and scene ids. */
const kebabId = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(64, `${label} must be at most 64 characters`)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${label} must be lowercase kebab-case, e.g. "scene-01"`);

const displayText = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

export const brandSchema = z.strictObject({
  /** Monogram for the brand plate, 1–3 characters. */
  initials: z
    .string()
    .trim()
    .min(1, 'initials are required')
    .max(3, 'initials must be 1–3 characters'),
  name: displayText('name', 80),
  tagline: displayText('tagline', 160),
  /** Display URL only — no protocol. */
  url: z
    .string()
    .trim()
    .min(1, 'url is required')
    .max(80, 'url must be at most 80 characters')
    .refine((value) => !/^[a-z]+:\/\//i.test(value), {
      message: 'url must be a display URL without protocol, e.g. "yourportfolio.dev"',
    }),
});

export type BrandContent = z.infer<typeof brandSchema>;

/** A designed line with an optional cyan accent. */
const accentLine = (label: string) =>
  z.strictObject({
    text: displayText(`${label} text`, 90),
    accent: z.boolean().optional(),
  });

/** A scene may highlight at most one line in cyan. */
const atMostOneAccent = (lines: {accent?: boolean}[], ctx: z.RefinementCtx) => {
  const accents = lines.filter((line) => line.accent === true).length;
  if (accents > 1) {
    ctx.addIssue({
      code: 'custom',
      message: 'at most one line may be accented — cyan is reserved for the single key idea',
    });
  }
};

export const cinematicIntroContentSchema = z.strictObject({
  eyebrow: displayText('eyebrow', 60),
  headline: z
    .array(accentLine('headline'))
    .min(1, 'headline needs at least one line')
    .max(4, 'headline supports at most 4 lines at 1080p')
    .superRefine(atMostOneAccent),
  subline: displayText('subline', 200),
  chapter: displayText('chapter', 40),
  index: displayText('index', 3),
  railLabel: displayText('railLabel', 30),
});

export type CinematicIntroContent = z.infer<typeof cinematicIntroContentSchema>;

export const titleStatementContentSchema = z.strictObject({
  index: displayText('index', 3),
  label: displayText('label', 40),
  lines: z
    .array(accentLine('statement'))
    .min(1, 'statement needs at least one line')
    .max(4, 'statement supports at most 4 lines at 1080p')
    .superRefine(atMostOneAccent),
  footnote: displayText('footnote', 160),
  ghostNumeral: displayText('ghostNumeral', 3),
});

export type TitleStatementContent = z.infer<typeof titleStatementContentSchema>;

export const cinematicOutroContentSchema = z.strictObject({
  kicker: displayText('kicker', 40),
  closingLine: displayText('closingLine', 160),
});

export type CinematicOutroContent = z.infer<typeof cinematicOutroContentSchema>;

/** One milestone on a horizontal timeline. */
export const milestoneSchema = z.strictObject({
  /** Short marker above the node, e.g. "01" or "2024". */
  marker: z
    .string()
    .trim()
    .min(1, 'marker is required')
    .max(6, 'marker must be at most 6 characters'),
  title: displayText('milestone title', 40),
  detail: z.string().trim().max(60, 'detail must be at most 60 characters').optional(),
});

export type MilestoneContent = z.infer<typeof milestoneSchema>;

export const animatedTimelineContentSchema = z.strictObject({
  index: displayText('index', 3),
  label: displayText('label', 40),
  chapter: displayText('chapter', 40),
  headline: displayText('headline', 90),
  milestones: z
    .array(milestoneSchema)
    .min(2, 'a timeline needs at least two milestones')
    .max(6, 'a timeline supports at most six milestones at 1080p'),
  footnote: z.string().trim().max(160, 'footnote must be at most 160 characters').optional(),
});

export type AnimatedTimelineContent = z.infer<typeof animatedTimelineContentSchema>;

/** A box in the architecture diagram, placed on a small column/row grid. */
export const diagramNodeSchema = z.strictObject({
  id: kebabId('node id'),
  label: z
    .string()
    .trim()
    .min(1, 'node label is required')
    .max(28, 'node label must be at most 28 characters'),
  sublabel: z.string().trim().max(28, 'node sublabel must be at most 28 characters').optional(),
  column: z
    .number()
    .int('column must be an integer')
    .min(0, 'column must be 0–3')
    .max(3, 'column must be 0–3'),
  row: z
    .number()
    .int('row must be an integer')
    .min(0, 'row must be 0–2')
    .max(2, 'row must be 0–2'),
  /** Highlights the node as the key piece of the system. */
  accent: z.boolean().optional(),
});

export type DiagramNodeContent = z.infer<typeof diagramNodeSchema>;

export const diagramEdgeSchema = z.strictObject({
  from: kebabId('edge.from'),
  to: kebabId('edge.to'),
  /** Highlights the flow as the important path. */
  accent: z.boolean().optional(),
});

export type DiagramEdgeContent = z.infer<typeof diagramEdgeSchema>;

export const diagramSchema = z
  .strictObject({
    nodes: z
      .array(diagramNodeSchema)
      .min(2, 'a diagram needs at least two nodes')
      .max(8, 'a diagram supports at most eight nodes'),
    edges: z.array(diagramEdgeSchema).max(12, 'a diagram supports at most twelve edges'),
  })
  .superRefine((diagram, ctx) => {
    const ids = new Set<string>();
    const cells = new Set<string>();

    diagram.nodes.forEach((node, index) => {
      if (ids.has(node.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate node id "${node.id}"`,
          path: ['nodes', index, 'id'],
        });
      }
      ids.add(node.id);

      const cell = `${node.column}:${node.row}`;
      if (cells.has(cell)) {
        ctx.addIssue({
          code: 'custom',
          message: `two nodes share column ${node.column}, row ${node.row}`,
          path: ['nodes', index],
        });
      }
      cells.add(cell);
    });

    diagram.edges.forEach((edge, index) => {
      if (!ids.has(edge.from)) {
        ctx.addIssue({
          code: 'custom',
          message: `edge references unknown node "${edge.from}"`,
          path: ['edges', index, 'from'],
        });
      }
      if (!ids.has(edge.to)) {
        ctx.addIssue({
          code: 'custom',
          message: `edge references unknown node "${edge.to}"`,
          path: ['edges', index, 'to'],
        });
      }
      if (edge.from === edge.to) {
        ctx.addIssue({
          code: 'custom',
          message: 'an edge cannot connect a node to itself',
          path: ['edges', index],
        });
      }
    });
  });

export const architectureDiagramContentSchema = z.strictObject({
  index: displayText('index', 3),
  label: displayText('label', 40),
  chapter: displayText('chapter', 40),
  headline: displayText('headline', 90),
  diagram: diagramSchema,
  footnote: z.string().trim().max(160, 'footnote must be at most 160 characters').optional(),
});

export type ArchitectureDiagramContent = z.infer<typeof architectureDiagramContentSchema>;

/**
 * A project-relative POSIX path. Rejects protocols, absolute paths, `..`
 * segments and backslashes so manifests stay portable and cannot escape the
 * project directory.
 */
const projectRelativePath = z
  .string()
  .trim()
  .min(1, 'path is required')
  .max(200, 'path must be at most 200 characters')
  .refine(
    (value) =>
      !/^[a-z][a-z0-9+.-]*:\/\//i.test(value) &&
      !value.startsWith('/') &&
      !value.includes('\\') &&
      !value.split('/').includes('..'),
    {
      message: 'must be a project-relative POSIX path (no protocol, no leading slash, no "..")',
    },
  );

/**
 * Per-scene narration. One file per scene is the supported workflow: it keeps
 * revisions and synchronisation local to a single scene.
 */
export const voiceoverSchema = z.strictObject({
  /** Path relative to the project directory, e.g. "assets/voice/scene-01.wav". */
  src: projectRelativePath,
  /** Gain in dB. Attenuation only: narration is never boosted past unity. */
  volumeDb: z.number().min(-40, 'volumeDb must be at least -40').max(0, 'volumeDb must be at most 0').optional(),
});

export type VoiceoverContent = z.infer<typeof voiceoverSchema>;

/** A screenshot or conceptual image in the showcase scene. */
export const showcaseImageSchema = z.strictObject({
  src: projectRelativePath,
  caption: displayText('caption', 80),
  /**
   * `capture` is a real screenshot; `concept` is an illustration and is
   * labelled as such on screen. Never present a concept as a capture.
   */
  kind: z.enum(['capture', 'concept']).default('capture'),
});

export type ShowcaseImageContent = z.infer<typeof showcaseImageSchema>;

export const imageShowcaseContentSchema = z.strictObject({
  index: displayText('index', 3),
  label: displayText('label', 40),
  chapter: displayText('chapter', 40),
  headline: displayText('headline', 90),
  images: z
    .array(showcaseImageSchema)
    .min(1, 'a showcase needs at least one image')
    .max(3, 'a showcase supports at most three images'),
  footnote: z.string().trim().max(160, 'footnote must be at most 160 characters').optional(),
});

export type ImageShowcaseContent = z.infer<typeof imageShowcaseContentSchema>;

/** One stage in a linear data flow. */
export const dataFlowStageSchema = z.strictObject({
  id: kebabId('stage id'),
  label: displayText('stage label', 24),
  sublabel: z.string().trim().max(28, 'stage sublabel must be at most 28 characters').optional(),
});

export type DataFlowStageContent = z.infer<typeof dataFlowStageSchema>;

export const dataFlowContentSchema = z
  .strictObject({
    index: displayText('index', 3),
    label: displayText('label', 40),
    chapter: displayText('chapter', 40),
    headline: displayText('headline', 90),
    stages: z
      .array(dataFlowStageSchema)
      .min(2, 'a data flow needs at least two stages')
      .max(4, 'a data flow supports at most four stages'),
    footnote: z.string().trim().max(160, 'footnote must be at most 160 characters').optional(),
  })
  .superRefine((content, ctx) => {
    const ids = new Set<string>();
    content.stages.forEach((stage, index) => {
      if (ids.has(stage.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate stage id "${stage.id}"`,
          path: ['stages', index, 'id'],
        });
      }
      ids.add(stage.id);
    });
  });

export type DataFlowContent = z.infer<typeof dataFlowContentSchema>;

/**
 * How a scene leaves. `fade` dips through black; `light-fade` blooms through a
 * soft light; `camera-push` pushes the frame forward; `cut` is hard.
 *
 * Transitions are in-scene envelopes, not overlaps: a scene's duration is
 * exact and the timeline never shifts.
 */
export const transitionNames = ['cut', 'fade', 'light-fade', 'camera-push'] as const;

export type TransitionName = (typeof transitionNames)[number];

/** Fields shared by every scene type. */
const sceneBase = {
  id: kebabId('scene id'),
  /**
   * Scene length in seconds. Converted to frames through the shared timing
   * utility, never used as raw seconds by components.
   */
  durationSeconds: z
    .number()
    .positive('durationSeconds must be greater than 0')
    .max(600, 'durationSeconds must be at most 600'),
  /** Optional narration for this scene. Validated against durationSeconds. */
  voiceover: voiceoverSchema.optional(),
  /** Transition leaving this scene into the next one. */
  transitionOut: z.enum(transitionNames).default('cut'),
};

export const cinematicIntroSceneSchema = z.strictObject({
  ...sceneBase,
  type: z.literal('cinematic-intro'),
  content: cinematicIntroContentSchema,
});

export const titleStatementSceneSchema = z.strictObject({
  ...sceneBase,
  type: z.literal('title-statement'),
  content: titleStatementContentSchema,
});

export const cinematicOutroSceneSchema = z.strictObject({
  ...sceneBase,
  type: z.literal('cinematic-outro'),
  content: cinematicOutroContentSchema,
});

export const animatedTimelineSceneSchema = z.strictObject({
  ...sceneBase,
  type: z.literal('animated-timeline'),
  content: animatedTimelineContentSchema,
});

export const architectureDiagramSceneSchema = z.strictObject({
  ...sceneBase,
  type: z.literal('architecture-diagram'),
  content: architectureDiagramContentSchema,
});

export const imageShowcaseSceneSchema = z.strictObject({
  ...sceneBase,
  type: z.literal('image-showcase'),
  content: imageShowcaseContentSchema,
});

export const dataFlowSceneSchema = z.strictObject({
  ...sceneBase,
  type: z.literal('data-flow'),
  content: dataFlowContentSchema,
});

/**
 * Every scene type the renderer knows. Adding a type requires a component,
 * a registry entry, and a schema member — TypeScript enforces the registry.
 */
export const supportedSceneTypes = [
  'cinematic-intro',
  'title-statement',
  'animated-timeline',
  'architecture-diagram',
  'image-showcase',
  'data-flow',
  'cinematic-outro',
] as const;

export const sceneSchema = z.discriminatedUnion('type', [
  cinematicIntroSceneSchema,
  titleStatementSceneSchema,
  animatedTimelineSceneSchema,
  architectureDiagramSceneSchema,
  imageShowcaseSceneSchema,
  dataFlowSceneSchema,
  cinematicOutroSceneSchema,
]);

export type Scene = z.infer<typeof sceneSchema>;
export type SceneType = Scene['type'];
/** Narrows a scene union member by its `type` literal. */
export type SceneOfType<K extends SceneType> = Extract<Scene, {type: K}>;

const scenesSchema = z
  .array(sceneSchema)
  .min(1, 'a project needs at least one scene')
  .superRefine((scenes, ctx) => {
    const seen = new Set<string>();
    scenes.forEach((scene, index) => {
      if (seen.has(scene.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate scene id "${scene.id}"`,
          path: [index, 'id'],
        });
      }
      seen.add(scene.id);
    });
  });

export const projectManifestSchema = z.strictObject({
  schemaVersion: z.literal(1, 'unsupported schemaVersion — this build supports version 1'),
  projectId: kebabId('projectId'),
  title: displayText('title', 100),
  profile: z.enum(profileIds, `profile must be one of: ${profileIds.join(', ')}`),
  narrative: z
    .strictObject({
      /** One-sentence summary of the video's story. */
      logline: z.string().trim().max(300).optional(),
      /** Intentional length; the validation script reports drift, never enforces. */
      targetDurationSeconds: z.number().positive().max(600).optional(),
    })
    .optional(),
  brand: brandSchema,
  scenes: scenesSchema,
});

export type ProjectManifest = z.infer<typeof projectManifestSchema>;

/** Formats Zod issues as one line per problem, with JSON-style paths. */
export const formatIssues = (error: z.ZodError): string =>
  error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `  - ${path}: ${issue.message}`;
    })
    .join('\n');

/**
 * Parses unknown input (e.g. imported JSON) into a manifest, throwing a
 * readable error. Used at the render boundary so invalid content fails at
 * startup instead of rendering a broken video.
 */
export const parseProjectManifest = (input: unknown): ProjectManifest => {
  const result = projectManifestSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid project manifest:\n${formatIssues(result.error)}`);
  }
  return result.data;
};
