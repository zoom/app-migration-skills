---
name: slack-to-zoom
description: Migrate a Slack app or bot to Zoom Team Chat using a GitHub URL or local path. Use this when the user wants code generation, API mapping, migration analysis, validation, or setup docs for a Slack-to-Zoom port.
---

# Slack to Zoom Team Chat Migration Skill

This Codex wrapper exposes the same migration system used by the Claude skill, but with Codex-oriented execution guidance.

## When to use

Use this skill when the user wants to:

- migrate a Slack app or bot to Zoom Team Chat
- analyze Slack feature parity against Zoom
- generate a Zoom Team Chat TypeScript implementation
- produce migration documentation and setup instructions

## Workflow

1. Parse the GitHub URL or local path from the user request.
2. Read `../../../shared/slack-to-zoom/core/executor.md`.
3. Read `../../../shared/slack-to-zoom/core/instructions.md`.
4. Use shared references from `../../../shared/slack-to-zoom/` as needed.
5. Generate the output app in the working directory.
6. Validate with tests and a server startup check before closing the task.

## Runtime notes

- Prefer the shared templates in `../../../shared/slack-to-zoom/templates/general/`.
- Keep user-facing progress concise and factual.
- If credentials are needed for optional live validation, ask only after core local validation is complete.

## Shared references

- `../../../shared/slack-to-zoom/docs/API_MAPPING_REFERENCE.md`
- `../../../shared/slack-to-zoom/docs/RICH_FORMATTING_CHECKLIST.md`
- `../../../shared/slack-to-zoom/reference/COMMON_BUGS.md`
- `../../../shared/slack-to-zoom/examples/poker-planner-zoom/`
