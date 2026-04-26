# AGENTS.md

This file gives coding agents and developers the minimum context needed to work on the TinyKit Frappe + HUF replatforming effort in this fork.

## Scope of this fork

This branch documents and prepares a backend replatform:

- Keep TinyKit's SvelteKit builder, compiler, preview, and generated app UX.
- Replace PocketBase-backed backend concerns with a Frappe app.
- Use HUF as the AI, orchestration, workflow, trigger, and observability layer.

This is not a "replace everything with HUF" project.

The target architecture is:

- `TinyKit frontend/runtime` -> stays in this repo
- `TinyKit backend app on Frappe` -> new backend system
- `HUF` -> AI, tools, triggers, knowledge, flows, observability

## Read this first

Start with these docs in order:

1. `docs/frappe-huf/README.md`
2. `docs/frappe-huf/research-assessment.md`
3. `docs/frappe-huf/implementation-spec.md`
4. `docs/frappe-huf/dev-agent-guide.md`
5. `docs/frappe-huf/phased-plan.md`

## Current TinyKit backend reality

TinyKit currently depends heavily on PocketBase for:

- browser auth
- direct browser CRUD
- server-side project CRUD
- file storage
- realtime subscriptions
- project/settings persistence

Important touchpoints:

- `src/lib/pocketbase.svelte.ts`
- `src/lib/server/pb.ts`
- `src/lib/services/project.svelte.ts`
- `src/routes/tinykit/lib/api.svelte.ts`
- `src/routes/_tk/data/*`
- `src/routes/_tk/assets/*`
- `src/routes/_tk/realtime/*`
- `src/routes/api/projects/*`
- `src/hooks.server.ts`
- `src/routes/+server.ts`

## Migration rules

When implementing the Frappe/HUF backend migration:

1. Preserve TinyKit's generated app contract where possible.
2. Do not break these runtime surfaces without an explicit migration plan:
   - `/_tk/data/...`
   - `/_tk/assets/...`
   - `/_tk/realtime/...`
   - domain-based project resolution
3. Prefer adding an adapter layer before replacing backend code in-place.
4. Avoid adding new direct PocketBase dependencies in migration work.
5. Keep the `TinyKit Project` model denormalized at first; do not over-normalize early.

## What to change first

The first implementation work should focus on abstractions, not backend replacement.

Priority:

1. Introduce frontend/backend adapter interfaces.
2. Isolate PocketBase-specific behavior behind those interfaces.
3. Define Frappe-compatible API contracts matching current TinyKit expectations.
4. Move AI builder behavior toward HUF-backed project mutation tools.

## What not to do first

Do not begin by:

- rewriting the whole frontend
- replacing every route at once
- normalizing all project JSON into many entities
- trying to execute arbitrary user backend code immediately

## Generated app expectations

Generated apps expect these conventions to remain stable:

- one Svelte file
- Svelte 5 runes
- data via `$data`
- content via `$content`
- assets via runtime helpers
- domain-based serving

Backend migration should preserve these user-facing expectations.
