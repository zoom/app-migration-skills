---
name: stz-migrate
description: Run the full Slack-to-Zoom migration workflow end to end. Use this for the complete staged flow from discovery through validation and handoff.
---

# STZ Migrate

Use this skill for the full migration workflow.

## Workflow

1. Read `../../shared/slack-to-zoom/core/executor.md`.
2. Read `../../shared/slack-to-zoom/core/instructions.md`.
3. Execute all stage docs in `../../shared/slack-to-zoom/stages/` in order.
4. Generate the output app in the working directory.
5. Validate with tests and a startup check before closing.
