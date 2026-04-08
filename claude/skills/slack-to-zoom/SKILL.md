---
name: slack-to-zoom
description: Converts Slack apps to Zoom Team Chat. Accepts a GitHub URL or local path, generates TypeScript code with API mappings, OAuth, webhooks, and docs. Invoke when the user wants to migrate, convert, or port a Slack app or bot to Zoom.
version: 1.0.0
---

# Slack to Zoom Team Chat Migration Skill

Use this Claude wrapper when the user wants a Slack app migrated to Zoom Team Chat.

## Runtime-specific entrypoints

Read these files first:

- `commands/stz-migrate.md` for the Claude command contract
- `../../../shared/slack-to-zoom/core/executor.md` for the execution flow
- `../../../shared/slack-to-zoom/core/instructions.md` for the implementation details
- `../../../shared/slack-to-zoom/stages/README.md` for the staged workflow model

## Shared resources

All migration knowledge lives in `../../../shared/slack-to-zoom/`.

Use these shared resources as needed:

- `../../../shared/slack-to-zoom/docs/API_MAPPING_REFERENCE.md`
- `../../../shared/slack-to-zoom/docs/ASYNC_OPERATIONS.md`
- `../../../shared/slack-to-zoom/docs/BUTTON_PATTERNS.md`
- `../../../shared/slack-to-zoom/docs/OMITTED_FIELDS.md`
- `../../../shared/slack-to-zoom/docs/code-examples/`
- `../../../shared/slack-to-zoom/reference/COMMON_BUGS.md`
- `../../../shared/slack-to-zoom/templates/general/`
- `../../../shared/slack-to-zoom/examples/poker-planner-zoom/`

## Output

Generate the Zoom app in `./slack-to-zoom-output/` or `<app-name>-zoom/`.
