---
name: slack-to-zoom-migrate
description: Converts Slack apps to Zoom Team Chat. Accepts a GitHub URL or local path, generates TypeScript code with API mappings, OAuth, webhooks, and docs. Invoke when the user wants to migrate, convert, or port a Slack app or bot to Zoom.
version: 1.0.0
---

# Slack to Zoom Team Chat Migration Skill

Use this Claude wrapper when the user wants a Slack app migrated to Zoom Team Chat.

## Runtime-specific entrypoints

Read these files first:

- `commands/slack-to-zoom-migrate.md` for the Claude command contract
- `../../../shared/slack-to-zoom-migrate/core/executor.md` for the execution flow
- `../../../shared/slack-to-zoom-migrate/core/instructions.md` for the implementation details

## Shared resources

All migration knowledge lives in `../../../shared/slack-to-zoom-migrate/`.

Use these shared resources as needed:

- `../../../shared/slack-to-zoom-migrate/docs/API_MAPPING_REFERENCE.md`
- `../../../shared/slack-to-zoom-migrate/docs/ASYNC_OPERATIONS.md`
- `../../../shared/slack-to-zoom-migrate/docs/BUTTON_PATTERNS.md`
- `../../../shared/slack-to-zoom-migrate/docs/OMITTED_FIELDS.md`
- `../../../shared/slack-to-zoom-migrate/docs/code-examples/`
- `../../../shared/slack-to-zoom-migrate/reference/COMMON_BUGS.md`
- `../../../shared/slack-to-zoom-migrate/templates/general/`
- `../../../shared/slack-to-zoom-migrate/examples/poker-planner-zoom/`

## Output

Generate the Zoom app in `./slack-to-zoom-migrate-output/` or `<app-name>-zoom/`.
