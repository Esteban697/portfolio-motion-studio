# Placeholder narration

These WAV files are **temporary placeholders**, not real narration.

- Generated locally on 2026-11-09 with the Windows SAPI voice
  "Microsoft Zira Desktop".
- Format: 48 kHz, 16-bit mono PCM.
- Purpose: exercise the voiceover pipeline (asset resolution, audio
  inspection, narration-vs-scene duration checks, render sync).

## Replacing them

Record your own narration in Audacity at 48 kHz and save it to the same
filenames, or update `voiceover.src` for each scene in
`projects/studio-sample/manifest.json`.

Keep the originals untouched. If you trim or normalize, write a derived copy
to a separate folder and point the manifest at that copy instead.

Then run:

```bash
npm run validate -- --project studio-sample
npm run render:sample
```
