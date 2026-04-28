'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  buildCodexAdapter,
  rewriteCodexReferences,
  rewriteClaudeReferences,
  rewriteClaudeSkillContents,
  PACKAGE_NAME,
} = require('../bin/install.js');

const FAKE_SUITE_ROOT = '/fake/home/.codex/slack-to-zoom';
const FAKE_CLAUDE_ROOT = '/fake/home/.claude';

// ── buildCodexAdapter ────────────────────────────────────────────────────────

test('buildCodexAdapter: stz-migrate includes sub-skills list', () => {
  const adapter = buildCodexAdapter('stz-migrate');
  assert.ok(adapter.includes('<codex_skill_adapter>'), 'missing opening tag');
  assert.ok(adapter.includes('</codex_skill_adapter>'), 'missing closing tag');
  assert.ok(adapter.includes('$stz-migrate'), 'missing invocation line');
  assert.ok(adapter.includes('$stz-discover'), 'missing sub-skill stz-discover');
  assert.ok(adapter.includes('$stz-map'), 'missing sub-skill stz-map');
  assert.ok(adapter.includes('$stz-generate'), 'missing sub-skill stz-generate');
  assert.ok(adapter.includes('$stz-validate'), 'missing sub-skill stz-validate');
  assert.ok(adapter.includes('$stz-handoff'), 'missing sub-skill stz-handoff');
});

test('buildCodexAdapter: slack-to-zoom (legacy alias) includes sub-skills list', () => {
  const adapter = buildCodexAdapter('slack-to-zoom');
  assert.ok(adapter.includes('Individual stage sub-skills:'), 'missing sub-skills section');
});

test('buildCodexAdapter: sub-skill (stz-map) does NOT include full sub-skills list', () => {
  const adapter = buildCodexAdapter('stz-map');
  assert.ok(adapter.includes('$stz-map'), 'missing own invocation');
  assert.ok(!adapter.includes('Individual stage sub-skills:'), 'should not include sub-skills section');
  assert.ok(!adapter.includes('$stz-discover'), 'should not list other sub-skills');
});

test('buildCodexAdapter: each sub-skill has its own invocation line', () => {
  for (const skill of ['stz-discover', 'stz-map', 'stz-generate', 'stz-document', 'stz-validate', 'stz-handoff']) {
    const adapter = buildCodexAdapter(skill);
    assert.ok(adapter.includes(`$${skill}`), `missing invocation for ${skill}`);
  }
});

// ── rewriteCodexReferences ───────────────────────────────────────────────────

test('rewriteCodexReferences: rewrites relative path to absolute', () => {
  const input = 'Read `../../shared/slack-to-zoom/core/executor.md`.';
  const result = rewriteCodexReferences(input, FAKE_SUITE_ROOT, 'stz-migrate');
  const expected = path.join(FAKE_SUITE_ROOT, 'shared', 'slack-to-zoom').replace(/\\/g, '/');
  assert.ok(result.includes(expected), `expected absolute path ${expected} in result`);
  assert.ok(!result.includes('../../shared/slack-to-zoom/'), 'relative path should be gone');
});

test('rewriteCodexReferences: prepends adapter header', () => {
  const input = '---\nname: stz-map\n---\n';
  const result = rewriteCodexReferences(input, FAKE_SUITE_ROOT, 'stz-map');
  assert.ok(result.startsWith('<codex_skill_adapter>'), 'adapter header must be first');
});

test('rewriteCodexReferences: rewrites all occurrences', () => {
  const input = [
    'Read `../../shared/slack-to-zoom/core/executor.md`.',
    'Read `../../shared/slack-to-zoom/stages/01-discover.md`.',
  ].join('\n');
  const result = rewriteCodexReferences(input, FAKE_SUITE_ROOT, 'stz-migrate');
  assert.ok(!result.includes('../../shared/slack-to-zoom/'), 'all relative paths should be replaced');
  const expected = path.join(FAKE_SUITE_ROOT, 'shared', 'slack-to-zoom').replace(/\\/g, '/');
  const count = (result.match(new RegExp(expected.replace(/\//g, '\\/'), 'g')) || []).length;
  assert.equal(count, 2, 'both paths should be rewritten');
});

// ── rewriteClaudeReferences ──────────────────────────────────────────────────

test('rewriteClaudeReferences: rewrites ../../../shared/slack-to-zoom/ to absolute', () => {
  const input = 'Read `../../../shared/slack-to-zoom/core/instructions.md`.';
  const result = rewriteClaudeReferences(input, FAKE_SUITE_ROOT);
  const expected = path.join(FAKE_SUITE_ROOT, 'shared', 'slack-to-zoom').replace(/\\/g, '/');
  assert.ok(result.includes(expected), `expected absolute path in result`);
  assert.ok(!result.includes('../../../shared/slack-to-zoom/'), 'relative path should be gone');
});

// ── rewriteClaudeSkillContents ───────────────────────────────────────────────

test('rewriteClaudeSkillContents: rewrites both shared path and command path', () => {
  const input = [
    'Read `../../../shared/slack-to-zoom/core/executor.md`.',
    'Command: commands/stz-migrate.md',
  ].join('\n');
  const result = rewriteClaudeSkillContents(input, FAKE_SUITE_ROOT, FAKE_CLAUDE_ROOT);
  const expectedShared = path.join(FAKE_SUITE_ROOT, 'shared', 'slack-to-zoom').replace(/\\/g, '/');
  assert.ok(result.includes(expectedShared), 'shared path should be absolute');
  assert.ok(!result.includes('../../../shared/slack-to-zoom/'), 'relative shared path should be gone');
  assert.ok(!result.includes('commands/stz-migrate.md'), 'relative command path should be gone');
});
