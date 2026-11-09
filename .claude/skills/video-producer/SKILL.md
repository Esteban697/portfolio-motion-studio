---
name: video-producer
description: Validate an approved project, render a preview, inspect the output, and run the final render only after explicit approval. Use when the user asks to render, produce, export, check or inspect a video.
---

# Video Producer

Run the production commands, report real results, and stop at every approval
gate. This skill never publishes or uploads anything.

## Hard rules

- **Never upload or publish** to any service. If asked, require explicit
  confirmation for that specific action and still prefer a local file.
- **Never run the final render** unless the manifest has
  `"approvals": {"finalRender": true}` and the user has reviewed a preview.
- **Never weaken validation**, disable checks, or edit shared rendering code
  to make a project pass. Fix project data, or report the issue.
- **Never claim a render succeeded** without inspecting the produced file with
  FFprobe (resolution, frame rate, codec, duration, audio presence).
- Report the command, exit code, and the first actionable error. Do not
  swallow failures or summarise a stack trace away.

## Process

1. **Validate**

   ```bash
   npm run validate -- --project <id>
   ```

   Reports schema, scene ids, timeline, narration fit and approval state.
   Fix project-data errors with the user. Do not proceed on errors.

2. **Preview** (always before a final render)

   ```bash
   npm run render:<project>:preview
   # or
   npx remotion render <CompositionId> out/<id>-preview.mp4 --scale=0.5
   ```

3. **Inspect** the output:

   ```bash
   ffprobe -v error -show_entries format=duration,size \
     -show_entries stream=codec_name,codec_type,width,height,r_frame_rate,sample_rate \
     -of default=noprint_wrappers=1 out/<id>-preview.mp4
   ```

   Confirm resolution, fps, codec, duration, and whether an audio stream is
   present (absent is correct only when the project has no narration).

4. **Ask for approval.** Present the path and the exact metadata. Only after
   the user explicitly approves the preview:

   ```bash
   npm run validate -- --project <id> --final
   ```

   This fails unless facts, script, storyboard and final render are all
   approved in the manifest. If it fails, report which gates are missing;
   never set them yourself.

5. **Final render**

   ```bash
   npm run render:<project>
   ```

   Inspect the final file the same way and report its path, size and metadata.

6. **Stop.** Do not upload, post or schedule anything.

## Error playbook

| Symptom | Action |
| --- | --- |
| `Invalid manifest` / unrecognized key | Fix the reported path in `manifest.json`; manifests are strict |
| `asset not found` | Run `npm run assets`; if it persists, the path or file is missing |
| `narration is ... but the scene is ...` | Shorten the recording or raise `durationSeconds`; never auto-trim or time-stretch |
| `Final render is blocked` | Report the missing gates and ask the owner to review and approve |
| `FFprobe is required` | Instruct installing FFmpeg and ensuring `ffprobe` is on PATH |
| Render exits non-zero | Report command, exit code, first error; do not retry blindly |

## Reporting format

```text
Command:   npm run render:<project>
Exit:      0
Output:    out/<file>.mp4 (xx.x MB)
Video:     H.264 1920x1080 30/1 fps 82.005 s
Audio:     AAC 48000 Hz stereo (or: none - project has no narration)
Checks:    duration matches 2460 frames; no missing media
```
