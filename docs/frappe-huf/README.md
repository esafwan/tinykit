# TinyKit Frappe + HUF Docs

This folder contains the architecture research and implementation plan for replatforming TinyKit onto Frappe with HUF as the backend intelligence layer.

## Suggested reading order

1. [research-assessment.md](./research-assessment.md)
2. [implementation-spec.md](./implementation-spec.md)
3. [dev-agent-guide.md](./dev-agent-guide.md)
4. [phased-plan.md](./phased-plan.md)
5. [research-deep-dive.md](./research-deep-dive.md)
6. [upstream-sync-map.md](./upstream-sync-map.md)

## Goal

Keep TinyKit's builder and generated app UX, while replacing PocketBase-centered backend concerns with:

- a Frappe backend app for project/data/auth/runtime concerns
- HUF for LLM orchestration, tools, workflows, knowledge, triggers, and observability

## Intended audience

- maintainers deciding if the fork should move forward
- developers implementing the backend migration
- coding agents that need exact file-level guidance

## Research archive

If you want the longer reasoning trail behind the spec, read:

- [research-deep-dive.md](./research-deep-dive.md)

## Upstream porting

For future agent-driven merges from upstream TinyKit, use:

- [upstream-sync-map.md](./upstream-sync-map.md)
