/**
 * Composition profiles and layout frame.
 *
 * A profile is the only place resolution and frame rate are declared. Adding
 * 9:16 or 1:1 later means adding a profile — not editing components.
 */
export type CompositionProfile = {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  /** Uniform layout margin in pixels. */
  readonly gutter: number;
};

/**
 * Profiles a project manifest may select. Render-only sizes (preview scaling)
 * are not listed: they are output options, not composition profiles.
 */
export const profileIds = ['landscape-1080p'] as const;

export const profiles = {
  'landscape-1080p': {
    id: 'landscape-1080p',
    width: 1920,
    height: 1080,
    fps: 30,
    gutter: 140,
  },
  'preview-720p': {
    id: 'preview-720p',
    width: 1280,
    height: 720,
    fps: 30,
    gutter: 94,
  },
} as const satisfies Record<string, CompositionProfile>;

export type ProfileId = (typeof profileIds)[number];

/** The production profile. Previews scale down from the same layout. */
export const defaultProfile: CompositionProfile = profiles['landscape-1080p'];

/**
 * Safe area: content never enters this margin, leaving room for platform
 * chrome / cropping without losing text.
 */
export const safeArea = {
  x: defaultProfile.gutter,
  y: 110,
} as const;

/** Usable content box inside the safe area. */
export const contentBox = {
  width: defaultProfile.width - safeArea.x * 2,
  height: defaultProfile.height - safeArea.y * 2,
} as const;
