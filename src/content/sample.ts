import type {SampleContent} from './types';

/**
 * Placeholder content for the Phase 1 10-second cinematic sample.
 *
 * This is clearly-labelled sample copy for the studio itself — it is not a
 * claim about any real person or project. Real project content lands in
 * `projects/<project-id>/` from Phase 2 onward.
 */
export const sampleContent: SampleContent = {
  brand: {
    initials: 'PM',
    name: 'Portfolio Motion Studio',
    tagline: 'Cinematic video, produced like software.',
    url: 'yourportfolio.dev',
  },
  intro: {
    eyebrow: 'Portfolio · 2026',
    headline: [
      {text: 'Motion design,'},
      {text: 'produced like'},
      {text: 'software.', accent: true},
    ],
    subline: 'A deterministic, local-first pipeline for cinematic portfolio video.',
    chapter: 'Prologue',
    index: '01',
    railLabel: 'Intro',
  },
  statement: {
    index: '02',
    label: 'The principle',
    lines: [
      {text: 'AI proposes the story.'},
      {text: 'Deterministic code', accent: true},
      {text: 'controls every frame.'},
    ],
    footnote: 'Content, assets and timing stay in versioned project data.',
    ghostNumeral: '02',
  },
  outro: {
    kicker: 'End of sample',
    closingLine: 'Build once. Produce every video from the same pipeline.',
  },
  timing: {
    introSeconds: 4,
    statementSeconds: 4,
    outroSeconds: 2,
  },
};
