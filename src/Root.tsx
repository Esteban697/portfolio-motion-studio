import React from 'react';
import {Composition} from 'remotion';
import overviewManifest from '../projects/studio-overview/manifest.json';
import sampleManifest from '../projects/studio-sample/manifest.json';
import {ProjectVideo} from './compositions/ProjectVideo';
import {parseProjectManifest, type ProjectManifest} from './schemas/project-schema';
import {defaultProfile} from './theme';
import {calculateProjectDurationInFrames} from './utils/project';

/**
 * Validated once at startup: a malformed manifest fails here with a readable
 * message instead of rendering something broken.
 */
const studioSample = parseProjectManifest(sampleManifest);
const studioOverview = parseProjectManifest(overviewManifest);

/**
 * Composition registry. Remotion requires compositions to be known
 * statically, so each project gets one entry — but content, scenes, timing
 * and narration are entirely data-driven.
 */
const registerProject = (id: string, project: ProjectManifest): React.ReactElement => (
  <Composition
    key={id}
    id={id}
    component={ProjectVideo}
    defaultProps={{project}}
    durationInFrames={calculateProjectDurationInFrames(project.scenes, defaultProfile.fps)}
    fps={defaultProfile.fps}
    width={defaultProfile.width}
    height={defaultProfile.height}
  />
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {registerProject('CinematicSample', studioSample)}
      {registerProject('StudioOverview', studioOverview)}
    </>
  );
};
