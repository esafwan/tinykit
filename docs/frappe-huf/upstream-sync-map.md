# Upstream Sync Map

This document is the practical map for porting future upstream TinyKit changes from `main` into the Frappe + HUF fork.

## Purpose

When upstream changes a PocketBase-backed file, agents should not copy the old behavior blindly into this fork.

Instead:

1. find the upstream file that changed
2. locate the mapped abstraction or compatibility facade in this fork
3. decide whether the change belongs in:
   - the backend adapter
   - the higher-level UI/service caller
   - both

## Core mapping table

| Upstream PocketBase seam | Phase 1 abstraction in this fork | Notes |
|---|---|---|
| `src/lib/pocketbase.svelte.ts` | `src/lib/backend/pocketbase.ts`, `src/lib/backend/auth.svelte.ts` | Keep `src/lib/pocketbase.svelte.ts` as compatibility export surface. |
| `src/lib/services/project.svelte.ts` | `src/lib/backend/projects.ts` | `project_service` should stay a facade; backend logic belongs in `project_repository`. |
| `src/lib/services/kit.svelte.ts` | `src/lib/backend/kits.ts` | Keep kit CRUD behind `kit_repository`. |
| `src/lib/server/pb.ts` | `src/lib/backend/server.ts` | Current server wrapper is a bridge only; later Frappe logic should replace the PocketBase implementation behind it. |
| `src/routes/tinykit/lib/api.svelte.ts` | uses `project_repository`, `project_assets`, `auth_client` | If upstream adds raw project CRUD here, port it through adapters instead. |
| `src/routes/tinykit/lib/storage.ts` | uses `auth_client` | Token/header helpers should not read `pb.authStore` directly. |
| `src/routes/tinykit/studio/project.svelte.ts` | uses `project_realtime`, `project_repository` | Realtime and update behavior should stay adapter-backed. |
| `src/routes/tinykit/studio/+page.svelte` | uses `project_repository.get_by_domain()` | Domain lookup should stay repository-backed. |
| `src/routes/tinykit/studio/panels/data/DataPanel.svelte` | uses `project_realtime` | Do not reintroduce direct collection subscriptions here. |
| `src/routes/tinykit/studio/components/FileField.svelte` | uses `project_assets` | Asset upload logic should stay in the asset client. |

## New adapter files introduced in Phase 1

- `src/lib/backend/types.ts`
- `src/lib/backend/pocketbase.ts`
- `src/lib/backend/auth.svelte.ts`
- `src/lib/backend/projects.ts`
- `src/lib/backend/kits.ts`
- `src/lib/backend/server.ts`
- `src/lib/backend/index.ts`

## Porting rules for agents

### If upstream changes auth behavior

Compare:

- upstream `src/lib/pocketbase.svelte.ts`
- fork `src/lib/backend/auth.svelte.ts`
- fork `src/lib/pocketbase.svelte.ts`

Usually:

- implementation change belongs in `src/lib/backend/auth.svelte.ts`
- compatibility exports in `src/lib/pocketbase.svelte.ts` should remain thin

### If upstream changes project CRUD behavior

Compare:

- upstream `src/lib/services/project.svelte.ts`
- fork `src/lib/backend/projects.ts`
- fork `src/lib/services/project.svelte.ts`

Usually:

- logic change belongs in `src/lib/backend/projects.ts`
- `project_service` should keep delegating

### If upstream changes kit behavior

Compare:

- upstream `src/lib/services/kit.svelte.ts`
- fork `src/lib/backend/kits.ts`
- fork `src/lib/services/kit.svelte.ts`

Usually:

- data access change belongs in `src/lib/backend/kits.ts`
- `kit_service` should remain a thin facade

### If upstream changes studio-side project loading or realtime logic

Compare:

- upstream `src/routes/tinykit/studio/project.svelte.ts`
- fork `src/routes/tinykit/studio/project.svelte.ts`
- fork `src/lib/backend/projects.ts`

Usually:

- UI/state logic stays in the store
- realtime transport logic belongs in `project_realtime`

### If upstream changes asset upload behavior

Compare:

- upstream `src/routes/tinykit/lib/api.svelte.ts`
- upstream `src/routes/tinykit/studio/components/FileField.svelte`
- fork `src/lib/backend/projects.ts`
- fork callers

Usually:

- upload transport belongs in `project_assets`
- URL generation can stay in caller utilities

## What should not come back

During upstream sync, avoid reintroducing:

- fresh direct `pb.collection('_tk_projects')` calls in studio code
- new direct auth token reads from `pb.authStore` when `auth_client` is sufficient
- asset upload logic duplicated across multiple components

## If an upstream change does not fit the current abstraction

That is a signal to evolve the abstraction, not bypass it.

Preferred order:

1. update `src/lib/backend/types.ts`
2. update the PocketBase adapter in `src/lib/backend/*`
3. keep compatibility facades thin
4. update consumers last
