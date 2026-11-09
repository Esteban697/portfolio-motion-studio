import React from 'react';
import {AbsoluteFill, Audio, Sequence, useVideoConfig} from 'remotion';
import {renderScene} from '../scenes/registry';
import type {ProjectManifest, TransitionName} from '../schemas/project-schema';
import {colors} from '../theme';
import {SceneTransition} from '../transitions/SceneTransition';
import {dbToGain, resolveProjectAsset} from '../utils/assets';
import {buildSceneTimeline} from '../utils/project';

/**
 * Renders any validated project manifest: one `Sequence` per scene, placed
 * from a contiguous frame timeline.
 *
 * Each scene receives the transition it enters with (the previous scene's
 * `transitionOut`) and the transition it leaves with. Audio sits outside the
 * transition wrapper so opacity and scale never affect sound.
 */
export const ProjectVideo: React.FC<{project: ProjectManifest}> = ({project}) => {
  const {fps} = useVideoConfig();
  const timeline = buildSceneTimeline(project.scenes, fps);

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      {timeline.map(({scene, from, durationInFrames}, index) => {
        const previous = index > 0 ? timeline[index - 1] : undefined;
        // The film opens on a fade up from black.
        const transitionIn: TransitionName = previous ? previous.scene.transitionOut : 'fade';

        return (
          <Sequence
            key={scene.id}
            name={scene.id}
            from={from}
            durationInFrames={durationInFrames}
            premountFor={fps}
          >
            {scene.voiceover ? (
              <Audio
                src={resolveProjectAsset(project.projectId, scene.voiceover.src)}
                volume={dbToGain(scene.voiceover.volumeDb)}
              />
            ) : null}
            <SceneTransition transitionIn={transitionIn} transitionOut={scene.transitionOut}>
              {renderScene(scene, project.brand)}
            </SceneTransition>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
