---
name: slack-to-zoom
description: Legacy alias for the full Slack-to-Zoom migration flow. Prefer the `stz-migrate` skill for the namespaced workflow.
---

# Slack to Zoom Team Chat Migration Skill

This is the legacy full-flow alias. Prefer `stz-migrate`.

This Codex wrapper exposes the same migration system used by the Claude skill, but with Codex-oriented execution guidance.

## When to use

Use this skill when the user wants to:

- migrate a Slack app or bot to Zoom Team Chat
- analyze Slack feature parity against Zoom
- generate a Zoom Team Chat TypeScript implementation
- produce migration documentation and setup instructions

## Workflow

1. Parse the GitHub URL or local path from the user request.
2. Read `../../shared/slack-to-zoom/core/executor.md`.
3. Read `../../shared/slack-to-zoom/core/instructions.md`.
4. Read the explicit stage docs in `../../shared/slack-to-zoom/stages/` and execute them in order unless the user asks for a single stage only.
5. Use shared references from `../../shared/slack-to-zoom/` as needed.
6. Generate the output app in the working directory.
7. Validate with tests and a server startup check before closing the task.

## Runtime notes

- Prefer the shared templates in `../../shared/slack-to-zoom/templates/general/`.
- Keep user-facing progress concise and factual.
- If credentials are needed for optional live validation, ask only after core local validation is complete.

## Shared references

- `../../shared/slack-to-zoom/docs/API_MAPPING_REFERENCE.md`
- `../../shared/slack-to-zoom/docs/RICH_FORMATTING_CHECKLIST.md`
- `../../shared/slack-to-zoom/reference/COMMON_BUGS.md`
- `../../shared/slack-to-zoom/examples/poker-planner-zoom/`
