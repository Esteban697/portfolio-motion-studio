# Adding a video

Phase 1 supports new **compositions** (a scene sequence you author in code).
Phase 2 adds project manifests so a new video is data, not code.

## A. New composition from existing scenes (works today)

1. **Create content.** Add `src/content/<name>.ts` exporting a typed object
   using the types in `src/content/types.ts`. Keep facts in this file — never
   in components. Mark placeholder copy as placeholder.
2. **Create the composition.** Add `src/compositions/<Name>.tsx`:
   ```tsx
   const introFrames = secondsToFrames(content.timing.introSeconds, fps);
   ```
   Sequence scene components with `<Sequence from durationInFrames>` and wrap
   each in `<SceneFade>`.
3. **Register it** in `src/Root.tsx` with `<Composition>`, using
   `defaultProfile` for width/height/fps and `secondsToFrames()` for
   `durationInFrames`.
4. **Add scripts** to `package.json` for preview and final renders.
5. **Check it**: `npm run typecheck`, then `npm run dev`, then render a
   preview and inspect the MP4 with FFprobe.
6. **Document it** in the README structure section if it becomes a template.

## B. New scene type

1. Define its content type in `src/content/types.ts`.
2. Build `src/components/<Scene>.tsx` using existing primitives
   (`Backdrop`, `RevealText`, `ScreenChrome`, `SideRail`, `BrandMark`) and
   theme tokens only.
3. Keep it prop-driven: no imports from `src/content/*`.
4. Verify at 1080p and at 720p preview scale.
5. Add it to the scene table in `docs/architecture.md`.

## C. New project (Phase 2+, planned)

```text
projects/<project-id>/
├── brief.md
├── facts.md
├── script.md
├── storyboard.json
├── manifest.json        # scenes + assets + timing
└── assets/
    ├── voice/scene-01.wav
    ├── images/
    ├── screenshots/
    └── music/
```

Then:

```bash
npm run validate -- --project <project-id>
npm run render:preview -- --project <project-id>
npm run render:final -- --project <project-id>
```

Never overwrite originals in `assets/`. Derived audio goes to
`assets/derived/`; outputs go to `out/<project-id>/`.

## Checklist before calling a video done

- [ ] All claims in narration are approved facts or clearly framed as opinion.
- [ ] Every scene's narration fits its scene duration (or the duration was
      set to fit the narration).
- [ ] Text stays inside the safe area and is legible at 720p.
- [ ] Cyan is used once per scene.
- [ ] `npm run typecheck` passes.
- [ ] Preview rendered and reviewed.
- [ ] Final MP4 rendered, FFprobe-checked (resolution, fps, codec, duration,
      audio stream).
- [ ] No secrets, recordings, or large generated files committed.
