# Phased Plan

## Phase 0: Documentation and backend seam mapping

Deliverables:

- research docs
- implementation spec
- dev/agent guide
- migration branch

## Phase 1: Backend abstraction in TinyKit

Deliverables:

- `src/lib/backend/*`
- PocketBase adapter behind abstractions
- studio code consuming abstractions instead of direct backend imports

Exit criteria:

- no new migration-critical code depends directly on PocketBase

## Phase 2: Frappe project/data/asset backend

Deliverables:

- Frappe app with `TinyKit Project` and related DocTypes
- project CRUD APIs
- data CRUD APIs
- asset APIs
- domain lookup APIs

Exit criteria:

- TinyKit can read and update projects from Frappe
- runtime `/_tk/data` and `/_tk/assets` are Frappe-backed

## Phase 3: HUF builder integration

Deliverables:

- HUF-backed builder agent
- TinyKit project mutation tools in HUF
- run/cost/tool observability through HUF

Exit criteria:

- `/api/projects/[id]/agent` uses HUF-backed execution

## Phase 4: Realtime and publish hardening

Deliverables:

- Frappe realtime bridge or stable SSE fallback
- published app build serving through Frappe-backed metadata

Exit criteria:

- builder remains responsive during chat, data, and code changes
- production app serving still works by domain

## Phase 5: Product features TinyKit marked as coming soon

Deliverables:

- app auth for generated apps
- scheduled/backend route generation model
- showcase / template catalog
- richer HUF-powered workflow and knowledge features

Exit criteria:

- fork exceeds upstream TinyKit's current backend roadmap in real functionality
