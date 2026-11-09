/**
 * Timebase utilities.
 *
 * Frames are the single timebase for all animation. Seconds only appear in
 * project data (durations, audio lengths) and are converted through here so
 * rounding stays consistent everywhere.
 */

export const secondsToFrames = (seconds: number, fps: number): number => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new Error(`secondsToFrames: seconds must be a finite number >= 0, received ${seconds}`);
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error(`secondsToFrames: fps must be a finite number > 0, received ${fps}`);
  }
  return Math.round(seconds * fps);
};

export const framesToSeconds = (frames: number, fps: number): number => {
  if (!Number.isFinite(frames) || frames < 0) {
    throw new Error(`framesToSeconds: frames must be a finite number >= 0, received ${frames}`);
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error(`framesToSeconds: fps must be a finite number > 0, received ${fps}`);
  }
  return frames / fps;
};

/**
 * Progress through a scene as 0–1, clamped. Safe for single-frame scenes,
 * where it returns 1 rather than dividing by zero.
 */
export const sceneProgress = (frame: number, durationInFrames: number): number => {
  if (durationInFrames <= 1) {
    return 1;
  }
  return Math.min(1, Math.max(0, frame / (durationInFrames - 1)));
};
