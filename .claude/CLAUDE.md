# Portfolio Motion Studio — project instructions

Local-first Remotion pipeline for cinematic portfolio video. Read
`README.md` and `docs/architecture.md` before changing rendering code.

## Commands

```bash
npm run dev                    # Remotion Studio
npm run typecheck              # strict TS check — run before claiming done
npm run render:sample          # 1080p H.264 → out/
npm run render:sample:preview  # 960×540 (--scale=0.5; H.264 needs even int dims)
npm run still:sample           # poster frame
```

## Invariants (do not violate)

- Content lives in `src/content/` (later `projects/<id>/`). Components receive
  props; they never import project content or hardcode facts.
- Colors, type sizes, easings and dimensions come from `src/theme/`. No
  literals in components.
- Frames are the timebase. Convert seconds only via `src/utils/timing.ts`.
- Renders must stay local, deterministic and offline (no webfonts, no network
  assets).
- Never modify original recordings/screenshots; write derived files elsewhere.
- Never commit secrets, `out/`, or `node_modules/`.
- Do not claim a render succeeded without producing the file and inspecting it
  with FFprobe.

## Status

Phase 1 complete (three scenes + verified 10 s 1080p MP4). Phase 2 is scene
manifests, scene registry, voiceover, transitions. Do not jump ahead to the
Claude Code production skills (Phase 4) or social formats (Phase 5).

## Remotion license

Source-available, not OSI open source. Free for individuals, non-profits and
for-profit orgs ≤ 3 employees. See `docs/licensing.md`.
