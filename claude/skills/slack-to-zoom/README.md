# Claude Skill Wrapper

This directory only contains Claude-specific wiring for the Slack-to-Zoom migration skill.

Shared migration logic is in `../../../shared/slack-to-zoom/`.

## Install

Install with the package installer:

```bash
npx slack-to-zoom@latest --claude --global
```

That installs the suite into `~/.claude/slack-to-zoom`, copies the Claude skill into `~/.claude/skills/slack-to-zoom`, and installs slash commands into `~/.claude/commands/stz/`.

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
- `.claude-plugin/` legacy marketplace metadata
