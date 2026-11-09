import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TransitionName} from '../schemas/project-schema';
import {transitionEnvelope, transitionSpecs} from './transitions';

type SceneTransitionProps = {
  /** How this scene arrives (the previous scene's `transitionOut`). */
  transitionIn?: TransitionName;
  /** How this scene leaves. */
  transitionOut?: TransitionName;
  children: React.ReactNode;
};

/**
 * Applies enter and exit envelopes to a single scene. Audio must be rendered
 * outside this wrapper — CSS opacity and scale must never mute or shift sound.
 */
export const SceneTransition: React.FC<SceneTransitionProps> = ({
  transitionIn = 'cut',
  transitionOut = 'cut',
  children,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const enter = transitionEnvelope(transitionIn, 'enter', frame, durationInFrames);
  const exit = transitionEnvelope(transitionOut, 'exit', frame, durationInFrames);

  const opacity = enter.opacity * exit.opacity;
  const scale = enter.scale * exit.scale;
  const veilOpacity = Math.max(enter.veilOpacity, exit.veilOpacity);
  const veilBackground =
    transitionSpecs[transitionIn].veilBackground ?? transitionSpecs[transitionOut].veilBackground;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity,
          transform: scale === 1 ? undefined : `scale(${scale})`,
        }}
      >
        {children}
      </AbsoluteFill>
      {/*
        The veil sits outside the opacity wrapper on purpose: it is a light
        source, not part of the scene. Dimming it with the scene would turn a
        bloom into grey mud.
      */}
      {veilOpacity > 0 && veilBackground ? (
        <AbsoluteFill style={{background: veilBackground, opacity: veilOpacity}} />
      ) : null}
    </AbsoluteFill>
  );
};
