/**
 * Asset module declarations.
 *
 * Remotion's bundler emits a URL for these imports; the generated asset
 * registry (`src/generated/project-assets.ts`) maps project-relative paths to
 * those URLs.
 */

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.m4a' {
  const src: string;
  export default src;
}

declare module '*.flac' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}
