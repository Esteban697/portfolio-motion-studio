# Project Showcase — template

A 62-second template for a technical project explainer. **Every line is a
placeholder.** It is structured and renderable, not approved content.

## Replace before rendering

1. `brand` — project name, initials, one-line tagline, URL.
2. Scene `intro` — the hook.
3. Scene `problem` — the real user need, without invented outcomes.
4. Scene `architecture` — nodes and edges for your actual system. Keep the
   grid small (columns 0–3, rows 0–2, max eight nodes).
5. Scene `request-path` — the real stages, 2–4 of them.
6. Scene `experience` — replace `assets/images/screenshot-placeholder.svg`
   with real product screenshots and set `"kind": "capture"`.
7. Scene `outro` — closing line.

## Add narration

Record one 48 kHz WAV per scene into `assets/voice/`, then add
`"voiceover": { "src": "assets/voice/<file>.wav" }` to each scene.

## Rules

- Never present a conceptual diagram as a runtime trace. The scene footnote
  should say when a flow is illustrative.
- Screenshots must come from the real product.
- No invented metrics, users or deployment claims.
- Render with `npm run render:project` once content is approved.
