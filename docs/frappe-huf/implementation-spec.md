# Implementation Spec

This document defines the concrete target architecture and the exact code areas that should change first.

## Objective

Build a TinyKit fork that:

1. keeps the current SvelteKit builder and generated app runtime shape
2. removes PocketBase as the backend dependency
3. uses a Frappe app for platform/backend concerns
4. uses HUF for AI, orchestration, triggers, knowledge, and observability

## Non-goals for the first milestone

Do not attempt all of these in milestone 1:

- full arbitrary backend-code execution
- fully normalized relational modeling of all project JSON
- complete generated-app auth productization
- community showcase marketplace

## Target architecture

### TinyKit frontend and runtime

Keep in this repo:

- studio UI
- builder UX
- code editor
- compiler / preview
- generated app runtime helpers
- route structure for `/tinykit`, `/_tk/*`, and domain-based serving

### Frappe backend app

Create a new Frappe app that owns:

- TinyKit project persistence
- project settings
- project assets/files
- domain resolution
- runtime data CRUD
- project auth/permissions
- project build metadata

### HUF layer

Use HUF for:

- builder AI execution
- project mutation tools
- agent memory / runs / observability
- flows
- scheduled/background automation
- knowledge features
- MCP/tool integrations

## Required repo changes in TinyKit

### 1. Add a backend abstraction layer

This is the most important first code change.

Create a new area:

- `src/lib/backend/`

Suggested files:

- `src/lib/backend/types.ts`
- `src/lib/backend/auth.ts`
- `src/lib/backend/projects.ts`
- `src/lib/backend/runtime-data.ts`
- `src/lib/backend/assets.ts`
- `src/lib/backend/realtime.ts`
- `src/lib/backend/index.ts`

Define interfaces such as:

- `AuthClient`
- `ProjectRepository`
- `RuntimeDataClient`
- `AssetClient`
- `RealtimeClient`

### 2. Create a PocketBase adapter behind the new interfaces

Move PocketBase-specific behavior behind the adapter.

First files to wrap:

- `src/lib/pocketbase.svelte.ts`
- `src/lib/services/project.svelte.ts`
- `src/lib/server/pb.ts`

Expected result:

- UI code should stop importing PocketBase directly where practical.
- UI code should import abstractions or backend services instead.

### 3. Replace direct frontend imports gradually

Refactor these high-value consumers first:

- `src/routes/tinykit/studio/project.svelte.ts`
- `src/routes/tinykit/lib/api.svelte.ts`
- `src/routes/tinykit/studio/panels/data/DataPanel.svelte`
- `src/routes/tinykit/studio/panels/agent/AgentPanel.svelte`
- `src/routes/tinykit/studio/+page.svelte`

Expected result:

- state management remains the same
- underlying backend source becomes swappable

### 4. Preserve runtime contracts

These endpoints are product contracts and should be preserved, even if their implementations change:

- `src/routes/_tk/data/[project_id]/[collection]/+server.ts`
- `src/routes/_tk/data/[project_id]/[collection]/[id]/+server.ts`
- `src/routes/_tk/assets/[filename]/+server.ts`
- `src/routes/_tk/realtime/[project_id]/+server.ts`

Implementation change:

- stop depending on PocketBase internals
- delegate to a Frappe-backed service or proxy-compatible backend client

### 5. Preserve domain-serving behavior

Keep these routes working with the new backend:

- `src/hooks.server.ts`
- `src/routes/+server.ts`

The Frappe-backed path still needs:

- normalize incoming host
- resolve project by domain
- serve published build artifact
- redirect to new project setup if none exists

## Frappe backend app spec

## Initial DocTypes

### `TinyKit Project`

Use this as the main persistence unit first.

Recommended fields:

- `project_name`
- `domain`
- `frontend_code`
- `backend_code`
- `custom_instructions`
- `published_html_file`
- `design_json`
- `content_json`
- `snapshots_json`
- `agent_chat_json`
- `data_json`
- `settings_json`
- `status`

Early choice:

- use JSON/text fields generously
- preserve TinyKit's existing document-oriented model

### `TinyKit Setting`

For:

- platform settings
- migration flags
- showcase settings later
- non-project config

### `TinyKit Domain`

