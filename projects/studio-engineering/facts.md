---
project: studio-engineering
status: draft
analyzed: 2026-11-09
sources:
  - repository: portfolio-motion-studio (local working copy)
---

# Portfolio Motion Studio — facts (draft)

Draft analysis for a technical portfolio video about this repository. Every
claim below is tied to a file. This document is **not approved** and must not
be used for a production render until the owner has reviewed it.

## Purpose

- Local-first pipeline that turns a validated JSON manifest into a video using
  React components and Remotion. [README.md (intro)]
- Deterministic by design: content plus assets plus component code produce the
  same frames. [docs/architecture.md (Core principle)]
- Explicitly not a general-purpose video editor. [README.md (intro)]

## Stack

- Remotion `4.0.542`, React `19.3.1`, React DOM `19.3.1`,
  TypeScript `5.9.3`. [package.json (dependencies, devDependencies)]
- Zod `4.6.7` for manifest validation; Vitest `5.1.0` for tests; `tsx` runs
  the CLI scripts. [package.json]
- FFprobe is used to inspect narration and final output. [src/utils/audio.ts
  (probeAudio); docs/production-workflow.md (Gates)]
- Rendering runs locally; no GPU, cloud service or paid render service is
  required by the MVP. [README.md (Prerequisites); docs/architecture.md
  (Constraints to preserve)]

## Architecture

- A manifest is parsed and validated once at startup; invalid content throws a
  readable error instead of rendering. [src/Root.tsx (parseProjectManifest);
  src/schemas/project-schema.ts (projectManifestSchema)]
- Scene types are mapped to components by an exhaustive registry; a missing
  registry entry is a TypeScript error. [src/scenes/registry.tsx (sceneRegistry,
  SceneRegistry)]
- One `Sequence` per scene is placed on a frame timeline; narration is rendered
  inside the scene's sequence. [src/compositions/ProjectVideo.tsx (ProjectVideo)]
- Scene durations are rounded to frames per scene and then summed, so rounding
  cannot desynchronise the composition length. [src/utils/project.ts
  (buildSceneTimeline)]
- Transitions are in-scene envelopes, not overlaps, so scene durations and
  narration sync stay exact. [src/transitions/transitions.ts (transitionSpecs)]
- Assets are resolved through a generated module because Remotion needs static
  imports, not runtime paths. [scripts/generate-assets.ts; src/utils/assets.ts
  (resolveProjectAsset)]

## Capabilities

- Seven scene types: intro, title statement, animated timeline, architecture
  diagram, image showcase, data flow, outro. [src/schemas/project-schema.ts
  (supportedSceneTypes)]
- Four transitions: `cut`, `fade`, `light-fade`, `camera-push`.
  [src/schemas/project-schema.ts (transitionNames)]
- Narration checks: overlong audio is an error; under-half coverage and non-48
  kHz files warn. [src/utils/audio.ts (evaluateNarrationFit)]
- A validation CLI reports schema, timeline, narration and approval state.
  [scripts/validate-project.ts (main)]
- Approval gates for facts, script, storyboard and final render are recorded in
  the manifest; `--final` fails unless all are approved.
  [src/utils/approvals.ts; scripts/validate-project.ts]
- Two narrated sample compositions and two template compositions are
  registered. [src/Root.tsx (RemotionRoot)]
- Automated tests covered schema, timeline, registry, audio, assets,
  transitions and layouts: 117 at analysis time. [test/]

## Engineering decisions worth telling

- Strict manifests: unknown fields are errors, so typos fail loudly.
  [src/schemas/project-schema.ts (strictObject usage)]
- Content, schema, presentation and rendering are separate layers; components
  receive props and never read manifests. [docs/architecture.md (Layers)]
- Preview renders scale the 1080p layout (`--scale=0.5`); Remotion requires
  integer, even dimensions. [docs/architecture.md (Profiles)]
- No webfonts at render time; the system font stack keeps renders offline.
  [src/theme/typography.ts (fontFamily)]

## Constraints and risks

- Remotion is source-available, not OSI open source; the free license covers
  individuals, non-profits and for-profit organisations with up to three
  employees. [docs/licensing.md (Remotion)]
- H.264 output requires even integer dimensions, which constrains preview
  scales. [docs/architecture.md (Profiles)]
- Narration must fit its scene; the pipeline reports mismatch rather than
  trimming or stretching. [src/utils/audio.ts (evaluateNarrationFit)]

## Assumptions

- The project targets personal portfolio use (stated intent, not a technical
  constraint). [docs/licensing.md (Project decision)]
- Render times on a laptop are acceptable; this has not been measured.
- The two project compositions are templates until real content replaces their
  placeholders. [projects/career-journey/README.md;
  projects/project-showcase/README.md]

## Open questions

- Which real project or career story should be the first production video?
- When will the owner record narration, and for which scenes?
- Is a 9:16 or 1:1 format wanted after the landscape version stabilises?
  [docs/architecture.md (Profiles)]

## Must not appear on camera

- Any performance, adoption or deployment claim that was not measured.
- Repository secrets or environment values (none were read for this analysis).
- Claims that a template composition is finished, approved content.
