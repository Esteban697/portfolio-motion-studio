import React from 'react';
import {Composition} from 'remotion';
import manifest from '../projects/studio-sample/manifest.json';
import {ProjectVideo} from './compositions/ProjectVideo';
import {parseProjectManifest} from './schemas/project-schema';
import {defaultProfile} from './theme';
import {calculateProjectDurationInFrames} from './utils/project';

/**
 * Validated once at startup: a malformed manifest fails here with a readable
 * message instead of rendering something broken.
 */
const studioSample = parseProjectManifest(manifest);

/**
 * Composition registry. Each project manifest becomes one composition whose
 * id is registered statically (Remotion requires known compositions), but
 * whose content, scenes and timing are entirely data-driven.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CinematicSample"
      component={ProjectVideo}
      defaultProps={{project: studioSample}}
      durationInFrames={calculateProjectDurationInFrames(studioSample.scenes, defaultProfile.fps)}
      fps={defaultProfile.fps}
      width={defaultProfile.width}
      height={defaultProfile.height}
    />
  );
};
