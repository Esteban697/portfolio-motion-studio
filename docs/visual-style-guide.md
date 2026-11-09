# Visual style guide

Cinematic, premium, technical, restrained. Not a slide deck, not a screensaver.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Midnight | `#080D19` | Background |
| Deep blue | `#172B45` | Surfaces, diagram nodes |
| Cyan | `#31C5D9` | One idea per scene: the accent, active connection, key word |
| Silver | `#E8EDF5` | Primary type |
| Muted blue-grey | `#8EA0B8` | Supporting type, chrome, labels |

All values live in `src/theme/colors.ts`, with translucent helpers in
`alpha`. Use a token, never a literal.

**Cyan discipline.** One accent per scene. If a frame has two cyan elements
competing, remove one. Cyan on type is for the single most important phrase;
cyan on lines is for structure (rails, rules, connectors).

## Typography

- Sans stack: `Inter → Segoe UI → system-ui`. Mono stack:
  `JetBrains Mono → Cascadia Code → Consolas` for labels, numerals, code.
- Display copy is **light (300) and large** (104–132 px at 1080p). Hierarchy
  comes from scale and weight, not from color tricks.
- Headlines break at deliberate points. Line breaks are authored, never
  left to wrapping.
- Uppercase mono labels carry wide tracking (3–4.5 px) and small sizes
  (13–18 px). They are chrome, not content.
- Body/supporting copy is 26–30 px at 55–70% legibility. It must remain
  readable at 720p.

## Composition

- Safe area: 140 px horizontal, 110 px vertical at 1920×1080.
- Left-weighted intro and statement; centred, quiet outro. Alternate weight
  between scenes so the edit breathes.
- Generous negative space is part of the design. Do not fill the right half
  out of habit.
- Structural chrome (top bar, side rail, hairline + footer) is allowed on
  content scenes; the outro drops most of it to feel quieter.

## Motion

- House curve: expo-out (`cubic-bezier(0.16, 1, 0.3, 1)`) for entries;
  in-out for moves that must return.
- Durations: 18 frames fast, 30 base, 48 slow, 90 glacial.
- Text reveals are masked slide-ups of complete lines, staggered 7–8 frames.
  No typewriter, no per-character bounce.
- Every scene settles by ~1.5 s and then holds. Motion communicates arrival,
  not activity.
- Background: slow parallax drift (`translate` a few px per scene) and
  gradient glows. No particles, no lens flares, no motion blur, no glitches.

## Atmosphere

`Backdrop` layers: base diagonal gradient → upper-left deep-blue glow →
lower-right cyan lift → 80 px grid lattice with a radial mask → vignette.
Grid opacity stays at 55% of its already-faint line value; it should be felt,
not read.

## Timeline and diagram scenes

**Timeline**

- Horizontal rail, one diamond node per milestone: marker above, title and
  detail below. Never more than six milestones.
- Only the final node is filled cyan; travelled segments sit at 50% cyan.
  Earlier nodes are outline-only diamonds.
- Titles are short nouns ("Facts", "Script"). Detail lines carry the meaning.
- The rail draws first; nodes land left to right, 10 frames apart.

**Diagram**

- Nodes are dark panels with a 12 px radius. Accent nodes get a cyan border,
  faint cyan fill and one small cyan dot beside the label.
- Edges are thin S-curves with small arrowheads, drawn only after both
  endpoints exist. Accent edges mark the important path — use at most two.
- The grid is deliberately small (0–3 columns, 0–2 rows, ≤ 8 nodes). If a
  diagram needs more, it is two diagrams, not one crowded one.
- Sublabels are short mono tags ("VALIDATED JSON"). They explain the box; they
  are not sentences.
- If a diagram illustrates a concept rather than a real system, say so in the
  scene copy or footnote.

**Image showcase**

- A real screenshot gets browser chrome and a muted CAPTURE badge; a
  conceptual illustration gets a cyan CONCEPT badge. Never dress a concept as
  a screenshot.
- One hero frame plus up to two detail frames. Captions are mandatory and
  describe what the viewer is looking at, not what to conclude.
- Keep screenshots at their native aspect; the frame letterboxes rather than
  crops.

**Data flow**

- Strictly linear, 2–4 stages, equal widths. It is a sequence, not a graph —
  use the architecture diagram when the system branches.
- Cyan marks the output stage and the travelling packets; everything else is
  silver on dark.
- Packets are small and sparse. If they start reading as decoration, remove
  one.

## Transitions

| Name | Use |
| --- | --- |
| `cut` | Default. Use when the narration pauses between ideas. |
| `fade` | Chapter breaks and the final shot. Dips through black. |
| `light-fade` | A lift in energy: a soft silver bloom carries the cut. Never a white flash. |
| `camera-push` | Forward momentum between related ideas. Scales 1.06 → 1 on entry, 1 → 1.1 on exit. |

- Vary transitions, but never stack two showy ones back to back. A film of all
  `camera-push` reads as a gimmick.
- Keep the opening fade up from black; it sets the tone.
- Transition frames are part of the scene, not extra time.

## Do not

- Add glow shadows, bevels, or drop shadows to text.
- Use more than one accent color.
- Animate more than one focal element at a time.
- Use stock gradients or generic "AI" imagery.
- Let any element touch the frame edge except deliberate oversized ghosts
  (e.g. the statement numeral), which must read as intentional.

## Custom fonts

To use a bundled brand font instead of the system stack:

1. Add the file to `public/fonts/`.
2. Load it with `@remotion/fonts` (`loadFont({family, url: staticFile(...)})`)
   in `src/index.ts` or a dedicated `src/theme/fonts.ts`.
3. Reference the family name in `src/theme/typography.ts`.
4. Record the font's license in `docs/licensing.md` and confirm the file may
   be redistributed in this repository.

Do not fetch fonts over the network during a render — renders must stay
offline and deterministic.
