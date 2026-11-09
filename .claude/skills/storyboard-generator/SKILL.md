---
name: storyboard-generator
description: Convert an approved script into a scene-by-scene storyboard and a valid project manifest using existing scene components. Use after the script is approved, when planning visuals, scene timing, transitions or required assets.
---

# Storyboard Generator

Write `projects/<project-id>/storyboard.md` (for human review) and keep
`projects/<id>/manifest.json` (the machine truth) in sync with it.

## Preconditions

- `facts.md` and `script.md` both say `status: approved`.
- If either is a draft, stop and ask for approval.

## Hard rules

- **Use only existing scene types.** If no existing type expresses a beat,
  write `NEW COMPONENT REQUIRED: <what> — <why>` in the storyboard and stop
  for approval. Never create a component, schema type or registry entry
  yourself.
- Scene duration must fit narration. Audio longer than its scene is a
  validation error because Remotion would cut it off; leave at least ~0.3 s
  of air after the last word.
- At most one accented line per intro or statement.
- Vary transitions, but never stack two showy ones back to back.
- Asset paths are project-relative: `assets/voice/scene-01.wav`,
  `assets/images/...`. Never absolute paths, URLs, or `..`.
- Illustrative images must use `"kind": "concept"`; screenshots use
  `"kind": "capture"`.
- Do not invent assets. List every required file and whether it exists.

## Available scene types

| Type | Content fields | Limits |
| --- | --- | --- |
| `cinematic-intro` | eyebrow, headline lines, subline, chapter, index, railLabel | 1-4 headline lines, 1 accent |
| `title-statement` | index, label, lines, footnote, ghostNumeral | 1-4 lines, 1 accent |
| `animated-timeline` | index, label, chapter, headline, milestones, footnote | 2-6 milestones |
| `architecture-diagram` | index, label, chapter, headline, diagram, footnote | <= 8 nodes on columns 0-3 / rows 0-2, <= 12 edges |
| `image-showcase` | index, label, chapter, headline, images, footnote | 1-3 images, caption required |
| `data-flow` | index, label, chapter, headline, stages, footnote | 2-4 stages, linear only |
| `cinematic-outro` | kicker, closingLine | - |

Every scene also has `id` (kebab-case), `type`, `durationSeconds`,
`transitionOut` (`cut`, `fade`, `light-fade`, `camera-push`) and optional
`voiceover: {src, volumeDb?}`.

## Process

1. Read `script.md`, `facts.md` and the current manifest.
2. For each scene choose: id, type, purpose, visual composition, motion beats,
   transition out, duration, on-screen text, required assets.
3. Map script text into the type's content fields exactly (no extra keys —
   manifests are strict).
4. Write `storyboard.md`, then update `manifest.json` scenes to match.
5. Run `npm run validate -- --project <id>` and fix reported problems.
   `npm run assets` runs automatically before renders.
6. If the project is new, add one `registerProject(...)` line in
   `src/Root.tsx` and render scripts only after the storyboard is approved.

## Output: `projects/<id>/storyboard.md`

```md
---
project: <project-id>
status: draft
totalDurationSeconds: 72
---

# Storyboard

| # | id | type | purpose | composition | motion | out | seconds | narration | assets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | intro | cinematic-intro | hook | left-weighted, 3-line headline | line reveals, rule draw | light-fade | 10 | scene-01.wav | - |

## Asset checklist

- [ ] assets/voice/scene-01.wav (missing - record)
- [ ] assets/images/... (exists)

## Notes

- NEW COMPONENT REQUIRED: ... (only if nothing fits)
```

## Handoff

- Present `storyboard.md` with the asset checklist and ask for approval.
- On approval: set `status: approved` and `"approvals": {"storyboard": true}`.
- Do not render a final video; that is `video-producer`'s job.
