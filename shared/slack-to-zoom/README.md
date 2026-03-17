# Shared Slack-to-Zoom Core

This directory holds the migration knowledge used by both runtime wrappers.

## Contents

- `core/` shared execution flow and technical instructions
- `docs/` detailed API references and implementation notes
- `examples/` representative migrated applications
- `reference/` review and validation aids
- `templates/` starter code used during generation

## Editing rule

If a change affects how the migration works, prefer changing it here first.

Only update the Claude or Codex wrapper when the change is about:

- command syntax
- tool/runtime constraints
- marketplace or agent metadata
