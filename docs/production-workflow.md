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

AI output is a draft until approved. This applies to facts, copy, and design
choices alike.

## Phase 1 (what works today)

1. Edit `src/content/sample.ts` (brand, headlines, statement, timings).
2. `npm run dev` and review in Remotion Studio.
3. `npm run typecheck`.
4. `npm run render:sample:preview` for a fast look, then
   `npm run render:sample` for the final.

## Phase 2 additions (planned)

- One `projects/<id>/manifest.json` per video, validated before render.
- One WAV per scene in `projects/<id>/assets/voice/`.
- `npm run validate -- --project <id>` checks schema, assets and audio.
- Explicit check that narration fits its scene; mismatch is reported, not
  silently stretched.

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
