# Portfolio Motion Studio

A local-first, AI-assisted pipeline for producing cinematic portfolio and
technical project videos from code.

Built with **Remotion**, **React** and **TypeScript**. Content lives in typed
data; components are reusable; rendering is deterministic and entirely local.

> **Status — Phase 1 complete (rendering foundation).**
> Three cinematic scenes render to a verified 10-second 1080p MP4. Scene
> manifests, voiceover, timelines, diagrams and the AI production skills are
> Phases 2–4 (see [Roadmap](#roadmap)).

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
npm run still:sample           # single poster frame (frame 150) → out/cinematic-sample-poster.png
npm run compositions           # list registered compositions
npm run typecheck              # strict TypeScript check
```

The first render downloads Remotion's headless Chrome and bundles the project;
later renders reuse both caches.

### Verified output

The Phase 1 sample was rendered and inspected with FFprobe:

```
Final:   H.264 · 1920×1080 · 30 fps · 10.000 s · 1.67 MB
Preview: H.264 ·  960×540  · 30 fps · 10.000 s · 0.61 MB
```

---

## Project structure

```text
src/
├── index.ts                 # Remotion entry point
├── Root.tsx                 # Composition registry
├── compositions/
│   └── CinematicSample.tsx  # Phase 1 sample: intro → statement → outro
├── components/
│   ├── CinematicIntro.tsx
│   ├── TitleStatement.tsx
│   ├── CinematicOutro.tsx
│   └── primitives/
│       ├── Backdrop.tsx     # Layered gradients, grid, vignette
│       ├── Chrome.tsx       # Top chrome + side rail
│       ├── RevealText.tsx   # Masked, staggered line reveal
│       ├── BrandMark.tsx    # SVG monogram plate
│       └── SceneFade.tsx    # Fade-in/out scene envelope
├── content/
│   ├── types.ts             # Content-layer types (no React)
│   └── sample.ts            # Placeholder content for the sample
├── theme/                   # Design tokens: color, type, motion, dimensions
└── utils/
    └── timing.ts            # Seconds ⇄ frames, scene progress
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
| 2 | Scene manifest schema, registry, voiceover, transitions | ⬜ next |
| 3 | Timeline, image showcase, architecture diagram, data flow; career-journey + project-showcase compositions | ⬜ |
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
