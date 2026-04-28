'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { installCodex, installClaude, PACKAGE_NAME } = require('../bin/install.js');

let tmpDir;

before(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stz-install-test-'));
});

after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ── Codex install ─────────────────────────────────────────────────────────────

test('Codex install: creates suite root with package contents', () => {
  const codexRoot = path.join(tmpDir, 'codex-global');
  installCodex('global', codexRoot);

  const suiteRoot = path.join(codexRoot, PACKAGE_NAME);
  assert.ok(fs.existsSync(suiteRoot), 'suite root should exist');
  assert.ok(fs.existsSync(path.join(suiteRoot, 'shared', 'slack-to-zoom', 'core', 'executor.md')), 'executor.md should be in suite');
  assert.ok(fs.existsSync(path.join(suiteRoot, 'shared', 'slack-to-zoom', 'stages', '01-discover.md')), 'stage files should be present');
});

test('Codex install: stz-* skills are real directories, not symlinks', () => {
  const codexRoot = path.join(tmpDir, 'codex-symlink-check');
  installCodex('global', codexRoot);

  const skillsRoot = path.join(codexRoot, 'skills');
  const stzSkills = fs.readdirSync(skillsRoot).filter(n => n.startsWith('stz-'));
  assert.ok(stzSkills.length >= 7, `expected at least 7 stz-* skills, got ${stzSkills.length}`);

  for (const skillName of stzSkills) {
    const skillPath = path.join(skillsRoot, skillName);
    const stat = fs.lstatSync(skillPath);
    assert.ok(!stat.isSymbolicLink(), `${skillName} should be a real directory, not a symlink`);
    assert.ok(stat.isDirectory(), `${skillName} should be a directory`);
  }
});

test('Codex install: SKILL.md files have absolute paths (no relative ../../shared)', () => {
  const codexRoot = path.join(tmpDir, 'codex-paths');
  installCodex('global', codexRoot);

  const skillsRoot = path.join(codexRoot, 'skills');
  const stzSkills = fs.readdirSync(skillsRoot).filter(n => n.startsWith('stz-') || n === 'slack-to-zoom');

  for (const skillName of stzSkills) {
    const skillMd = path.join(skillsRoot, skillName, 'SKILL.md');
    if (!fs.existsSync(skillMd)) continue;
    const contents = fs.readFileSync(skillMd, 'utf8');
    assert.ok(!contents.includes('../../shared/slack-to-zoom/'),
      `${skillName}/SKILL.md should not contain relative paths`);
  }
});

test('Codex install: SKILL.md files have codex adapter header', () => {
  const codexRoot = path.join(tmpDir, 'codex-adapter');
  installCodex('global', codexRoot);

  const skillsRoot = path.join(codexRoot, 'skills');
  const stzSkills = fs.readdirSync(skillsRoot).filter(n => n.startsWith('stz-') || n === 'slack-to-zoom');

  for (const skillName of stzSkills) {
    const skillMd = path.join(skillsRoot, skillName, 'SKILL.md');
    if (!fs.existsSync(skillMd)) continue;
    const contents = fs.readFileSync(skillMd, 'utf8');
    assert.ok(contents.startsWith('<codex_skill_adapter>'),
      `${skillName}/SKILL.md should start with codex adapter`);
    assert.ok(contents.includes('</codex_skill_adapter>'),
      `${skillName}/SKILL.md should close the adapter tag`);
  }
});

test('Codex install: absolute paths in SKILL.md resolve to real files', () => {
  const codexRoot = path.join(tmpDir, 'codex-resolve');
  installCodex('global', codexRoot);

  const migrateSkillMd = path.join(codexRoot, 'skills', 'stz-migrate', 'SKILL.md');
  const contents = fs.readFileSync(migrateSkillMd, 'utf8');

  // Extract absolute paths from backtick references
  const matches = contents.match(/`([^`]+\.md)`/g) || [];
  for (const match of matches) {
    const filePath = match.slice(1, -1);
    if (path.isAbsolute(filePath)) {
      assert.ok(fs.existsSync(filePath), `referenced file should exist: ${filePath}`);
    }
  }
});

test('Codex install: does not copy .git or node_modules', () => {
  const codexRoot = path.join(tmpDir, 'codex-exclude');
  installCodex('global', codexRoot);

  const suiteRoot = path.join(codexRoot, PACKAGE_NAME);
  assert.ok(!fs.existsSync(path.join(suiteRoot, '.git')), '.git should not be copied');
  assert.ok(!fs.existsSync(path.join(suiteRoot, 'node_modules')), 'node_modules should not be copied');
});

// ── Claude install ────────────────────────────────────────────────────────────

test('Claude install: creates commands and skill directories', () => {
  const claudeRoot = path.join(tmpDir, 'claude-global');
  installClaude('global', claudeRoot);

  assert.ok(fs.existsSync(path.join(claudeRoot, 'skills', PACKAGE_NAME, 'SKILL.md')), 'SKILL.md should exist');
  assert.ok(fs.existsSync(path.join(claudeRoot, 'commands', 'stz')), 'stz commands dir should exist');
});

test('Claude install: command files have absolute paths', () => {
  const claudeRoot = path.join(tmpDir, 'claude-paths');
  installClaude('global', claudeRoot);

  const commandDir = path.join(claudeRoot, 'commands', 'stz');
  const commandFiles = fs.readdirSync(commandDir).filter(f => f.endsWith('.md'));
  assert.ok(commandFiles.length > 0, 'should have command files');

  for (const file of commandFiles) {
    const contents = fs.readFileSync(path.join(commandDir, file), 'utf8');
    assert.ok(!contents.includes('../../../shared/slack-to-zoom/'),
      `${file} should not contain relative paths`);
  }
});
