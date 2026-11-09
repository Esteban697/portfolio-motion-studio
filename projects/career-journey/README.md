# Career Journey — template

A 64-second template for a personal career story. **Every line is a
placeholder.** It is structured and renderable, not approved content.

## Replace before rendering

1. `brand` — initials, name, tagline, portfolio URL.
2. Scene `intro` — eyebrow, headline, subline.
3. Scene `background` — real milestones: `marker` (year), `title`, `detail`.
   Only dates and roles you can verify.
4. Scene `evolution` — your narrative. Keep at most one accented line.
5. Scene `projects` — replace `assets/images/screenshot-placeholder.svg` with
   real screenshots and set `"kind": "capture"`.
6. Scene `leadership` — your approved current focus.
7. Scene `outro` — closing line and call to action.

## Add narration

Record one 48 kHz WAV per scene into `assets/voice/`, then add to each scene:

```json
"voiceover": { "src": "assets/voice/scene-01.wav" }
```

`npm run validate -- --project career-journey` reports narration length per
scene and fails if the audio does not fit its scene.

## Rules

- Do not invent dates, titles, metrics, responsibilities or outcomes.
- One cyan accent line per statement.
- Screenshots and recordings are yours; originals are never modified.
- Render with `npm run render:career` once content is approved.
