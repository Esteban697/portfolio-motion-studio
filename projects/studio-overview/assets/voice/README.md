# Placeholder narration

These WAV files are **temporary placeholders**, not real narration.

- Generated locally on 2026-11-09 with the Windows SAPI voice
  "Microsoft Zira Desktop".
- Format: 48 kHz, 16-bit mono PCM.
- Purpose: time the 70-second `studio-overview` sample and exercise the
  voiceover pipeline end to end.

Replace them with your own recordings at the same filenames (or update each
`voiceover.src` in `projects/studio-overview/manifest.json`), then run:

```bash
npm run validate -- --project studio-overview
npm run render:overview
```
