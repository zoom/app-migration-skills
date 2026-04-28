# Slack-to-Zoom Migration Skills

This repository now keeps the Slack-to-Zoom migration logic in one shared core and exposes it through two thin runtime wrappers:

- `claude/skills/slack-to-zoom/` for Claude Code
- `skills/` for Codex
- `shared/slack-to-zoom/` for the reusable migration instructions, references, templates, and examples

## Repository layout

```text
.
|-- claude/
|   `-- skills/slack-to-zoom/
|-- skills/
|   |-- stz-migrate/
|   |-- stz-discover/
|   |-- stz-map/
|   |-- stz-generate/
|   |-- stz-document/
|   |-- stz-validate/
|   `-- stz-handoff/
`-- shared/
    `-- slack-to-zoom/
        |-- core/
        |-- docs/
        |-- examples/
        |-- reference/
        `-- templates/
```

## Development model

Use the shared directory for anything that should stay consistent across runtimes:

- migration workflow
- API mapping guidance
- templates
- examples
- validation notes

Only keep runtime-specific concerns in the runtime folders:

- command wiring and marketplace metadata for Claude
- skill trigger text and entrypoints for Codex

That split keeps the migration behavior in one place and reduces drift between skills.

The workflow is organized into a staged `stz` model:

- `migrate`: run the full workflow end to end
- `discover`: inspect the Slack app, inventory features, and identify blockers
- `map`: map Slack behaviors to Zoom Team Chat equivalents and note gaps
- `generate`: create the Zoom implementation from the chosen migration plan
- `document`: write setup, migration, and handoff documentation
- `validate`: run tests, startup checks, and optional live validation
- `handoff`: summarize results, limitations, and next steps for the customer

Use `migrate` as the default entrypoint. Use the other stages when you want to run or repeat one part of the workflow in isolation.

## Claude Code

### Install

```bash
git clone git@github.com:zoom/slack-to-zoom.git
cd slack-to-zoom
npx @zoom/slack-to-zoom@latest --claude --global
```

Or install into the current project:

```bash
npx @zoom/slack-to-zoom@latest --claude --local
```

That installs the suite directly into `~/.claude/slack-to-zoom` or `./.claude/slack-to-zoom`, adds the Claude skill under `skills/slack-to-zoom`, and adds slash commands under `commands/stz/`. No follow-up `/plugin` commands are required.

### Commands

Claude uses slash commands with the `stz:*` namespace:

- `/stz:migrate`
- `/stz:discover`
- `/stz:map`
- `/stz:generate`
- `/stz:document`
- `/stz:validate`
- `/stz:handoff`

Example:

```text
/stz:migrate https://github.com/example/slack-app
```

## Codex

### Install

Install with `npx`. If you run the installer without flags, it will prompt for runtime and install scope:

```bash
npx @zoom/slack-to-zoom@latest
```

For a direct Codex install, use:

```bash
npx @zoom/slack-to-zoom@latest --codex --global
```

For a project-local install, use:

```bash
npx @zoom/slack-to-zoom@latest --codex --local
```

The installer copies the full suite into a stable root:

- global: `~/.codex/slack-to-zoom`
- local: `./.codex/slack-to-zoom`

It then links all packaged skills from that suite root into the active Codex skills directory. This is the canonical install path for the project and is the supported model for shared references across `stz-*` skills.

### Skills

Codex uses skills invoked with `$`, not Claude-style slash commands:

- `$stz-migrate`
- `$stz-discover`
- `$stz-map`
- `$stz-generate`
- `$stz-document`
- `$stz-validate`
- `$stz-handoff`

The legacy `slack-to-zoom` skill remains as a compatibility alias.

Example:

```text
$stz-migrate https://github.com/example/slack-app
```

## Updating the migration logic

1. Edit shared content in `shared/slack-to-zoom/`.
2. Update Claude-only or Codex-only wrapper text if runtime behavior changes.
3. Verify path references still resolve from both wrappers.

The Codex suite is intentionally installed as one package root so thin `stz-*` skills can reference shared workflow content under `shared/slack-to-zoom/`.

## Main entrypoints

- Shared workflow: `shared/slack-to-zoom/core/executor.md`
- Shared implementation guide: `shared/slack-to-zoom/core/instructions.md`
- Claude entrypoint: `claude/skills/slack-to-zoom/SKILL.md`
- Claude command: `claude/skills/slack-to-zoom/commands/stz-migrate.md`
- Codex entrypoint: `skills/stz-migrate/SKILL.md`
