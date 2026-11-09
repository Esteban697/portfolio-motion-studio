import {projectAssets} from '../generated/project-assets';

/**
 * Resolves a manifest-relative asset path to a URL the bundler can serve.
 *
 * Assets are statically imported by `scripts/generate-assets.ts`, because a
 * manifest path is only a string at runtime. A missing entry here means the
 * generated registry is stale or the manifest points at a file that does not
 * exist — both are authoring errors, so this throws rather than rendering
 * silence.
 */
export const resolveProjectAsset = (projectId: string, src: string): string => {
  const assetsForProject = projectAssets[projectId];

  if (!assetsForProject) {
    throw new Error(
      `No assets are registered for project "${projectId}". ` +
        'Run "npm run assets" and check that the project folder matches projectId.',
    );
  }

  const url = assetsForProject[src];
  if (!url) {
    throw new Error(
      `Asset "${src}" is not registered for project "${projectId}". ` +
        'Run "npm run assets" and verify the path in manifest.json.',
    );
  }

  return url;
};

/**
 * Converts decibels to a linear gain in [0, 1]. Narration is attenuation-only;
 * the schema rejects positive dB values, and this clamps defensively.
 */
export const dbToGain = (volumeDb: number | undefined): number => {
  if (volumeDb === undefined) {
    return 1;
  }
  if (!Number.isFinite(volumeDb)) {
    throw new Error(`volumeDb must be a finite number, received ${volumeDb}`);
  }
  return Math.min(1, Math.max(0, Math.pow(10, volumeDb / 20)));
};
