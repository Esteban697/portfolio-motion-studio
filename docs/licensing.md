# Licensing notes

## Remotion

**Verdict: source-available, not OSI-approved open source.** Do not describe
this project as built on open-source video software.

Checked against the upstream license on 2026-11-09:

- Package: `remotion@4.0.542`, `@remotion/cli@4.0.542`
- License field: `SEE LICENSE IN LICENSE.md`
- Upstream text: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
- License FAQ: https://www.remotion.dev/license

### Free License eligibility

One of the following applies:

- an individual;
- a for-profit organization with **up to 3 employees**;
- a non-profit or not-for-profit organization;
- a party evaluating whether Remotion is a good fit, not yet using it
  commercially.

Eligible parties may use Remotion non-commercially or commercially to create
videos and images, and may modify it for their own use or to contribute fixes.

### Paid license

A for-profit organization with **more than 3 employees** must obtain a Company
License.

### Restriction

It is not permitted to copy or modify Remotion code for the purpose of
selling, renting, licensing, relicensing or sublicensing your own derivative
of Remotion. Producing videos *with* Remotion — the intended use here — is a
different matter from redistributing Remotion as a product.

### Project decision

This project is for the owner's personal portfolio and personal projects
(individual use). That falls under the Free License.

**Re-check this** if the project becomes company work, is used by a team
larger than three, or is offered as a product to others.

## Framework alternatives considered

The implementation brief required that, if strict OSI licensing were required,
we stop and present **Motion Canvas** (MIT) before committing. The owner
confirmed Remotion on 2026-11-09. No alternative engine is implemented.

## Other dependencies

| Dependency | License | Role |
| --- | --- | --- |
| React / React DOM | MIT | UI runtime |
| TypeScript | Apache-2.0 | Type checking |
| FFmpeg / FFprobe (system) | LGPL/GPL build-dependent | Media inspection (the Gyan "full" build used locally is GPL) |

Versions are pinned in `package.json`. Review new dependencies before adding
them.

## Fonts

No font files are bundled. Rendering uses an installed system font
(Inter → Segoe UI → system UI). If a brand font is added later, its license
must be recorded here and the file's redistribution rights confirmed.
