import type {ReactElement} from 'react';
import {describe, expect, it} from 'vitest';
import overviewManifest from '../projects/studio-overview/manifest.json';
import manifest from '../projects/studio-sample/manifest.json';
import {ArchitectureDiagram} from '../src/components/diagram/ArchitectureDiagram';
import {AnimatedTimeline} from '../src/components/timeline/AnimatedTimeline';
import {CinematicIntro} from '../src/components/CinematicIntro';
import {CinematicOutro} from '../src/components/CinematicOutro';
import {TitleStatement} from '../src/components/TitleStatement';
import {projectManifestSchema, supportedSceneTypes} from '../src/schemas/project-schema';
import {renderScene, sceneLabels, sceneRegistry} from '../src/scenes/registry';

const project = projectManifestSchema.parse(manifest);
const overview = projectManifestSchema.parse(overviewManifest);

describe('scene registry', () => {
  it('registers exactly the supported scene types', () => {
    expect(Object.keys(sceneRegistry).sort()).toEqual([...supportedSceneTypes].sort());
  });

  it('labels every registered type', () => {
    expect(Object.keys(sceneLabels).sort()).toEqual([...supportedSceneTypes].sort());
  });

  it('renders each sample scene with the component for its type', () => {
    const elements = project.scenes.map((scene) => renderScene(scene, project.brand));

    expect(elements.map((element) => element.type)).toEqual([
      CinematicIntro,
      TitleStatement,
      CinematicOutro,
    ]);
  });

  it('renders the overview sample, including timeline and diagram scenes', () => {
    const elements = overview.scenes.map((scene) => renderScene(scene, overview.brand));
    const types = elements.map((element) => element.type);

    expect(types[0]).toBe(CinematicIntro);
    expect(types[types.length - 1]).toBe(CinematicOutro);
    expect(types).toContain(AnimatedTimeline);
    expect(types).toContain(ArchitectureDiagram);
    expect(types).toContain(TitleStatement);
  });

  it('passes the project brand and scene content through', () => {
    const scene = project.scenes[0];
    if (!scene) throw new Error('fixture has no scenes');

    const element = renderScene(scene, project.brand) as ReactElement<{
      brand: unknown;
      content: unknown;
    }>;

    expect(element.props.brand).toEqual(project.brand);
    expect(element.props.content).toEqual(scene.content);
  });
});
