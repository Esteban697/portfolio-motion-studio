import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {SceneFade} from '../components/primitives/SceneFade';
import {renderScene} from '../scenes/registry';
import type {ProjectManifest} from '../schemas/project-schema';
import {colors} from '../theme';
import {buildSceneTimeline} from '../utils/project';

/**
 * Renders any validated project manifest: one `Sequence` per scene, placed
 * from a contiguous frame timeline. This is the only composition component a
 * project needs — scenes come from the registry, content from the manifest.
 */
export const ProjectVideo: React.FC<{project: ProjectManifest}> = ({project}) => {
  const {fps} = useVideoConfig();
  const timeline = buildSceneTimeline(project.scenes, fps);

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      {timeline.map(({scene, from, durationInFrames}) => {
        const rendered = renderScene(scene, project.brand);

        return (
          <Sequence
            key={scene.id}
            name={scene.id}
            from={from}
            durationInFrames={durationInFrames}
            premountFor={fps}
          >
            {scene.transitionOut === 'fade' ? <SceneFade>{rendered}</SceneFade> : rendered}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
