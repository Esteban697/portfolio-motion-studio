import {existsSync, readFileSync} from 'node:fs';
import {relative, resolve} from 'node:path';
import {formatIssues, projectManifestSchema} from '../src/schemas/project-schema';
import {profiles} from '../src/theme/dimensions';
import {buildSceneTimeline} from '../src/utils/project';

/**
 * Validates a project manifest before rendering.
 *
 * Phase 2 scope: JSON syntax, schema, scene ids, supported types, profile and
 * duration/frame math. Asset and audio checks are added with the voiceover
 * step.
 */

const USAGE = `Usage:
  npm run validate -- --project <project-id>
  npm run validate -- --file <path/to/manifest.json>

Examples:
  npm run validate -- --project studio-sample`;

type Args = {project?: string; file?: string};

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const parseArgs = (argv: string[]): Args => {
  const args: Args = {};

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];

    if (arg === '--project' || arg === '--file') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        fail(`Missing value for ${arg}\n\n${USAGE}`);
      }
      if (arg === '--project') {
        args.project = value;
      } else {
        args.file = value;
      }
      index++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else {
      fail(`Unknown argument: ${arg}\n\n${USAGE}`);
    }
  }

  return args;
};

const readJson = (path: string): unknown => {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch (error) {
    return fail(`Could not read JSON from ${path}\n${(error as Error).message}`);
  }
};

const main = (): void => {
  const args = parseArgs(process.argv.slice(2));

  if (!args.project && !args.file) {
    fail(`Specify a project or a manifest file.\n\n${USAGE}`);
  }

  const manifestPath = args.file
    ? resolve(args.file)
    : resolve('projects', args.project as string, 'manifest.json');

  if (!existsSync(manifestPath)) {
    fail(
      `Manifest not found: ${manifestPath}\n` +
        'Expected projects/<project-id>/manifest.json — see docs/adding-a-video.md',
    );
  }

  const result = projectManifestSchema.safeParse(readJson(manifestPath));
  if (!result.success) {
    fail(`Invalid manifest: ${relative(process.cwd(), manifestPath)}\n${formatIssues(result.error)}`);
  }

  const project = result.data;

  if (args.project && project.projectId !== args.project) {
    fail(
      `projectId "${project.projectId}" does not match folder name "${args.project}". ` +
        'Rename the folder or fix projectId so output paths stay predictable.',
    );
  }

  const profile = profiles[project.profile];

  let timeline: ReturnType<typeof buildSceneTimeline>;
  try {
    timeline = buildSceneTimeline(project.scenes, profile.fps);
  } catch (error) {
    return fail((error as Error).message);
  }

  const totalFrames = timeline.reduce((sum, entry) => sum + entry.durationInFrames, 0);
  const totalSeconds = totalFrames / profile.fps;

  console.log(`\nProject  ${project.projectId} — ${project.title}`);
  console.log(
    `Profile  ${profile.id} (${profile.width}×${profile.height} @ ${profile.fps} fps)`,
  );
  console.log(
    `Scenes   ${timeline.length}, total ${totalSeconds.toFixed(2)}s (${totalFrames} frames)\n`,
  );

  console.log(
    `  ${'ID'.padEnd(18)}${'TYPE'.padEnd(22)}${'DURATION'.padStart(10)}${'FRAMES'.padStart(8)}  OUT`,
  );
  for (const {scene, durationInFrames} of timeline) {
    console.log(
      `  ${scene.id.padEnd(18)}${scene.type.padEnd(22)}` +
        `${`${scene.durationSeconds.toFixed(2)}s`.padStart(10)}` +
        `${String(durationInFrames).padStart(8)}  ${scene.transitionOut}`,
    );
  }

  const target = project.narrative?.targetDurationSeconds;
  if (target !== undefined) {
    const drift = Math.abs(totalSeconds - target) / target;
    if (drift > 0.15) {
      console.warn(
        `\n! Duration drift: ${totalSeconds.toFixed(2)}s vs target ${target.toFixed(1)}s ` +
          `(${Math.round(drift * 100)}%). Adjust scene durations or the target.`,
      );
    }
  }

  console.log(`\n✓ Manifest valid: ${relative(process.cwd(), manifestPath)}\n`);
};

main();
