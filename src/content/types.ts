/**
 * Content-layer types.
 *
 * These describe the *data* of a video. Rendering components consume these
 * types; project content lives in its own module (see `sample.ts` and, from
 * Phase 2 on, `projects/<id>/manifest.json`). No executable React ever lives
 * in the content layer.
 */

export type BrandContent = {
  /** Monogram shown in the brand plate, 2–3 characters. */
  initials: string;
  name: string;
  tagline: string;
  /** Display URL without protocol, e.g. "yourportfolio.dev". */
  url: string;
};

export type CinematicIntroContent = {
  /** Small uppercase label above the headline. */
  eyebrow: string;
  /** One entry per designed line. `accent` renders in cyan. */
  headline: {text: string; accent?: boolean}[];
  subline: string;
  /** Chrome label shown top-right. */
  chapter: string;
  /** Rail numeral, e.g. "01". */
  index: string;
  /** Rail rotated label. */
  railLabel: string;
};

export type TitleStatementContent = {
  index: string;
  label: string;
  /** Statement lines. An accented line gets the drawn underline. */
  lines: {text: string; accent?: boolean}[];
  footnote: string;
  /** Ghost numeral behind the statement. */
  ghostNumeral: string;
};

export type CinematicOutroContent = {
  kicker: string;
  closingLine: string;
};

export type SampleTiming = {
  introSeconds: number;
  statementSeconds: number;
  outroSeconds: number;
};

export type SampleContent = {
  brand: BrandContent;
  intro: CinematicIntroContent;
  statement: TitleStatementContent;
  outro: CinematicOutroContent;
  timing: SampleTiming;
};
