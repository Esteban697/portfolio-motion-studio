import {spawnSync} from 'node:child_process';

/** Technical facts about an audio file, read with FFprobe. */
export type AudioInfo = {
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  codec: string;
};

export type NarrationIssue = {
  severity: 'error' | 'warning';
  message: string;
};

/** Below this, a duration difference is measurement noise, not a cut-off. */
const DURATION_EPSILON_SECONDS = 0.05;

/**
 * Reads an audio file's stream metadata with FFprobe.
 *
 * Throws actionable errors for a missing binary, an unreadable file, or a file
 * with no audio stream — never returns partial data.
 */
export const probeAudio = (filePath: string): AudioInfo => {
  const result = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'a:0',
      '-show_entries',
      'stream=codec_name,sample_rate,channels,duration:format=duration',
      '-of',
      'json',
      filePath,
    ],
    {encoding: 'utf8'},
  );

  if (result.error) {
    throw new Error(
      `FFprobe is required to inspect narration but could not be run (${result.error.message}). ` +
        'Install FFmpeg and make sure ffprobe is on PATH.',
    );
  }

  if (result.status !== 0) {
    throw new Error(`FFprobe could not read "${filePath}":\n${String(result.stderr).trim()}`);
  }

  const parsed = JSON.parse(result.stdout) as {
    streams?: {codec_name?: string; sample_rate?: string; channels?: number; duration?: string}[];
    format?: {duration?: string};
  };

  const stream = parsed.streams?.[0];
  if (!stream) {
    throw new Error(`No audio stream found in "${filePath}".`);
  }

  const durationSeconds = Number(parsed.format?.duration ?? stream.duration);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(`Could not determine the duration of "${filePath}".`);
  }

  const sampleRate = Number(stream.sample_rate);
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new Error(`Could not determine the sample rate of "${filePath}".`);
  }

  return {
    durationSeconds,
    sampleRate,
    channels: stream.channels ?? 0,
    codec: stream.codec_name ?? 'unknown',
  };
};

const formatSeconds = (value: number): string => `${value.toFixed(2)}s`;

/**
 * Checks narration against its scene without modifying either.
 *
 * Narration must fit inside its scene — Remotion would cut an overlong clip at
 * the sequence boundary, so this is an error, not a warning. A short or silent
 * scene is legal but suspicious, so it warns. Duration relationships are
 * reported explicitly; nothing is stretched or padded automatically.
 */
export const evaluateNarrationFit = ({
  sceneId,
  sceneSeconds,
  narration,
}: {
  sceneId: string;
  sceneSeconds: number;
  narration: AudioInfo;
}): NarrationIssue[] => {
  const issues: NarrationIssue[] = [];
  const coverage = narration.durationSeconds / sceneSeconds;

  if (narration.durationSeconds > sceneSeconds + DURATION_EPSILON_SECONDS) {
    issues.push({
      severity: 'error',
      message:
        `scene "${sceneId}": narration is ${formatSeconds(narration.durationSeconds)} but the scene is ` +
        `${formatSeconds(sceneSeconds)} — audio would be cut off. Increase durationSeconds or trim the recording.`,
    });
  } else if (coverage < 0.5) {
    issues.push({
      severity: 'warning',
      message:
        `scene "${sceneId}": narration covers only ${Math.round(coverage * 100)}% of the scene ` +
        `(${formatSeconds(narration.durationSeconds)} of ${formatSeconds(sceneSeconds)}) — check for unintended silence.`,
    });
  }

  if (narration.sampleRate !== 48000) {
    issues.push({
      severity: 'warning',
      message: `scene "${sceneId}": audio is ${narration.sampleRate} Hz; 48000 Hz is the project target.`,
    });
  }

  return issues;
};
