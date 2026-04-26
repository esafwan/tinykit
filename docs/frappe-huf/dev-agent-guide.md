# Developer and Agent Guide

This file is the execution guide for humans and coding agents working on the migration.

## What success looks like

A contributor should be able to open this branch and know:

- what system is being built
- which files are the real migration seams
- what to change first
- what to avoid breaking

## First things to read

1. `AGENTS.md`
2. `docs/frappe-huf/implementation-spec.md`

## Rule 1: Preserve product contracts

Do not casually break:

- `/tinykit/studio`
- domain-based serving at `/`
- `/_tk/data/*`
- `/_tk/assets/*`
- `/_tk/realtime/*`
- generated app expectations around `$data`, `$content`, and runtime asset helpers

## Rule 2: Refactor behind interfaces first

Before replacing backend behavior, introduce abstractions.

Required first step:

- add `src/lib/backend/*`

Do not start by editing every panel independently.

## Rule 3: Avoid new PocketBase coupling

If a migration-related change adds another direct import from:

- `pocketbase`
- `src/lib/pocketbase.svelte.ts`
- `src/lib/server/pb.ts`

that is usually the wrong direction.

## File-by-file working guidance

## `src/lib/server/pb.ts`

Current role:

- central PocketBase server service
- project CRUD
- settings lookup
- helper mutations
- domain tracking

Migration instruction:

- turn this into a backend-neutral service boundary or split it into backend interfaces
- move PocketBase-specific logic behind an adapter
- treat every exported helper here as a migration inventory item

## `src/lib/pocketbase.svelte.ts`

Current role:

- browser auth store
- singleton PocketBase client

Migration instruction:

- replace direct UI dependence on this module with a generic auth client
- keep the UI-facing auth shape stable if possible

## `src/lib/services/project.svelte.ts`

Current role:

- browser-side project CRUD against PocketBase

Migration instruction:

- move to a `ProjectRepository` abstraction
- implement a PocketBase adapter first, then a Frappe adapter

## `src/routes/tinykit/lib/api.svelte.ts`

Current role:

- studio-side operations
- mixed direct DB usage and server API usage

Migration instruction:

- make this the first consumer of backend abstractions
- do not leave it as a mixed direct-PB and route-fetch layer forever

## `src/routes/tinykit/studio/project.svelte.ts`

Current role:

- central studio state store
- realtime sync
- project switching
- optimistic updates

Migration instruction:

- update this early
- make realtime implementation swappable
- treat this file as the UX preservation layer during migration

## `src/routes/api/projects/[id]/agent/+server.ts`

Current role:

- custom builder AI orchestration
- writes progress into project chat

Migration instruction:

- replace with HUF-backed execution
- map current project mutation operations to HUF tools
- preserve the user-facing chat/progress behavior

## `src/routes/_tk/data/*`

Current role:

- generated app CRUD runtime

Migration instruction:

- preserve request/response behavior as much as possible
- change only the storage backend
- this is one of the most sensitive compatibility surfaces

## `src/routes/_tk/assets/*`

Current role:

- generated app asset serving

Migration instruction:

- preserve asset URL semantics
- use Frappe file storage behind the same runtime shape

## `src/routes/_tk/realtime/*`

Current role:

- builder/runtime event stream

Migration instruction:

- preserve near-realtime UX
- acceptable short-term fallback is SSE or polling if Frappe realtime is not ready

## `src/hooks.server.ts` and `src/routes/+server.ts`

Current role:

- domain normalization
- domain-to-project resolution
- production app serving

Migration instruction:

- preserve exact high-level behavior
- swap project lookup backend only

## Recommended work sequence

1. Add backend interfaces.
2. Wrap current PocketBase implementation.
3. Refactor studio consumers to depend on abstractions.
4. Define Frappe-compatible API contracts.
5. Implement Frappe-backed project/data/asset/domain services.
6. Swap builder AI route to HUF.
7. Replace realtime source.

## Definition of done for each PR

Each migration PR should clearly state:

- which backend seam it touches
- what contract remains stable
- what remains PocketBase-backed afterward
- what future PR depends on it

## Good PR examples

- "Introduce `ProjectRepository` and migrate `project_service` to use it"
- "Wrap `/_tk/data` storage behind runtime data service"
- "Replace builder agent route with HUF-backed execution facade"

## Bad PR examples

- "Start Frappe migration"
- "Refactor backend stuff"
- "Clean up PocketBase"
