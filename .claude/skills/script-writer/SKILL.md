---
name: script-writer
description: Turn approved project facts into a scene-level spoken script and on-screen copy for a 60-90 second video. Use after facts are approved, when the user asks for narration, a script, or copy for a portfolio video.
---

# Script Writer

Write `projects/<project-id>/script.md`: spoken narration and on-screen text,
scene by scene. Do **not** create the storyboard, manifest or audio here.

## Preconditions

- `projects/<id>/facts.md` exists and its frontmatter says `status: approved`.
- If it is missing or still `draft`, **stop** and ask for approval. Never write
  a script from unapproved facts.

## Hard rules

- Use only approved facts. Never introduce a number, name, date, user, outcome
  or capability that facts.md does not contain.
- Anything uncertain gets `[VERIFY: ...]` inline and a line in the open issues
  list. Do not smooth over gaps.
- No marketing superlatives ("revolutionary", "world-class", "cutting-edge").
  Prefer concrete nouns and verbs.
- Spoken narration and on-screen text are separate artifacts. On-screen text is
  short and designed; narration is natural speech.
- One cyan accent idea per scene: at most one accented line in an intro or
  statement.
- Do not generate narration audio. The user records it; any placeholder TTS
  must be labelled as placeholder in the manifest and a project README.

## Target duration

- Reading pace: **2.4-2.6 words per second** (145-155 wpm).
- A 10 s scene holds 24-26 words. A 60 s video holds ~150 words.
- If the user gives a target, cut to fit. Never pad with filler.

## Process

1. Read `facts.md` and the manifest if one exists.
2. Choose an arc: hook -> context -> progression -> proof -> close.
3. Map beats to the implemented scene types:

   | Type | Use |
   | --- | --- |
   | `cinematic-intro` | Hook and identity |
   | `title-statement` | One idea per scene, one accent line |
   | `animated-timeline` | Sequence of milestones (2-6) |
   | `architecture-diagram` | How components connect (<= 8 nodes) |
   | `image-showcase` | Real screenshots or a labelled concept |
   | `data-flow` | A linear request path (2-4 stages) |
   | `cinematic-outro` | Close and call to action |

   If a beat needs a visual the scene set cannot express, note it for
   `storyboard-generator`; do not invent a scene type.
4. Write narration per scene and the on-screen text, respecting field limits:
   intro headline <= 4 lines, statement <= 4 lines, at most one accent.
5. Add pronunciation guidance for technical terms.
6. Estimate timing per scene; the total must sit inside the requested window.

## Output: `projects/<id>/script.md`

```md
---
project: <project-id>
status: draft
targetDurationSeconds: 72
---

# Script

## Scene: intro (0:00-0:10)

- Purpose: hook
- Narration: "<spoken text>"
- On-screen text:
  - Eyebrow: "<...>"
  - Headline: ["<line 1>", "<line 2>", "<accent line>"]
  - Subline: "<...>"
- Pronunciation: <term> -> <phonetic guide>

## Scene: ...

## Timing

| scene | seconds | words | read time |
| --- | --- | --- | --- |
| intro | 10 | 25 | 10.0 |

Total: <seconds> (target <seconds>)

## Open issues

- [VERIFY: ...]
```

## Handoff

- Present the script, timing table and pronunciation list. Ask for approval.
- On explicit approval: set `status: approved` and, in the manifest, set
  `"approvals": {"script": true}`.
- Do not move to storyboarding before the script is approved.
