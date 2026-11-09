# Adding a video

A video is a project directory with a validated manifest. The renderer is
generic: no rendering code changes when you add a project.

## A. New project (works today)

1. **Create the project directory**

   ```text
   projects/<project-id>/
   ├── manifest.json
   └── assets/            # voice/, images/, screenshots/, music/ (added in Phase 2–3)
   ```

   The directory name must equal `projectId` in the manifest, and both must be
   lowercase kebab-case.

2. **Write the manifest** using `projects/studio-sample/manifest.json` as the
   reference. Required fields:

   | Field | Notes |
   | --- | --- |
   | `schemaVersion` | `1` |
   | `projectId` | kebab-case, matches the folder |
   | `title` | human title used in tooling |
   | `profile` | `landscape-1080p` |
   | `brand` | `initials` (1–3 chars), `name`, `tagline`, `url` (no protocol) |
   | `scenes` | non-empty list; each has `id`, `type`, `durationSeconds`, `content` |
   | `narrative` | optional `logline` / `targetDurationSeconds` |

   Scene `type` must be one of the registered types:

   | Type | Component | Content |
   | --- | --- | --- |
   | `cinematic-intro` | `CinematicIntro` | eyebrow, headline lines, subline, chapter, index, railLabel |
   | `title-statement` | `TitleStatement` | index, label, statement lines, footnote, ghostNumeral |
   | `cinematic-outro` | `CinematicOutro` | kicker, closingLine |

   Rules enforced by the schema: unique scene ids, positive durations,
   lowercase kebab-case ids, **at most one accented line per scene**, and no
   unknown fields (a typo is an error).

3. **Validate**

   ```bash
   npm run validate -- --project <project-id>
   ```

   This prints the scene table, frame timeline and total duration, and fails
   with one line per issue.

4. **Register the composition** in `src/Root.tsx`:

   ```tsx
   import otherProjectJson from '../projects/<project-id>/manifest.json';
   const otherProject = parseProjectManifest(otherProjectJson);
   ...
   <Composition
     id="OtherProject"
     component={ProjectVideo}
     defaultProps={{project: otherProject}}
     durationInFrames={calculateProjectDurationInFrames(otherProject.scenes, defaultProfile.fps)}
     fps={defaultProfile.fps}
     width={defaultProfile.width}
     height={defaultProfile.height}
   />
   ```

5. **Add render scripts** in `package.json` for preview and final output.

6. **Render and check**:

   ```bash
   npm run typecheck
   npm test
   npm run dev                     # review in Studio
   npx remotion render <id> out/<file>.mp4
   ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate out/<file>.mp4
   ```

## B. New scene type

A scene type touches four places; TypeScript enforces three of them.

1. **Schema** — add a content schema and a scene object in
   `src/schemas/project-schema.ts`, add it to `sceneSchema`'s
   `discriminatedUnion` and to `supportedSceneTypes`.
2. **Component** — build `src/components/<Scene>.tsx` from existing primitives
   (`Backdrop`, `RevealText`, `ScreenChrome`, `SideRail`, `BrandMark`) and
   theme tokens only. Props are `{brand, content}`. Never import a manifest.
3. **Registry** — add the entry to `src/scenes/registry.tsx`. Omitting it is a
   compile error; adding it for a type that has no schema member is also a
   compile error.
4. **Tests** — update `test/registry.test.ts` expectations if the canonical
   list changes, and add a schema test for the new content.

## C. Checklist before calling a video done

- [ ] All claims in narration are approved facts or clearly framed as opinion.
- [ ] Every scene's narration fits its scene duration (or the duration was
      set to fit the narration).
- [ ] Text stays inside the safe area and is legible at 960×540 preview.
- [ ] Cyan is used once per scene.
- [ ] `npm run validate -- --project <id>` passes.
- [ ] `npm run typecheck` and `npm test` pass.
- [ ] Preview rendered and reviewed.
- [ ] Final MP4 rendered, FFprobe-checked (resolution, fps, codec, duration,
      audio stream).
- [ ] No secrets, recordings, or large generated files committed.
