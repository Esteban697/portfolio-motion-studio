# Portfolio Motion Studio

A local-first, AI-assisted pipeline for producing cinematic portfolio and
technical project videos from code.

Built with **Remotion**, **React** and **TypeScript**. Content lives in typed
data; components are reusable; rendering is deterministic and entirely local.

> **Status — Phase 3 in progress.**
> Phase 2 is complete: manifests, registry, voiceover, validation,
> transitions and two samples. Phase 3 has added the **animated timeline** and
> **architecture diagram** scenes, both demonstrated in the 82-second
> overview. Image showcase, data flow, and the career-journey / project
> showcase compositions are next.

---

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Node.js | `>= 20`. Verified on Node 26.13.0. |
| npm | Verified on npm 12.0.2. |
| FFmpeg / FFprobe | Optional for rendering, required for audio inspection and output validation. Verified on FFmpeg 9.0. |
| Disk | ~200 MB for dependencies + ~130 MB for Remotion's headless Chrome (downloaded on first render). |

No GPU, paid service or cloud account is required.

## Quick start

```bash
npm install          # install dependencies
npm run dev          # open Remotion Studio at http://localhost:3000
```

In Studio, select **CinematicSample** in the sidebar to preview the film and
scrub the timeline.

### Render commands

```bash
npm run render:sample          # 1920×1080 H.264 MP4 → out/cinematic-sample-1080p.mp4
npm run render:sample:preview  # 960×540 preview (scale 0.5) → out/cinematic-sample-preview.mp4
npm run render:overview        # 82 s overview → out/studio-overview-1080p.mp4
npm run render:overview:preview
npm run still:sample           # single poster frame (frame 150) → out/cinematic-sample-poster.png
npm run compositions           # list registered compositions
npm run assets                 # regenerate the static asset registry
npm run typecheck              # strict TypeScript check
npm test                       # schema, timeline, registry, audio and asset tests
npm run validate -- --project studio-sample   # validate a project manifest
```

`npm run assets` scans each manifest's voiceover paths and regenerates
`src/generated/project-assets.ts`, because Remotion needs static imports rather
than runtime paths. It runs automatically before `dev`, `typecheck`, `test` and
each render.

`npm run validate` checks JSON syntax, the manifest schema, scene ids, supported
scene types, the profile and the frame timeline, and prints the scene table
with total duration. Invalid manifests fail with one line per issue:

```text
✗ Invalid manifest: projects\studio-sample\manifest.json
  - scenes.0.durationSeconds: Invalid input: expected number, received undefined
  - scenes.0: Unrecognized key: "durationSecond"
```

The same validation runs when Remotion loads the project, so a broken manifest
cannot render silently.

The first render downloads Remotion's headless Chrome and bundles the project;
later renders reuse both caches.

### Verified output

Both samples were rendered and inspected with FFprobe:

```
Sample    H.264 · 1920×1080 · 30 fps · 15.500 s ·  2.65 MB | AAC 48 kHz stereo
Preview   H.264 ·  960×540  · 30 fps · 15.509 s ·  1.31 MB | AAC 48 kHz
Overview  H.264 · 1920×1080 · 30 fps · 82.005 s · 11.67 MB | AAC 48 kHz stereo
```

Silence analysis of each file places speech at every scene boundary: 0.0,
4.1 and 10.1 s in the sample; 0, 11.1, 21.1, 31.1, 41.1, 51.6, 61.6 and
71.6 s in the overview.

---

## Project structure

```text
projects/
├── studio-sample/           # 15.5 s pipeline sample
│   ├── manifest.json
│   └── assets/voice/
└── studio-overview/         # 82 s overview, eight scenes
    ├── manifest.json
    └── assets/voice/

src/
├── index.ts                 # Remotion entry point
├── Root.tsx                 # Composition registry; validates the manifest once
├── compositions/
│   └── ProjectVideo.tsx     # Manifest → timeline → sequences + audio
├── scenes/
│   └── registry.tsx         # Scene type → component, exhaustive by type
├── schemas/
│   └── project-schema.ts    # Zod manifest schema + inferred content types
├── components/
│   ├── CinematicIntro.tsx
│   ├── TitleStatement.tsx
│   ├── CinematicOutro.tsx
│   ├── timeline/
│   │   ├── AnimatedTimeline.tsx
│   │   └── layout.ts        # milestone spacing (pure, tested)
│   ├── diagram/
│   │   ├── ArchitectureDiagram.tsx
│   │   └── layout.ts        # grid placement + edge paths (pure, tested)
│   ├── primitives/
│   │   ├── Backdrop.tsx     # Layered gradients, grid, vignette
│   │   ├── Chrome.tsx       # Top chrome + side rail
│   │   ├── RevealText.tsx   # Masked, staggered line reveal
│   │   ├── SceneHeading.tsx # Index/label + revealed headline
│   │   └── BrandMark.tsx    # SVG monogram plate
├── transitions/
│   ├── transitions.ts       # Envelope math (pure functions)
│   └── SceneTransition.tsx  # Applies enter/exit envelopes per scene
├── theme/                   # Design tokens: color, type, motion, dimensions
├── generated/
│   └── project-assets.ts    # AUTO-GENERATED asset path → URL registry
├── types/
│   └── assets.d.ts          # Audio import declarations
└── utils/
    ├── timing.ts            # Seconds ⇄ frames, scene progress
    ├── project.ts           # Scene timeline and total duration
    ├── assets.ts            # Asset resolution + dB → gain
    └── audio.ts             # FFprobe inspection + narration fit rules

scripts/
├── generate-assets.ts       # Scans manifests → generated asset registry
└── validate-project.ts      # Manifest + narration validation CLI

test/                        # Vitest suites: schema, timeline, registry, timing, audio, assets
```

