'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { installCodex, installClaude, PACKAGE_NAME } = require('../bin/install.js');

let tmpDir;
let codexRoot;
let claudeRoot;

before(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stz-smoke-test-'));
  codexRoot = path.join(tmpDir, '.codex');
  claudeRoot = path.join(tmpDir, '.claude');
  installCodex('global', codexRoot);
  installClaude('global', claudeRoot);
});

after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ── Codex skill resolution ────────────────────────────────────────────────────

const STZ_SKILLS = ['stz-migrate', 'stz-discover', 'stz-map', 'stz-generate', 'stz-document', 'stz-validate', 'stz-handoff'];

for (const skillName of STZ_SKILLS) {
  test(`Codex: $${skillName} SKILL.md is readable and non-empty`, () => {
    const skillMd = path.join(codexRoot, 'skills', skillName, 'SKILL.md');
    assert.ok(fs.existsSync(skillMd), `${skillName}/SKILL.md should exist after install`);
    const contents = fs.readFileSync(skillMd, 'utf8');
    assert.ok(contents.length > 100, 'SKILL.md should have substantial content');
    assert.ok(contents.includes(`name: ${skillName}`), 'SKILL.md should have correct name in frontmatter');
  });

  test(`Codex: $${skillName} all referenced .md files exist on disk`, () => {
    const skillMd = path.join(codexRoot, 'skills', skillName, 'SKILL.md');
    const contents = fs.readFileSync(skillMd, 'utf8');

    const refs = contents.match(/`([^`]+\.md)`/g) || [];
    for (const ref of refs) {
      const filePath = ref.slice(1, -1);
      if (path.isAbsolute(filePath)) {
        assert.ok(fs.existsSync(filePath),
          `${skillName} references non-existent file: ${filePath}`);
      }
    }
  });
}

test('Codex: $stz-migrate lists all sub-skills in adapter', () => {
  const contents = fs.readFileSync(path.join(codexRoot, 'skills', 'stz-migrate', 'SKILL.md'), 'utf8');
  for (const sub of STZ_SKILLS.filter(s => s !== 'stz-migrate')) {
    assert.ok(contents.includes(`$${sub}`), `stz-migrate adapter should list $${sub}`);
  }
});

test('Codex: suite shared content exists and is populated', () => {
  const suiteShared = path.join(codexRoot, PACKAGE_NAME, 'shared', 'slack-to-zoom');
  const requiredDirs = ['core', 'stages', 'docs', 'reference', 'templates', 'examples'];
  for (const dir of requiredDirs) {
    assert.ok(fs.existsSync(path.join(suiteShared, dir)),
      `shared/${dir} should exist in suite root`);
  }
});

// ── Claude skill resolution ───────────────────────────────────────────────────

test('Claude: /stz:migrate command file is readable', () => {
  const migrateMd = path.join(claudeRoot, 'commands', 'stz', 'migrate.md');
  assert.ok(fs.existsSync(migrateMd), 'migrate.md command should exist');
  const contents = fs.readFileSync(migrateMd, 'utf8');
  assert.ok(contents.length > 50, 'migrate.md should have content');
});

test('Claude: SKILL.md references resolve to real files', () => {
  const skillMd = path.join(claudeRoot, 'skills', PACKAGE_NAME, 'SKILL.md');
  const contents = fs.readFileSync(skillMd, 'utf8');
  const refs = contents.match(/`([^`]+\.md)`/g) || [];
  for (const ref of refs) {
    const filePath = ref.slice(1, -1);
    if (path.isAbsolute(filePath)) {
      assert.ok(fs.existsSync(filePath), `Claude SKILL.md references non-existent: ${filePath}`);
    }
  }
});

test('Claude: all stz command files exist', () => {
  const commandDir = path.join(claudeRoot, 'commands', 'stz');
  const expected = ['migrate', 'discover', 'map', 'generate', 'document', 'validate', 'handoff'];
  for (const cmd of expected) {
    assert.ok(fs.existsSync(path.join(commandDir, `${cmd}.md`)),
      `stz/${cmd}.md command should exist`);
  }
});
