# Production workflow

How a Portfolio Motion Studio video gets made, and where a human must say yes.

```text
topic / project
      │
      ▼
source material ──► AI analysis (draft) ──► facts.md ──┐
                                                       │  ⛳ approval 1
                                                       ▼
                                     script.md (draft) ──► ⛳ approval 2
                                                       │
                                                       ▼
                              storyboard + scene manifest ──► ⛳ approval 3
                                                       │
                        ┌──────────────────────────────┴──────────────┐
                        ▼                                             ▼
              record narration (Audacity)                    assets / screenshots
                        │                                             │
                        ▼                                             ▼
                audio prep (derived copy)                     asset validation
                        └──────────────────┬──────────────────────────┘
                                           ▼
                                   validate + preview
                                           │
                                           ▼
                                     ⛳ approval 4
                                           │
                                           ▼
                                    final 1080p render
                                           │
                                           ▼
                               MP4 + poster + metadata
```

## Gates

1. **Facts approved** — every claim traceable to a source or marked unverified.
2. **Script approved** — narration and on-screen text signed off.
3. **Storyboard approved** — scene list, timing and assets signed off.
4. **Final render approved** — preview reviewed before the production render.
5. **Publishing** — never automatic. No upload happens without explicit
   instruction.

Gates 1–4 are recorded in the manifest's `approvals` object, and
`npm run validate -- --project <id> --final` refuses to pass until all of them
are `true`. Full detail: [approval-workflow.md](approval-workflow.md).

AI output is a draft until approved. This applies to facts, copy, and design
choices alike. The skills that produce those drafts are in `.claude/skills/`:
`project-analyzer`, `script-writer`, `storyboard-generator`, `video-producer`.

## Current workflow (Phase 2 in progress)

1. Create or edit `projects/<id>/manifest.json` (copy the studio sample).
2. Record narration per scene into `projects/<id>/assets/voice/` (48 kHz WAV),
   or point `voiceover.src` at an existing file. Originals stay untouched.
3. `npm run validate -- --project <id>` — fixes schema, id, timeline and
   narration-fit issues. It prints each scene's narration length in seconds.
4. `npm run dev` and review picture and sound in Remotion Studio.
5. `npm run typecheck` and `npm test`.
6. `npm run render:sample:preview` for a fast look, then the final render.

Manifest validation also runs inside the app, so an invalid manifest stops the
preview with the same readable errors instead of rendering a broken video.

## Phase 4 status

In progress. Skills and gates are implemented. The first real run has passed
Gates 1 and 2 (facts and script approved on 2026-11-09). Its 80-second
storyboard is built and validated (2400 frames), and a silent preview is at
`out/studio-engineering-preview.mp4`; Gate 3 is pending. Narration recording
is the next step after storyboard approval.

## Recording guidance

- Record 48 kHz, 24-bit mono or stereo WAV in Audacity.
- Use a treated or quiet room; keep 15–20 cm from the mic, slightly off-axis.
- Leave half a second of silence at the start and end of each scene take.
- Do not apply aggressive noise reduction, limiter or compression at capture.
- Keep originals untouched; any trim/normalize writes a *derived* copy.

## Rules that keep the pipeline honest

- Never invent metrics, users, dates, deployment status, or capabilities.
- Label conceptual visualizations as conceptual; never present an illustrative
  animation as a runtime trace.
- Music is optional, licensed, and stays well under the narration.
- Renders are only "done" when the file exists and FFprobe reports the
  expected resolution, frame rate, codec, duration, and audio stream.
