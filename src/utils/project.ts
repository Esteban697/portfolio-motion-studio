import type {Scene} from '../schemas/project-schema';
import {secondsToFrames} from './timing';

/** One scene placed on the composition timeline. */
export type SceneTimelineEntry = {
  scene: Scene;
  /** Absolute start frame within the composition. */
  from: number;
  durationInFrames: number;
};

/**
 * Converts content-layer scene durations (seconds) into a contiguous frame
 * timeline.
 *
 * Frames are rounded per scene, then accumulated — never derived from the
 * total duration in seconds. Rounding a total can differ from summing
 * rounded scenes by a frame, which would desynchronise the timeline from the
 * composition duration.
 */
export const buildSceneTimeline = (scenes: readonly Scene[], fps: number): SceneTimelineEntry[] => {
  let cursor = 0;

  return scenes.map((scene) => {
    const durationInFrames = secondsToFrames(scene.durationSeconds, fps);
    if (durationInFrames < 1) {
      throw new Error(
        `Scene "${scene.id}" is too short: ${scene.durationSeconds}s rounds to ${durationInFrames} frames at ${fps}fps`,
      );
    }

    const entry: SceneTimelineEntry = {scene, from: cursor, durationInFrames};
    cursor += durationInFrames;
    return entry;
  });
};

/** Total composition length in frames. Must match the registered composition. */
export const calculateProjectDurationInFrames = (scenes: readonly Scene[], fps: number): number =>
  buildSceneTimeline(scenes, fps).reduce((total, entry) => total + entry.durationInFrames, 0);
