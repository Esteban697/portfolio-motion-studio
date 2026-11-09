---
project: studio-engineering
status: approved
approved: 2026-11-09
targetDurationSeconds: 80
language: en
facts: projects/studio-engineering/facts.md (approved 2026-11-09)
---

# Script — Esteban Struve, career story (option A)

Arc: hook -> timeline -> through-line -> proof -> current focus -> leadership
-> close. English narration, 2.5 words/second. Only approved facts from
`facts.md` are used.

## Scene: intro (0:00-0:10)

- Purpose: hook. Two eras in one image: computer vision, then agentic AI.
- Narration: "Ten years ago, I was tracking fluid dynamics with computer
  vision. Today, I lead teams building agentic AI. This is that path."
- On-screen text:
  - Eyebrow: "Career journey"
  - Headline: ["From pixels,", "to agents." (accent)]
  - Subline: "Esteban Struve — AI Tech Lead, Madrid."
  - Chapter: "Opening", Index: "01", Rail label: "Intro"

## Scene: timeline (0:10-0:25)

- Purpose: progression across six teams.
- Narration: "Computer vision in Caracas. A master's in Denmark. Banking APIs,
  XR platforms, healthcare simulation, enterprise AR — each step adding a
  layer. Then AI Tech Lead at WeAI."
- On-screen text:
  - Index: "02", Label: "Background", Chapter: "Timeline"
  - Headline: "Ten years, six teams."
  - Milestones:
    - 2013 — "Computer vision" / "PIV research · IVIC"
    - 2017 — "Danske Bank" / ".NET and C# APIs"
    - 2019 — "Virsabi" / "First Azure platform"
    - 2020 — "Laerdal" / "Healthcare XR"
    - 2022 — "KIT-AR" / "AR for manufacturing"
    - 2026 — "WeAI" / "AI Tech Lead"
  - Footnote: "From research to agentic AI — six teams, one direction."
- Pronunciation: Danske Bank -> "DAN-skuh bank"; Laerdal -> "LAIR-dahl";
  Virsabi -> "VEER-sah-bee" [VERIFY]; KIT-AR -> "kit-AR" [VERIFY];
  WeAI -> "we-A-I" [VERIFY].

## Scene: through-line (0:25-0:35)

- Purpose: the idea that connects the roles.
- Narration: "Every role taught me the same lesson: software should adapt to
  the people using it, not the other way around."
- On-screen text:
  - Index: "03", Label: "The through-line"
  - Lines: ["Software should", "adapt to people,", "not the reverse." (accent)]
  - Footnote: "The lesson carried from XR interfaces to agent design."
  - Ghost numeral: "03"

## Scene: impact (0:35-0:47)

- Purpose: concrete proof with a measured outcome.
- Narration: "At KIT-AR, we replaced hand-built interfaces with a dynamic UI
  system. Design-to-deployment went from two months to two weeks. It shipped
  into production."
- On-screen text:
  - Index: "04", Label: "Selected impact", Chapter: "KIT-AR"
  - Headline: "Two months, to two weeks."
  - Image: `assets/images/kit-ar-placeholder.svg` — caption "Dynamic
    holographic UI — add a real capture", kind `concept`
  - Footnote: "Design-to-deployment at KIT-AR; featured at TAP aircraft
    maintenance on TVI news."
- Asset note: no real KIT-AR screenshot is available yet; use the labelled
  concept placeholder until one is supplied.

## Scene: current-focus (0:47-1:00)

- Purpose: what the work is now.
- Narration: "Today the work is agentic AI: a model that reasons, tools it can
  call, and knowledge it can retrieve. Built with the same discipline as any
  production system."
- On-screen text:
  - Index: "05", Label: "Current focus", Chapter: "Agentic AI"
  - Headline: "Agentic systems, built like software."
  - Diagram nodes:
    - interface (col 0, row 0) — "Interface" / "Web · chat"
    - agent (col 1, row 0) — "Agent" / "LangGraph" (accent)
    - knowledge (col 1, row 1) — "Knowledge" / "RAG · vectors"
    - tools (col 2, row 0) — "Tools" / "APIs · actions"
    - response (col 3, row 0) — "Response" / "Grounded answer"
  - Edges: interface→agent, knowledge→agent, agent→tools, agent→response
  - Footnote: "The current focus: reasoning, retrieval and tool use."
- Pronunciation: LangGraph -> "LANG-graf"; RAG -> "rag"; API -> "A-P-I".

## Scene: leadership (1:00-1:10)

- Purpose: leadership plus hands-on work.
- Narration: "Leading teams is part of the job now: hiring, architecture,
  mentoring. But I still build. That keeps the advice honest."
- On-screen text:
  - Index: "06", Label: "Leadership"
  - Lines: ["I lead teams.", "I still build." (accent), "Both matter."]
  - Footnote: "Hiring, architecture, mentoring — and shipping."
  - Ghost numeral: "06"

## Scene: outro (1:10-1:20)

- Purpose: close and call to action.
- Narration: "If you're building something that needs to think, I'd like to
  hear about it. Find me at uxin3d dot com."
- On-screen text:
  - Brand: initials "ES", name "Esteban Struve", tagline "AI Tech Lead ·
    Agentic AI, XR & Cloud" (proposed on-screen line), URL "uxin3d.com"
  - Kicker: "Esteban Struve"
  - Closing line: "Ten years in. Still building."
- Pronunciation: uxin3d -> "you-ex-in-three-dee".

## Timing

| scene | seconds | words | read time |
| --- | --- | --- | --- |
| intro | 10 | 22 | 8.8 |
| timeline | 15 | 27 | 10.8 |
| through-line | 10 | 20 | 8.0 |
| impact | 12 | 23 | 9.2 |
| current-focus | 13 | 28 | 11.2 |
| leadership | 10 | 20 | 8.0 |
| outro | 10 | 20 | 8.0 |

Total: 80 seconds (target 60-90), 160 words, 64.0 s of speech. Every scene
keeps narration between 72 % and 88 % of its duration, leaving room to breathe.

## Resolved at Gate 2 (2026-11-09)

- Script approved as written.
- The 2015 ESET role stays omitted from the engineering timeline.
- No KIT-AR capture is available; the impact scene uses a labelled concept
  placeholder.
- Outro tagline "AI Tech Lead · Agentic AI, XR & Cloud" approved as written.

## Open issues

- [VERIFY: pronunciation of Virsabi, KIT-AR, WeAI, UXin3D — confirm before
  recording.]
- Narration is not recorded. This script is timed for 2.5 words/second; the
  storyboard sets scene durations, and `npm run validate` will check the
  recordings against them.
