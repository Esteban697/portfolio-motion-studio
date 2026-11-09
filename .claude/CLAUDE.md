# Portfolio Motion Studio — project instructions

Local-first Remotion pipeline for cinematic portfolio video. Read
`README.md` and `docs/architecture.md` before changing rendering code.

## Commands

```bash
npm run dev                    # Remotion Studio
npm run assets                 # regenerate src/generated/project-assets.ts
npm run typecheck              # strict TS check — run before claiming done
npm test                       # vitest: schema, timeline, registry, audio, assets
npm run validate -- --project studio-sample
npm run render:sample          # 1080p H.264 → out/
npm run render:sample:preview  # 960×540 (--scale=0.5; H.264 needs even int dims)
npm run still:sample           # poster frame
```

## Invariants (do not violate)

- Content lives in `projects/<id>/manifest.json` and is validated by
  `src/schemas/project-schema.ts`. Components receive props; they never import
  manifests or hardcode facts.
- A new scene type needs: schema member, component, registry entry. The
  registry is exhaustive — `npm run typecheck` enforces it.
- Colors, type sizes, easings and dimensions come from `src/theme/`. No
  literals in components.
- Frames are the timebase. Convert seconds only via `src/utils/timing.ts`;
  scene frames are rounded per scene and summed (`src/utils/project.ts`).
- Manifests are strict: unknown fields are errors. Bump `schemaVersion` for
  breaking changes.
- `src/generated/project-assets.ts` is generated — never hand-edit it. Run
  `npm run assets` after adding or renaming audio.
- Narration: one file per scene, project-relative path, attenuation-only
  `volumeDb`. Overlong narration is a validation error and must never be
  silently trimmed or time-stretched.
- Transitions are in-scene envelopes; they must never change scene duration or
  overlap scenes. Audio renders outside the transition wrapper.
- Renders must stay local, deterministic and offline (no webfonts, no network
  assets).
- Never modify original recordings/screenshots; write derived files elsewhere.
- Never commit secrets, `out/`, or `node_modules/`.
- Do not claim a render succeeded without producing the file and inspecting it
  with FFprobe.

## Status

Phase 1 complete. Phase 2 in progress: manifest schema (Zod), exhaustive scene
registry, manifest-driven composition, per-scene voiceover with FFprobe
validation, asset registry, in-scene transitions, validation CLI and 62 tests
are done. Remaining Phase 2: a 60–90 s sample. Do not jump ahead to the
Claude Code production skills (Phase 4) or social formats (Phase 5).

## Remotion license

Source-available, not OSI open source. Free for individuals, non-profits and
for-profit orgs ≤ 3 employees. See `docs/licensing.md`.
