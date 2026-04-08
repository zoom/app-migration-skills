---
description: Run the full Slack-to-Zoom migration workflow
argument-hint: <github-url-or-path>
allowed-tools: [Bash, Read, Write, Glob, Grep, Task, AskUserQuestion, Edit]
---

# /stz:migrate

Run the full migration workflow.

Read:
- `../../../shared/slack-to-zoom/core/executor.md`
- `../../../shared/slack-to-zoom/core/instructions.md`
- `../../../shared/slack-to-zoom/stages/README.md`

Execute all stages in order for the provided GitHub URL or local path.