Optional in milestone 1, but useful if domain routing grows.

Can store:

- hostname
- project
- is_primary
- ssl / provisioning metadata later

### `TinyKit Build`

Optional in milestone 1, useful if builds become more than one file attachment.

Can track:

- project
- artifact file
- built_at
- built_by
- status

## Backend API compatibility

The Frappe app should support these TinyKit needs first.

### Project APIs

Needed behaviors:

- list projects
- get project by id
- get project by domain
- create project
- update project
- delete project

### Runtime data APIs

Needed behaviors:

- list collection records
- create record
- read single record
- update record
- delete record
- validate basic schema
- support file upload fields

### Asset APIs

Needed behaviors:

- upload project asset
- serve asset by filename and project context
- support placeholder assets or preserve existing helper behavior

### Realtime APIs

Needed behaviors:

- notify builder when project chat changes
- notify builder when data changes
- optionally notify code/content/design changes

Acceptable milestone 1 implementations:

- Frappe realtime bridge
- SSE endpoint backed by Frappe polling
- short-interval polling fallback

## HUF integration spec

## Builder AI should move to HUF

Replace the current bespoke AI route behavior in:

- `src/routes/api/projects/[id]/agent/+server.ts`

Target behavior:

- prompt is sent to a HUF-backed builder agent
- HUF agent uses project-mutation tools
- HUF run history becomes the authoritative execution/audit trail

## Required HUF tools for TinyKit

Create tool equivalents for current mutation helpers:

- update project code
- add content field
- update content field
- add design field
- update design field
- create data collection
- insert data records
- create snapshot
- publish build

Current TinyKit behavior to mirror lives in:

- `src/lib/server/pb.ts`
- `src/lib/ai/sdk-agent.ts`

## Recommended HUF-side agent design

Create:

- one primary "TinyKit Builder Agent"
- project mutation tools scoped to a specific `TinyKit Project`
- optional supporting agents later for data design, UI polish, and debugging

## Authentication strategy

## TinyKit admin auth

Replace PocketBase user auth with a Frappe-compatible auth path.

Initial acceptable options:

- SvelteKit server authenticates against Frappe session
- token-based API calls issued by Frappe-authenticated users

### Files to revisit

- `src/lib/pocketbase.svelte.ts`
- `src/routes/login/+page.svelte`
- `src/routes/api/auth/save-server-credentials/+server.ts`
- `src/routes/api/settings/+server.ts`

## Generated-app auth

Treat this as phase 2 or phase 3.

Goal:

- Frappe-backed login/signup/OAuth for generated apps

Do not block milestone 1 on it.

## Exact change map for developers and agents

## Area A: Introduce backend abstraction

Change:

- add `src/lib/backend/*`

Why:

- makes PocketBase removable without rewriting all studio code at once

## Area B: Remove direct PocketBase assumptions from studio state

Change first:

- `src/routes/tinykit/studio/project.svelte.ts`

Why:

- it is the coordination point for realtime, project state, code/content/design/data sync

## Area C: Replace builder API implementation

Change:

- `src/routes/api/projects/[id]/agent/+server.ts`

Why:

- highest-value HUF integration point
- currently custom and should become HUF-backed

## Area D: Replace project server service

Change:

- `src/lib/server/pb.ts`

Why:

- this is currently TinyKit's real server backend layer
- it should become either:
  - a backend-neutral service facade, or
  - a Frappe-backed implementation

## Area E: Replace generated app runtime data backend

Change:

- `src/routes/_tk/data/*`
- `src/routes/_tk/assets/*`
- `src/routes/_tk/realtime/*`

Why:

- generated apps depend on these routes directly
- preserving them keeps frontend app behavior stable

## Area F: Replace domain and published app resolution

Change:

- `src/hooks.server.ts`
- `src/routes/+server.ts`

Why:

- keeps deploy and domain semantics unchanged for users

## Deliverable for milestone 1

Milestone 1 is complete when:

1. TinyKit runs without PocketBase as the source of truth.
2. Projects are persisted in Frappe.
3. `/_tk/data` works against Frappe-backed project data.
4. `/_tk/assets` serves project assets from Frappe files.
5. Builder AI uses HUF-backed project mutation tools.
6. Domain-based published app serving still works.
