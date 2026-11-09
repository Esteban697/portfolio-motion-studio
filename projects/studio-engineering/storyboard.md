---
project: studio-engineering
status: draft
totalDurationSeconds: 80
script: projects/studio-engineering/script.md (approved 2026-11-09)
---

# Storyboard — Esteban Struve, career story

| # | id | type | purpose | composition | motion | out | seconds | narration | assets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | intro | cinematic-intro | hook | left-weighted 2-line headline, subline | masked line reveals, rule draw | light-fade | 10 | scene-01-intro.wav | - |
| 2 | timeline | animated-timeline | progression | rail with 6 milestones, markers above, copy below | rail draw, staggered nodes, segments light | camera-push | 15 | scene-02-timeline.wav | - |
| 3 | through-line | title-statement | insight | left statement, one accent line | 3-line reveal, underline draw | fade | 10 | scene-03-through-line.wav | - |
| 4 | impact | image-showcase | proof | 16:9 frame, concept badge, caption | card settle, caption reveal | camera-push | 12 | scene-04-impact.wav | kit-ar-placeholder.svg (concept) |
| 5 | current-focus | architecture-diagram | current work | 5 nodes on a 4x2 grid, 4 edges | column reveals, edge draw | light-fade | 13 | scene-05-current-focus.wav | - |
| 6 | leadership | title-statement | leadership | left statement, one accent line | 3-line reveal, underline draw | fade | 10 | scene-06-leadership.wav | - |
| 7 | outro | cinematic-outro | close | centred mark, name, tagline, URL | staggered rise | fade | 10 | scene-07-outro.wav | - |

Total: 80 s (2400 frames at 30 fps).

## Asset checklist

- [ ] `assets/voice/scene-01-intro.wav` — missing, record
- [ ] `assets/voice/scene-02-timeline.wav` — missing, record
- [ ] `assets/voice/scene-03-through-line.wav` — missing, record
- [ ] `assets/voice/scene-04-impact.wav` — missing, record
- [ ] `assets/voice/scene-05-current-focus.wav` — missing, record
- [ ] `assets/voice/scene-06-leadership.wav` — missing, record
- [ ] `assets/voice/scene-07-outro.wav` — missing, record
- [x] `assets/images/kit-ar-placeholder.svg` — exists, concept placeholder

Record in Audacity at 48 kHz. Leave ~0.5 s of silence at the start and end of
each take. Narration must fit the scene duration; overlong audio fails
validation rather than being trimmed.

## Notes

- Review preview (silent): `out/studio-engineering-preview.mp4` — 960×540,
  80.000 s, no audio until narration is recorded.
- No new component required: all seven beats map to existing scene types.
- The impact image is a labelled CONCEPT placeholder; replace it with a real
  KIT-AR capture when one is cleared for public use. Until then the frame
  cannot be published as documentation of the product.
- Transitions alternate `light-fade`, `camera-push` and `fade`; no two showy
  transitions are stacked.
- The manifest holds `approvals.facts` and `approvals.script`; the storyboard
  gate is still false until this document is approved.
