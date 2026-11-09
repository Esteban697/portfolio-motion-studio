import React from 'react';
import {Composition} from 'remotion';
import {CinematicSample} from './compositions/CinematicSample';
import {sampleContent} from './content/sample';
import {defaultProfile} from './theme';
import {secondsToFrames} from './utils/timing';

const {introSeconds, statementSeconds, outroSeconds} = sampleContent.timing;
const totalSeconds = introSeconds + statementSeconds + outroSeconds;

/**
 * Composition registry. Every registered composition reads its dimensions
 * from a profile token and its content from the content layer.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CinematicSample"
      component={CinematicSample}
      durationInFrames={secondsToFrames(totalSeconds, defaultProfile.fps)}
      fps={defaultProfile.fps}
      width={defaultProfile.width}
      height={defaultProfile.height}
    />
  );
};
