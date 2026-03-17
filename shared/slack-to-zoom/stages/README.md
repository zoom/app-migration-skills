# Migration Stages

This directory breaks the Slack-to-Zoom migration workflow into reusable stages, similar to a phased command system.

Use these stages when you want a more structured execution flow:

1. `01-discover.md` for source analysis and capability inventory
2. `02-map.md` for Slack-to-Zoom feature mapping
3. `03-generate.md` for scaffold and implementation
4. `04-document.md` for migration docs and setup guidance
5. `05-validate.md` for tests, startup checks, and live validation
6. `06-handoff.md` for final summary, known gaps, and next steps

Runtime wrappers can invoke these stages individually or as one end-to-end workflow.
