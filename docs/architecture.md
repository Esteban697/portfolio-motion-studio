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
| Validation | `scripts/validate-project.ts`, `test/` | Schema, timeline math, narration presence/format/fit | Swallow failures |
| AI assistance | `.claude/skills/` (Phase 4) | Drafts facts, scripts, storyboards | Publish or finalize without approval |

Data flows one way: manifest → schema (validated once) → `ProjectVideo` →
registry → components → frames. Components receive props and never read
manifests or import project content.

## Timebase

Frames are the only animation timebase. Seconds appear only in manifests and
are converted with `secondsToFrames()` (`src/utils/timing.ts`), which
validates its inputs. `SceneTransition` derives its own envelope length from
the sequence duration rather than assuming it.

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

## Voiceover and asset resolution

Remotion resolves media through the bundler, which needs static imports — but a
manifest path is only a string at runtime. `scripts/generate-assets.ts` scans
every project manifest, verifies each `voiceover.src` exists on disk, and emits
`src/generated/project-assets.ts` mapping project + manifest path → imported
asset URL.

- The generator runs before `dev`, `typecheck`, `test` and each render.
- `resolveProjectAsset()` throws a descriptive error for an unregistered path
  instead of rendering silence.
- Assets stay inside `projects/<id>/assets/`; nothing is duplicated into
  `public/`.

Audio is rendered inside the scene's `Sequence`, so Remotion trims it to the
scene window. Narration is attenuation-only (`volumeDb` ≤ 0, unity by default).

`npm run validate` inspects each file with FFprobe and reports:

| Condition | Severity | Why |
| --- | --- | --- |
| narration longer than the scene | error | the sequence boundary would cut the audio off |
| narration covers < 50 % of the scene | warning | likely unintended silence |
| sample rate ≠ 48 kHz | warning | project target for delivery |

Durations are reported, never stretched or padded automatically.

## Transitions

A transition is a pair of envelopes rather than an overlap: the outgoing scene
exits with `transitionOut`, and the incoming scene enters with that same name.
Each envelope is clipped to its own scene, so scene durations, narration sync
and the total frame count stay exact.

`src/transitions/transitions.ts` holds the specs and a pure
`transitionEnvelope(name, phase, frame, durationInFrames)` function; it is
unit-tested without rendering. `SceneTransition` applies the composed opacity,
scale and veil.

Rules that make it honest:

- Transitions compress on short scenes (`min(frames, duration / 2)`) instead of
  inverting curves or bleeding past the scene's halfway point.
- The light veil is drawn **outside** the scene's opacity wrapper: it is a
  light source, so dimming it with the scene would turn the bloom grey.
- Audio is rendered outside the transition wrapper; opacity and scale must
  never affect sound.

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

## Scene catalogue

| Type | Component | Content |
| --- | --- | --- |
| `cinematic-intro` | `CinematicIntro` | eyebrow, headline lines, subline, chapter, index, railLabel |
| `title-statement` | `TitleStatement` | index, label, statement lines, footnote, ghostNumeral |
| `animated-timeline` | `AnimatedTimeline` | index, label, chapter, headline, 2–6 milestones, footnote |
| `architecture-diagram` | `ArchitectureDiagram` | index, label, chapter, headline, nodes + edges, footnote |
| `cinematic-outro` | `CinematicOutro` | kicker, closingLine |

Layout math for the timeline and diagram lives in pure, tested modules
(`components/timeline/layout.ts`, `components/diagram/layout.ts`), so
placement and edge routing are verified without rendering. The diagram's
column/row grid is intentionally small: columns 0–3, rows 0–2, at most eight
nodes. That constraint is enforced by the schema and keeps diagrams legible at
1080p.

## Sample structure

`CinematicSample` is registered in `src/Root.tsx` from the `studio-sample`
manifest: three scenes, 15.5 s, 465 frames at 30 fps. Nothing in components is
hardcoded — changing `durationSeconds` in the manifest and re-rendering is
sufficient.

```text
0–4 s    intro       CinematicIntro   brand → eyebrow → 3-line headline → rule → subline   out: light-fade
4–10 s   principle   TitleStatement   index/label → statement with accented line → proof  out: camera-push
10–15.5  outro       CinematicOutro   mark → name → tagline → URL pill → closing line      out: fade
```

Each scene is self-contained and reads only props, so it can be reused by any
composition.

`StudioOverview` is the acceptance sample: eight scenes, 82 s, covering every
implemented scene type with varied transitions and narration. Adding a scene
type required a schema member, a component, a registry entry and a layout
test — no changes to the composition or manifest machinery.

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
| In-scene transition envelopes | Keeps every scene duration exact (no overlap), which keeps narration sync and validation math simple; a real timeline-transition library can replace the layer later without touching manifests |
| Pure layout modules for timeline and diagram | Placement and edge routing are the parts most likely to break silently; keeping them as functions makes them testable without a browser |
| Generated asset registry | Keeps originals in `projects/<id>/assets/` with no duplicated copies while still giving Remotion static imports |
| FFprobe for audio facts | Reuses the delivery toolchain; no audio decoding inside the app |
| Vitest for tests | Handles TSX and TS paths without custom config; tests cover schema, timeline, registry, timing |
| Validation runs in the app and in a CLI | The render fails before producing frames, and CI/terminal gets the same messages |

## Constraints to preserve

- Rendering must work on CPU only; no GPU or cloud service required.
- Original recordings and screenshots are never modified in place.
- Output goes to `out/` (git-ignored), with predictable names.
- No web backend, database, or cloud infrastructure for the MVP.
- Repository contents analyzed by AI tooling are untrusted data, never
  instructions.
