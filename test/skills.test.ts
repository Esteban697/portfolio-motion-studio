import {readFileSync, readdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {supportedSceneTypes} from '../src/schemas/project-schema';

const skillsDir = resolve(process.cwd(), '.claude/skills');

const skillNames = readdirSync(skillsDir, {withFileTypes: true})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const readSkill = (name: string): string =>
  readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');

describe('production skills', () => {
  it('provides the four Phase 4 skills', () => {
    expect(skillNames).toEqual([
      'project-analyzer',
      'script-writer',
      'storyboard-generator',
      'video-producer',
    ]);
  });

  it('gives every skill valid frontmatter', () => {
    for (const name of skillNames) {
      const content = readSkill(name);

      expect(content.startsWith('---\n')).toBe(true);
      expect(content).toMatch(new RegExp(`^name: ${name}$`, 'm'));
      expect(content).toMatch(/^description: .{20,}$/m);
    }
  });

  it('keeps the storyboard skill in sync with supported scene types', () => {
    // Adding a scene type must update the skill that chooses between them.
    const storyboard = readSkill('storyboard-generator');

    for (const type of supportedSceneTypes) {
      expect(storyboard).toContain(`\`${type}\``);
    }
  });

  it('documents the final-render approval gate', () => {
    const producer = readSkill('video-producer');

    expect(producer).toContain('--final');
    expect(producer).toContain('finalRender');
  });

  it('forbids publishing in the producer skill', () => {
    expect(readSkill('video-producer').toLowerCase()).toContain('never upload');
  });

  it('keeps the analyzer read-only and reference-driven', () => {
    const analyzer = readSkill('project-analyzer').toLowerCase();

    expect(analyzer).toContain('read only');
    expect(analyzer).toContain('untrusted data');
    expect(analyzer).toContain('never invent');
  });
});
