# Approval workflow

AI-generated material is a **draft** until a person explicitly approves it.
Approval is recorded in the project manifest so it is versioned, reviewable and
enforceable by tooling.

## Pipeline and gates

```text
source material
      │  project-analyzer
      ▼
facts.md (draft) ──────────────► ⛳ GATE 1: facts approved
      │  script-writer
      ▼
script.md (draft) ─────────────► ⛳ GATE 2: script approved
      │  storyboard-generator
      ▼
storyboard.md + manifest.json ─► ⛳ GATE 3: storyboard approved
      │  user records narration, supplies assets
      ▼
validate → preview render ─────► ⛳ GATE 4: final render approved
      │  video-producer
      ▼
final MP4 (never published automatically)
```

## How approval is recorded

Gate | Artifact | Recorded in
--- | --- | ---
1 | `projects/<id>/facts.md` | `status: approved` + manifest `approvals.facts`
2 | `projects/<id>/script.md` | `status: approved` + manifest `approvals.script`
3 | `projects/<id>/storyboard.md` | `status: approved` + manifest `approvals.storyboard`
4 | Reviewed preview file | manifest `approvals.finalRender`

```json
"approvals": {
  "facts": true,
  "script": true,
  "storyboard": true,
  "finalRender": false
}
```

Missing or `false` means **not approved**. The schema defaults an absent
approvals object to nothing approved.

## Enforcement

```bash
npm run validate -- --project <id>          # prints approval state
npm run validate -- --project <id> --final  # fails unless all four gates are true
```

`--final` is the production-render gate. Preview renders are allowed while
drafts are in review; the final render is not.

## Who approves what

- **Facts** — the owner confirms every claim, or removes it. Anything without a
  source reference belongs in Assumptions or Open questions.
- **Script** — the owner signs off narration and on-screen text together.
- **Storyboard** — the owner signs off scene list, timing, assets and
  transitions, and confirms illustrations are labelled as concepts.
- **Final render** — the owner reviews a preview file before the production
  render.

The person approving is always the owner. No skill sets an approval to `true`
on its own initiative; a skill may only update the record after the user has
explicitly said so.

## Skills

| Skill | Produces | Must not |
| --- | --- | --- |
| `project-analyzer` | `facts.md` | Modify or execute the analyzed repo; quote secrets; invent claims |
| `script-writer` | `script.md` | Write from unapproved facts; add unsourced numbers |
| `storyboard-generator` | `storyboard.md`, `manifest.json` | Invent scene types; silently create components |
| `video-producer` | preview/final renders, reports | Render final without gates; upload or publish |

The skills live in `.claude/skills/`. Their hard rules are part of the
contract; `test/skills.test.ts` guards them against drift (skill names,
frontmatter, scene-type coverage, approval-gate references).

## Templates are drafts

`projects/career-journey` and `projects/project-showcase` are templates with
placeholder copy and no narration. They are not approved content, and they
carry no `approvals` object. Replacing their copy and adding recordings is the
first real production run.