The theme is the only place colors, fonts, sizes and easings are declared.
Components never hardcode a palette value, and content is never hardcoded
into components.

## Design system

| Token | Value | Use |
| --- | --- | --- |
| Midnight | `#080D19` | Background |
| Deep blue | `#172B45` | Surfaces, panels |
| Cyan | `#31C5D9` | Highlights, active ideas |
| Silver | `#E8EDF5` | Primary type |
| Muted blue-grey | `#8EA0B8` | Supporting type |

See [docs/visual-style-guide.md](docs/visual-style-guide.md) for the full
system and [docs/architecture.md](docs/architecture.md) for layer boundaries.

## Fonts

No webfont is downloaded at render time. The stack resolves to an installed
font — Inter if present, otherwise Segoe UI (Windows) or the system UI font.
Renders stay offline and deterministic. To bundle a brand font, see
[docs/visual-style-guide.md](docs/visual-style-guide.md#custom-fonts), and
record its license.

## Narration

One WAV per scene at `projects/<id>/assets/voice/`, referenced from the manifest:

```json
"voiceover": { "src": "assets/voice/scene-01-intro.wav", "volumeDb": -2 }
```

`npm run validate` checks the file exists, decodes it with FFprobe and compares
its duration to the scene:

- narration **longer** than the scene is an error — Remotion would cut it off;
- narration covering less than half the scene warns about unintended silence;
- a sample rate other than 48 kHz warns.

Durations are reported, never auto-adjusted: fix the manifest or the recording.

The bundled sample uses **TTS placeholder narration** (see
`projects/studio-sample/assets/voice/README.md`). Replace those files with your
own 48 kHz recordings — the pipeline never modifies original audio.

## Transitions

Each scene names the transition **leaving** it (`transitionOut`). The incoming
scene enters with the previous scene's transition, so both sides match and the
timeline stays exact — transitions never overlap scenes or change duration.

| Name | Enter / exit frames | Look |
| --- | --- | --- |
| `cut` | 0 / 0 | hard cut (default) |
| `fade` | 12 / 12 | dip through black |
| `light-fade` | 14 / 10 | bloom through a soft silver light |
| `camera-push` | 20 / 16 | forward dolly; exit pushes in, entrance settles |

Short scenes compress their transitions automatically rather than inverting
the curves.

## Licensing

**Remotion is source-available, not OSI-approved open source.** It is free for
individuals, non-profits, for-profit organizations with up to 3 employees, and
evaluation use. Larger for-profit organizations require a paid Company License.

This project targets personal/individual use. If that changes, verify
eligibility before further use. Full notes:
[docs/licensing.md](docs/licensing.md).

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Environment + license reconnaissance | ✅ complete |
| 1 | Remotion foundation, theme, intro/title/outro, 10 s sample | ✅ complete |
| 2 | Scene manifest schema, registry, voiceover, transitions | ✅ complete |
| 3 | Timeline, image showcase, architecture diagram, data flow; career-journey + project-showcase compositions | 🟨 in progress — timeline + architecture diagram done; image showcase, data flow, project compositions next |
| 4 | Claude Code production skills + approval workflow | ⬜ |
| 5 | Web-optimized output, poster, embedding docs, social aspect ratios | ⬜ |

## Documentation

- [docs/architecture.md](docs/architecture.md) — layers, decisions, constraints
- [docs/production-workflow.md](docs/production-workflow.md) — how a video gets made, approval gates
- [docs/visual-style-guide.md](docs/visual-style-guide.md) — palette, type, motion rules
- [docs/adding-a-video.md](docs/adding-a-video.md) — create a new composition
- [docs/licensing.md](docs/licensing.md) — Remotion license notes

## Privacy and safety

The pipeline is local by default. No project files, recordings or renders are
sent to any external service. Any future LLM-assisted step must be explicit,
optional, and must never receive credentials or private material without
consent.
