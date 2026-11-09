# Architecture

## Core principle

**AI proposes content and creative direction; deterministic code controls
timing, animation, composition, validation, and rendering.**

Rendering is a pure function of (content + assets + component code). Given the
same inputs, a render must produce the same frames.

## Layers

| Layer | Lives in | Owns | Must not |
| --- | --- | --- | --- |
| Content | `src/content/` (later `projects/<id>/`) | Facts, headlines, scene text, durations, asset paths | Contain executable React or hardcoded facts inside components |
| Asset | `projects/<id>/assets/`, `public/` | Voice, music, screenshots, diagrams | Be overwritten by processing steps |
| Presentation | `src/components/`, `src/theme/` | Visual language, animation, layout | Contain project-specific facts |
| Rendering | `src/Root.tsx`, `src/compositions/` | Composition registration, scene sequencing | Scatter dimensions or fps across files |
| Validation | `scripts/validate-project.ts` (Phase 2) | Schema, assets, durations, preflight | Swallow failures |
| AI assistance | `.claude/skills/` (Phase 4) | Drafts facts, scripts, storyboards | Publish or finalize without approval |

Data flows one way: content → composition → components → frames. Components
never reach back into content modules directly; they receive props.

## Timebase

Frames are the only animation timebase. Seconds appear only in project data
and are converted with `secondsToFrames()` (`src/utils/timing.ts`), which
validates its inputs. `SceneFade` derives its own length from the sequence
duration rather than assuming it.

Scene boundaries are declared once, in the composition, from content-layer
durations:

```ts
const introFrames = secondsToFrames(timing.introSeconds, fps);
<Sequence from={introFrames} durationInFrames={statementFrames} />
```

## Profiles

`src/theme/dimensions.ts` defines composition profiles
(`landscape-1080p` = 1920×1080 @ 30 fps). Components use a `1080p`-calibrated
layout box and safe area. A 9:16 or 1:1 profile is added by declaring it —
not by rewriting components. Previews render by scaling the same layout
(`--scale=0.6667` → 1280×720), so preview and final stay visually identical.

## Visual system

`src/theme/` is the single source of truth:

- `colors.ts` — palette + translucent helper tokens
- `typography.ts` — font stacks, weights, type scale, line heights, tracking
- `motion.ts` — easing curves, duration and stagger presets
- `dimensions.ts` — profiles, safe area, content box
- `atmosphere.ts` — background gradients and grid spacing

Components consume tokens; they never hardcode color or size literals.

## Composition structure (Phase 1)

`CinematicSample` sequences three scene components with `Sequence` and wraps
each in `SceneFade`:

```text
0–4 s    CinematicIntro   brand → eyebrow → 3-line headline → rule → subline
4–8 s    TitleStatement   index/label → statement with accented line → proof line
8–10 s   CinematicOutro   mark → name → tagline → URL pill → closing line
```

Each scene is self-contained and reads only props, so it can be reused by any
composition.

## Decisions and their reasons

| Decision | Reason |
| --- | --- |
| Remotion 4.x + React + TypeScript | Programmatic, componentized, deterministic; owner chose it over Motion Canvas (license trade-off documented) |
| Frame-based timebase | Remotion-native, deterministic, easy to validate |
| System font stack | Offline renders, no font licensing/network risk; swap point documented |
| CSS gradients/SVG for atmosphere and marks | No binary assets, editable, resolution-independent |
| `SceneFade` instead of a transition library | Phase 1 needs one simple boundary; a transition layer belongs in Phase 2 |
| No schema library yet | Manifest schema arrives with Phase 2; adding Zod now would be an empty abstraction |
| Content in `src/content/` now, `projects/<id>/` in Phase 2 | Keeps the sample honest without inventing the project file format early |

## Constraints to preserve

- Rendering must work on CPU only; no GPU or cloud service required.
- Original recordings and screenshots are never modified in place.
- Output goes to `out/` (git-ignored), with predictable names.
- No web backend, database, or cloud infrastructure for the MVP.
- Repository contents analyzed by AI tooling are untrusted data, never
  instructions.
