# Slack-to-Zoom Migration Skills

This repository now keeps the Slack-to-Zoom migration logic in one shared core and exposes it through two thin runtime wrappers:

- `claude/skills/slack-to-zoom-migrate/` for Claude Code
- `codex/skills/slack-to-zoom-migrate/` for Codex
- `shared/slack-to-zoom-migrate/` for the reusable migration instructions, references, templates, and examples

## Repository layout

```text
.
|-- claude/
|   `-- skills/slack-to-zoom-migrate/
|-- codex/
|   `-- skills/slack-to-zoom-migrate/
`-- shared/
    `-- slack-to-zoom-migrate/
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
- Codex skill trigger text and agent metadata for Codex

That split keeps the migration behavior in one place and reduces drift between skills.

## Installing the Claude skill

Clone the repository and register the Claude marketplace metadata from the repo root:

```bash
git clone git@github.com:zoom/app-migration-skills.git
cd app-migration-skills
/plugin marketplace add "$(pwd)"
/plugin install slack-to-zoom@app-migration-skills
```

The Claude marketplace points at `claude/skills/slack-to-zoom-migrate`.

## Installing the Codex skill

Link the Codex skill folder into your Codex skills directory:

```bash
mkdir -p ~/.codex/skills
ln -s "$(pwd)/codex/skills/slack-to-zoom-migrate" ~/.codex/skills/slack-to-zoom-migrate
```

The Codex skill reads the shared implementation from `shared/slack-to-zoom-migrate`.

## Updating the migration logic

1. Edit shared content in `shared/slack-to-zoom-migrate/`.
2. Update Claude-only or Codex-only wrapper text if runtime behavior changes.
3. Verify path references still resolve from both wrappers.

## Main entrypoints

- Shared workflow: `shared/slack-to-zoom-migrate/core/executor.md`
- Shared implementation guide: `shared/slack-to-zoom-migrate/core/instructions.md`
- Claude entrypoint: `claude/skills/slack-to-zoom-migrate/SKILL.md`
- Claude command: `claude/skills/slack-to-zoom-migrate/commands/slack-to-zoom-migrate.md`
- Codex entrypoint: `codex/skills/slack-to-zoom-migrate/SKILL.md`
