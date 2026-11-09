import React from 'react';
import {ArchitectureDiagram} from '../components/diagram/ArchitectureDiagram';
import {DataFlow} from '../components/flow/DataFlow';
import {ImageShowcase} from '../components/showcase/ImageShowcase';
import {AnimatedTimeline} from '../components/timeline/AnimatedTimeline';
import {CinematicIntro} from '../components/CinematicIntro';
import {CinematicOutro} from '../components/CinematicOutro';
import {TitleStatement} from '../components/TitleStatement';
import type {BrandContent, Scene, SceneOfType, SceneType} from '../schemas/project-schema';

/**
 * Scene registry: the only place a scene `type` is mapped to a component.
 *
 * The mapped type below is exhaustive and content-aware — adding a scene type
 * to the schema without a registry entry is a compile error, and each entry
 * accepts only its own content type.
 */
type SceneRegistry = {
  [K in SceneType]: React.FC<{
    brand: BrandContent;
    /** Needed by scenes that resolve assets (image showcase). */
    projectId: string;
    content: SceneOfType<K>['content'];
  }>;
};

export const sceneRegistry = {
  'cinematic-intro': CinematicIntro,
  'title-statement': TitleStatement,
  'animated-timeline': AnimatedTimeline,
  'architecture-diagram': ArchitectureDiagram,
  'image-showcase': ImageShowcase,
  'data-flow': DataFlow,
  'cinematic-outro': CinematicOutro,
} satisfies SceneRegistry;

/** Human-readable labels for tooling and validation output. */
export const sceneLabels: Record<SceneType, string> = {
  'cinematic-intro': 'Cinematic intro',
  'title-statement': 'Title / statement',
  'animated-timeline': 'Animated timeline',
  'architecture-diagram': 'Architecture diagram',
  'image-showcase': 'Image / screenshot showcase',
  'data-flow': 'Data flow',
  'cinematic-outro': 'Closing / call to action',
};

/**
 * Renders a scene through the registry.
 *
 * The single cast is justified by the schema: a scene's `content` is
 * structurally tied to its `type` by the discriminated union, so the
 * component selected by `scene.type` is always the one that accepts
 * `scene.content`.
 */
export const renderScene = (
  scene: Scene,
  brand: BrandContent,
  projectId: string,
): React.ReactElement => {
  const Component = sceneRegistry[scene.type] as React.FC<{
    brand: BrandContent;
    projectId: string;
    content: Scene['content'];
  }>;
  return <Component brand={brand} projectId={projectId} content={scene.content} />;
};
