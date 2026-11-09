import {readFileSync} from 'node:fs';

/**
 * Reads and parses a JSON file, tolerating a UTF-8 BOM.
 *
 * Windows tooling (PowerShell's `Set-Content -Encoding utf8`, some editors)
 * prefixes files with U+FEFF, which `JSON.parse` rejects with a confusing
 * "Unexpected token" error. Manifests are hand-edited on Windows, so strip it.
 *
 * Throws the original SyntaxError for genuinely malformed JSON; callers add
 * file context.
 */
export const readJsonFile = (filePath: string): unknown => {
  const text = readFileSync(filePath, 'utf8').replace(/^﻿/, '');
  return JSON.parse(text) as unknown;
};
