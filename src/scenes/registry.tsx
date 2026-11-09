import React from 'react';
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
  [K in SceneType]: React.FC<{brand: BrandContent; content: SceneOfType<K>['content']}>;
};

export const sceneRegistry = {
  'cinematic-intro': CinematicIntro,
  'title-statement': TitleStatement,
  'cinematic-outro': CinematicOutro,
} satisfies SceneRegistry;

/** Human-readable labels for tooling and validation output. */
export const sceneLabels: Record<SceneType, string> = {
  'cinematic-intro': 'Cinematic intro',
  'title-statement': 'Title / statement',
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
export const renderScene = (scene: Scene, brand: BrandContent): React.ReactElement => {
  const Component = sceneRegistry[scene.type] as React.FC<{
    brand: BrandContent;
    content: Scene['content'];
  }>;
  return <Component brand={brand} content={scene.content} />;
};
