# Codex Skills

This directory contains the packaged Codex-facing skill entrypoints that are installed into `~/.codex/skills` or `./.codex/skills`.

Each skill here can reference shared implementation content elsewhere in the repository because the installer places the full suite into `~/.codex/slack-to-zoom` or `./.codex/slack-to-zoom` before linking the skill entrypoint.

Codex uses `$` skill invocation syntax. The preferred namespace is:

- `$stz-migrate`
- `$stz-discover`
- `$stz-map`
- `$stz-generate`
- `$stz-document`
- `$stz-validate`
- `$stz-handoff`

Example:

```text
$stz-migrate https://github.com/example/slack-app
```
