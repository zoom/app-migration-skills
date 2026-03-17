# Claude Skill Wrapper

This directory only contains Claude-specific wiring for the Slack-to-Zoom migration skill.

Shared migration logic is in `../../../shared/slack-to-zoom/`.

## Install

Install from the repo root inside Claude Code:

```text
/plugin marketplace add "<repo-root>"
/plugin install slack-to-zoom@slack-to-zoom
```

## Commands

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

## Files

- `SKILL.md` Claude skill definition
- `commands/` Claude slash-command metadata
- `.claude-plugin/` Claude marketplace metadata
