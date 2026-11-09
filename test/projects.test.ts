import {existsSync, readdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {projectManifestSchema, type ProjectManifest} from '../src/schemas/project-schema';
import {resolveProjectAsset} from '../src/utils/assets';
import {calculateProjectDurationInFrames} from '../src/utils/project';
import {readJsonFile} from '../src/utils/read-json';

type LoadedProject = {id: string; project: ProjectManifest};

const projectsDir = resolve(process.cwd(), 'projects');

const loadProjects = (): LoadedProject[] =>
  readdirSync(projectsDir, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const manifestPath = join(projectsDir, entry.name, 'manifest.json');
      if (!existsSync(manifestPath)) {
        return [];
      }

      const result = projectManifestSchema.safeParse(readJsonFile(manifestPath));
      if (!result.success) {
        throw new Error(`Invalid manifest: ${manifestPath}`);
      }

      return [{id: entry.name, project: result.data}];
    });

describe('project folder conventions', () => {
  const projects = loadProjects();

  it('loads every project folder', () => {
    expect(projects.map((entry) => entry.id).sort()).toEqual([
      'studio-overview',
      'studio-sample',
    ]);
  });

  it('matches projectId to the folder name', () => {
    for (const {id, project} of projects) {
      expect(project.projectId).toBe(id);
    }
  });

  it('resolves every voiceover through the generated asset registry', () => {
    // Catches a stale `npm run assets` output or a path typo.
    for (const {project} of projects) {
      for (const scene of project.scenes) {
        if (!scene.voiceover) {
          continue;
        }
        expect(resolveProjectAsset(project.projectId, scene.voiceover.src)).toBeTruthy();
      }
    }
  });

  it('keeps the overview sample inside the 60–90 second brief', () => {
    const overview = projects.find((entry) => entry.id === 'studio-overview');
    expect(overview).toBeDefined();
    if (!overview) {
      return;
    }

    const seconds = calculateProjectDurationInFrames(overview.project.scenes, 30) / 30;
    expect(seconds).toBeGreaterThanOrEqual(60);
    expect(seconds).toBeLessThanOrEqual(90);
  });
});
