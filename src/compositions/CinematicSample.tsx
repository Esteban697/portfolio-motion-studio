import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {CinematicIntro} from '../components/CinematicIntro';
import {CinematicOutro} from '../components/CinematicOutro';
import {TitleStatement} from '../components/TitleStatement';
import {SceneFade} from '../components/primitives/SceneFade';
import {sampleContent} from '../content/sample';
import {colors} from '../theme';
import {secondsToFrames} from '../utils/timing';

/**
 * Phase 1 cinematic sample: 10 seconds across three scenes, 1920×1080 @ 30fps.
 *
 * Scene durations live in the content layer (seconds) and are converted to
 * frames here — the only place where the timebase crosses.
 */
export const CinematicSample: React.FC = () => {
  const {fps} = useVideoConfig();
  const {timing} = sampleContent;

  const introFrames = secondsToFrames(timing.introSeconds, fps);
  const statementFrames = secondsToFrames(timing.statementSeconds, fps);
  const outroFrames = secondsToFrames(timing.outroSeconds, fps);

  return (
    <AbsoluteFill style={{backgroundColor: colors.midnight}}>
      <Sequence name="Intro" durationInFrames={introFrames} premountFor={fps}>
        <SceneFade>
          <CinematicIntro brand={sampleContent.brand} content={sampleContent.intro} />
        </SceneFade>
      </Sequence>

      <Sequence
        name="Statement"
        from={introFrames}
        durationInFrames={statementFrames}
        premountFor={fps}
      >
        <SceneFade>
          <TitleStatement brand={sampleContent.brand} content={sampleContent.statement} />
        </SceneFade>
      </Sequence>

      <Sequence
        name="Outro"
        from={introFrames + statementFrames}
        durationInFrames={outroFrames}
        premountFor={fps}
      >
        <SceneFade>
          <CinematicOutro brand={sampleContent.brand} content={sampleContent.outro} />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};
