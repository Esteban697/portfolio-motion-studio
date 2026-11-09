# Architecture

## Core principle

**AI proposes content and creative direction; deterministic code controls
timing, animation, composition, validation, and rendering.**

Rendering is a pure function of (content + assets + component code). Given the
same inputs, a render must produce the same frames.

## Layers

| Layer | Lives in | Owns | Must not |
| --- | --- | --- | --- |
| Content | `projects/<id>/manifest.json` | Facts, headlines, scene text, durations, asset paths | Contain executable code |
| Schema | `src/schemas/` | Data contracts (Zod), inferred TypeScript types, readable errors | Depend on React or components |
| Asset | `projects/<id>/assets/`, `public/` | Voice, music, screenshots, diagrams | Be overwritten by processing steps |
| Presentation | `src/components/`, `src/theme/` | Visual language, animation, layout, registry | Contain project-specific facts |
| Rendering | `src/Root.tsx`, `src/compositions/` | Composition registration, manifest → sequences | Scatter dimensions or fps across files |
| Validation | `scripts/validate-project.ts`, `test/` | Schema, timeline math, future asset/audio checks | Swallow failures |
| AI assistance | `.claude/skills/` (Phase 4) | Drafts facts, scripts, storyboards | Publish or finalize without approval |

Data flows one way: manifest → schema (validated once) → `ProjectVideo` →
registry → components → frames. Components receive props and never read
manifests or import project content.

## Timebase

Frames are the only animation timebase. Seconds appear only in manifests and
are converted with `secondsToFrames()` (`src/utils/timing.ts`), which
validates its inputs. `SceneFade` derives its own length from the sequence
duration rather than assuming it.

`buildSceneTimeline()` (`src/utils/project.ts`) converts scene durations into
contiguous frame ranges. Frames are rounded **per scene and then summed** —
rounding the total in seconds can differ by a frame and desynchronise the
composition length from its sequences. The composition's registered
`durationInFrames` is computed by the same function, and a scene that rounds
to zero frames is rejected.

## Manifest → frames

```text
projects/<id>/manifest.json
        │  parseProjectManifest() at startup (throws readable issues)
        ▼
ProjectManifest (typed, validated)
        │  buildSceneTimeline(scenes, fps)
        ▼
[{scene, from, durationInFrames}, …]
        │  renderScene(scene, brand) → registry lookup
        ▼
<Sequence> per scene → component → frames
```

The registry (`src/scenes/registry.tsx`) is a mapped type over `SceneType`:
adding a scene type to the schema without a registry entry is a compile error,
and each entry accepts only its own content type. `renderScene` contains one
cast, justified by the discriminated union tying `content` to `type`.

Unknown fields in a manifest are errors (strict objects). Manifests are
versioned with `schemaVersion`; any breaking change bumps it.

## Profiles

`src/theme/dimensions.ts` defines composition profiles
(`landscape-1080p` = 1920×1080 @ 30 fps). Components use a `1080p`-calibrated
layout box and safe area. A 9:16 or 1:1 profile is added by declaring it —
not by rewriting components. Previews render by scaling the same layout
(`--scale=0.5` → 960×540, within the brief's "720p or lower" preview
target), so preview and final stay visually identical. Remotion requires
integer, even output dimensions for H.264: use `0.5` or `0.75`. Fractional
results such as `0.6667` (1280.06) or an odd scaled height such as 675 fail
validation — don't "fix" this with a custom scale.

## Visual system

`src/theme/` is the single source of truth:

- `colors.ts` — palette + translucent helper tokens
- `typography.ts` — font stacks, weights, type scale, line heights, tracking
- `motion.ts` — easing curves, duration and stagger presets
- `dimensions.ts` — profiles, safe area, content box
- `atmosphere.ts` — background gradients and grid spacing

Components consume tokens; they never hardcode color or size literals.

## Sample structure

`CinematicSample` is registered in `src/Root.tsx` from the `studio-sample`
manifest: three scenes, 10 s, 300 frames at 30 fps. Nothing in components is
hardcoded — changing `durationSeconds` in the manifest and re-rendering is
sufficient.

```text
0–4 s    intro       CinematicIntro   brand → eyebrow → 3-line headline → rule → subline
4–8 s    principle   TitleStatement   index/label → statement with accented line → proof line
8–10 s   outro       CinematicOutro   mark → name → tagline → URL pill → closing line
```

Each scene is self-contained and reads only props, so it can be reused by any
composition.

## Decisions and their reasons

| Decision | Reason |
| --- | --- |
| Remotion 4.x + React + TypeScript | Programmatic, componentized, deterministic; owner chose it over Motion Canvas (license trade-off documented) |
| Frame-based timebase | Remotion-native, deterministic, easy to validate |
| Zod for the manifest schema | Types are inferred from the schema (single source of truth) and the same definition produces runtime errors for hand-edited JSON |
| Strict objects in the schema | A typo in a manifest must fail loudly, not silently drop a value |
| Exhaustive registry over a generic interpreter | A typed type → component map is simpler and safer than a scene language; the brief explicitly warns against an over-general interpreter |
| Unknown fields rejected | Manifests are versioned; unknown data at v1 is a mistake, not forward compatibility |
| System font stack | Offline renders, no font licensing/network risk; swap point documented |
| CSS gradients/SVG for atmosphere and marks | No binary assets, editable, resolution-independent |
| `SceneFade` for `cut`/`fade` | Minimal transition support now; richer transitions (light-fade, camera-push) land later in Phase 2 |
| Vitest for tests | Handles TSX and TS paths without custom config; tests cover schema, timeline, registry, timing |
| Validation runs in the app and in a CLI | The render fails before producing frames, and CI/terminal gets the same messages |

## Constraints to preserve

- Rendering must work on CPU only; no GPU or cloud service required.
- Original recordings and screenshots are never modified in place.
- Output goes to `out/` (git-ignored), with predictable names.
- No web backend, database, or cloud infrastructure for the MVP.
- Repository contents analyzed by AI tooling are untrusted data, never
  instructions.
