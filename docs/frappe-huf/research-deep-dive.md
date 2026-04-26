# TinyKit + Frappe + HUF Assessment

## Bottom line

Yes, this is doable.

The strongest version of the idea is not "drop HUF into TinyKit with tiny changes". It is:

1. Fork TinyKit.
2. Keep the SvelteKit builder, compiler, preview, and generated-app UX.
3. Replace PocketBase-centric backend concerns with a Frappe app that uses HUF where HUF already provides leverage.
4. Introduce a small compatibility layer so TinyKit can migrate incrementally instead of all at once.

HUF + Frappe already covers much of TinyKit's "coming soon" backend surface:

- Background jobs and scheduling
- Auth foundations, users, sessions, OAuth support in the Frappe ecosystem
- Server-side endpoints / whitelisted methods / webhooks
- LLM tooling, orchestration, knowledge, flows, MCP integrations
- Auditability, cost tracking, permissions

The main challenge is not feature parity. The main challenge is that TinyKit is deeply coupled to PocketBase's data model, auth model, file model, and realtime subscription model.

## What HUF gives you already

From HUF's `AGENTS.md`, README, and skill docs:

- Multi-provider LLM backend via LiteLLM
- Tool system for CRUD, HTTP, custom functions, MCP
- Persistent conversations, runs, tool-call audit logs
- Trigger system for schedules, doc events, app events, webhooks
- Knowledge system with retrieval and indexing
- Flow engine for orchestrated multi-step workflows
- Security model around permissions, tool access, SSRF checks
- Observability around runs, messages, token/cost tracking

For TinyKit's roadmap, that maps well to:

- `Backend Functionality (soon)` -> Frappe jobs, scheduler, whitelisted methods, webhooks, HUF triggers/flows
- `Authentication (soon)` -> Frappe users, sessions, OAuth providers, role model
- `LLM Functionality (soon)` -> HUF agent system, tools, flows, knowledge, MCP
- `Showcase (soon)` -> feasible with Frappe DocTypes + install/export flows, but not "already done" in HUF specifically

## TinyKit architecture today

## 1. Core stack

TinyKit is currently a SvelteKit app running on Node, with PocketBase as the embedded/default backend.

Key traits:

- SvelteKit app in `src/`
- PocketBase binary downloaded and run locally
- Client uses PocketBase SDK directly
- Server also uses PocketBase SDK with superuser auth
- Generated app code is stored as project data, then compiled/published

Important files:

- `src/lib/pocketbase.svelte.ts`
- `src/lib/server/pb.ts`
- `src/routes/+server.ts`
- `src/routes/_tk/*`
- `src/routes/api/projects/[id]/agent/+server.ts`
- `src/routes/tinykit/studio/*`
- `src/lib/compiler/*`

## 2. Domain-based app serving

TinyKit is multi-tenant by domain.

Pattern:

- incoming host is normalized in `src/hooks.server.ts`
- root `src/routes/+server.ts` finds a project by domain
- if found, it serves `published_html`
- if not found, it redirects to `/tinykit/new?domain=...`

This means backend replacement must preserve:

- domain -> project lookup
- published build artifact serving
- asset serving per project

## 3. Project-centric storage model

TinyKit's primary persistence unit is one `_tk_projects` record.

That project record stores:

- app metadata
- frontend code
- backend placeholder code
- design tokens
- content fields
- snapshots
- chat history
- arbitrary data collections
- settings
- assets

This is the biggest architectural clue in the repo: TinyKit behaves like a document-oriented app-builder, not a normalized SaaS backend.

Important type shape from `src/routes/tinykit/types.ts`:

- `frontend_code`
- `backend_code`
- `design`
- `content`
- `snapshots`
- `agent_chat`
- `data`
- `settings`
- `assets`

## 4. Backend connection patterns

TinyKit talks to backend in four distinct ways.

### A. Direct client-side DB access

The browser uses PocketBase SDK directly:

- auth in `src/lib/pocketbase.svelte.ts`
- CRUD in `src/lib/services/project.svelte.ts`
- realtime subscriptions from builder panels and project store

This is a major coupling point.

### B. Server-side superuser access

Server routes use a singleton PocketBase superuser client in `src/lib/server/pb.ts`.

That file handles:

- reading setup credentials
- authenticating as PocketBase superuser
- CRUD on `_tk_projects`
- LLM settings lookup
- helper operations like snapshots, data collection updates, domain tracking

This is effectively TinyKit's current backend service layer.

### C. Custom app runtime endpoints under `/_tk`

TinyKit exposes generated-app runtime APIs under:

- `/_tk/data/...`
- `/_tk/assets/...`
- `/_tk/realtime/...`

These are important because generated apps depend on them.

Today they provide:

- CRUD over project-owned JSON collections
- asset/file serving and uploads
- SSE/realtime updates backed by PocketBase subscriptions

### D. Server API routes under `/api`

Used for:

- setup
- settings
- templates
- domains
- project creation
- AI agent prompting
- build/export

These routes are where a Frappe adapter can be introduced with the least disruption.

## 5. TinyKit's "backend" status today

TinyKit's current backend story is partly real, partly planned.

What is real today:

- persistence
- auth for TinyKit admin via PocketBase users
- project CRUD
- assets
- lightweight runtime data API
- AI builder chat route
- build/export
- domain-aware serving

What is still mostly aspirational:

- `backend_code` execution runtime
- server route authoring by end users
- background jobs as first-class productized runtime
- cron jobs as first-class runtime
- app-level auth inside generated apps

Evidence:

- `CodePanel.svelte` shows backend code as "Coming Soon in v0.2"
- config endpoint placeholders still return empty env/endpoints
- `backend_code` is stored but not actually executed as a runtime

So your instinct is right: HUF + Frappe can fill a real product gap here.

## TinyKit coding and architectural patterns

## 1. Generated app conventions

TinyKit strongly constrains generated app code:

- single Svelte file
- Svelte 5 runes
- semantic CSS, not Tailwind in generated app code
- data through `$data`
- content through `$content`
- design through CSS variables
- external fetching through `$tinykit` helpers

This is encoded directly in `src/lib/ai/sdk-agent.ts` system prompt.

Implication:

The generated app contract matters more than the underlying database. If we preserve `$data`, asset URLs, and runtime helpers, the backend can change.

## 2. Realtime-first editor UX

The studio assumes near-live state sync:

- project store subscribes to realtime updates
- agent output streams into stored chat messages
- data panel reacts to collection changes
- code sync tries to avoid clobbering local edits

Implication:

A Frappe backend should provide either:

- true realtime via Frappe realtime/socketio, or
- a close-enough SSE / polling compatibility layer

## 3. Soft-document model

TinyKit stores many things as JSON blobs rather than first-class relational entities.

Examples:

- `content`
- `design`
- `snapshots`
- `data`
- `settings`
- `agent_chat`

Implication:

Do not over-normalize on day one. A Frappe port should start with a `TinyKit Project` DocType that keeps this denormalized shape where practical.

## 4. Mixed client/server data access

TinyKit does not have a clean backend abstraction yet.

Some features:

- use direct client SDK access
- some use custom REST endpoints
- some use server-only helpers

Implication:

Before large backend replacement, add an explicit backend service boundary in the fork.

## Main mismatches between TinyKit and HUF/Frappe

## 1. PocketBase is not just the database

PocketBase currently provides all of this at once:

- user auth
- token lifecycle
- direct browser SDK
- file attachments
- collection CRUD
- realtime subscriptions
- lightweight admin-ish data model

Frappe + HUF can replace all of it, but not via a one-file swap.

## 2. HUF is an AI/automation engine, not TinyKit's data runtime

HUF already solves:

- agents
- tools
- triggers
- flows
- knowledge
- LLM orchestration

HUF does not directly replace:

- TinyKit's project record model
- TinyKit's runtime `/_tk/data` contract
- TinyKit's project asset URL conventions
- TinyKit's builder-facing direct DB SDK usage

So the backend should be "Frappe app + HUF integration", not "HUF alone".

## 3. TinyKit's generated app runtime is custom

Generated apps expect:

- `/_tk/data/...`
- `/_tk/assets/...`
- `/_tk/realtime/...`
- `$data`, `$content`, `$tinykit`

That runtime contract should remain stable during migration.

## 4. Auth expectations differ

TinyKit currently treats auth mostly like:

- PocketBase users for TinyKit admin
- token passed to routes
- some direct SDK auth refresh

Frappe prefers:

- session auth
- role/permission model
- OAuth/social login options
- API keys/tokens for integrations

This is a solvable mismatch, but it needs an intentional auth adapter.

## Recommended target architecture

## Principle

Keep TinyKit's frontend and generated app contract stable.
Move backend responsibility into a new Frappe app.
Use HUF as the intelligence/orchestration layer inside that Frappe app.

## Proposed backend split

### Frappe app responsibilities

- `TinyKit Project` DocType
- `TinyKit Setting` DocType
- `TinyKit Template` / showcase DocTypes later
- project assets via Frappe `File`
- project CRUD APIs
- domain resolution
- generated app data APIs
- build artifact storage
- app auth/session model
- project/user permissions

### HUF responsibilities

- builder AI assistant backend
- tool execution
- knowledge/RAG
- workflow orchestration
- MCP integrations
- scheduling/triggers
- background execution for AI-heavy tasks
- usage/cost observability

### SvelteKit responsibilities

- TinyKit studio UI
- generated app compiler
- preview/build pipeline
- runtime helper libraries
- frontend-side design/content/data editing experience

## Recommended migration shape

## Phase 1: Compatibility-first backend

Build a Frappe backend that mimics TinyKit's current contracts closely.

Create equivalents for:

- `_tk_projects` -> `TinyKit Project`
- `_tk_settings` -> `TinyKit Setting`
- `/api/projects` -> Frappe-backed endpoints or proxied SvelteKit server routes
- `/_tk/data/...` -> Frappe-backed CRUD endpoints
- `/_tk/assets/...` -> Frappe file-serving endpoints
- `/_tk/realtime/...` -> SSE/socket bridge

Store project payloads mostly denormalized at first.

Why:

- fastest path to working fork
- least builder UI churn
- easiest way to prove feasibility

## Phase 2: Replace builder AI with HUF-backed execution

Swap TinyKit's current AI route (`/api/projects/[id]/agent`) so it creates or uses HUF entities:

- one HUF Agent template for builder behavior
- HUF tools that mutate `TinyKit Project`
- HUF run logging instead of ad hoc message-only tracking

This gives:

- better tool governance
- cost tracking
- reusable workflows
- future multi-agent or flow-based builder ops

## Phase 3: Turn "backend_code" into real backend features

Instead of executing arbitrary JS on the Node server first, map TinyKit's backend concept to Frappe/HUF primitives:

- server endpoints -> Frappe whitelisted methods / generated route handlers
- background jobs -> Frappe enqueue jobs / HUF triggerable jobs
- cron -> Frappe scheduler + HUF triggers
- auth-protected app actions -> Frappe permissioned APIs

This is where TinyKit becomes stronger than current upstream.

## Phase 4: Productize auth and showcase

Use Frappe capabilities for:

- project members / roles
- end-user login for generated apps
- OAuth
- community app/template registry
- one-click install from exported project bundles

## Concrete implementation plan

## Step 0: Fork hygiene

1. Fork TinyKit.
2. Add a backend abstraction document in the repo.
3. Identify every direct PocketBase touchpoint and group them by concern:
   - auth
   - projects
   - assets
   - data runtime
   - realtime
   - settings

## Step 1: Introduce an internal backend adapter in TinyKit

Before swapping infrastructure, refactor TinyKit so frontend code stops depending on PocketBase details directly.

Introduce interfaces like:

- `AuthClient`
- `ProjectRepository`
- `RuntimeDataClient`
- `AssetClient`
- `RealtimeClient`

Then provide:

- `PocketBaseAdapter` first
- `FrappeAdapter` second

This is the single highest-leverage refactor.

## Step 2: Build a new Frappe app for TinyKit backend

Suggested initial DocTypes:

- `TinyKit Project`
- `TinyKit Setting`
- `TinyKit Domain`
- `TinyKit Build`
- `TinyKit Template` later

Suggested initial fields for `TinyKit Project`:

- `project_name`
- `domain`
- `frontend_code`
- `backend_code`
- `published_html`
- `design_json`
- `content_json`
- `snapshots_json`
- `agent_chat_json`
- `data_json`
- `settings_json`
- `custom_instructions`

Early on, JSON fields are fine.

## Step 3: Recreate TinyKit runtime endpoints on Frappe

Priority order:

1. project CRUD
2. domain lookup
3. file upload / asset serving
4. `/_tk/data` CRUD
5. realtime or SSE updates

Keep response shapes close to current TinyKit expectations.

## Step 4: Replace TinyKit builder chat with HUF

Build HUF tools for TinyKit project mutation:

- update frontend code
- add content field
- add design field
- create data collection
- insert data records
- create snapshot
- publish build

Then wire TinyKit builder prompt route to HUF.

This is better than keeping TinyKit's bespoke agent loop because HUF already has:

- tool system
- permissions
- provider abstraction
- knowledge
- triggers
- observability

## Step 5: Decide how to handle generated-app auth

There are two reasonable paths.

### Option A: Frappe-native auth for generated apps

Pros:

- strongest long-term architecture
- OAuth/session support
- permissions and user management already exist

Cons:

- larger frontend/runtime rewrite

### Option B: keep generated apps initially mostly public, add auth later

Pros:

- faster MVP migration

Cons:

- doesn't unlock one of the key roadmap wins immediately

Recommendation:

Start with B for the first working fork, then add A.

## Step 6: Implement real backend functionality as Frappe/HUF primitives

For TinyKit's "coming soon" backend panel, do not try to literally run arbitrary user JS first.

Instead map it to structured backend capabilities:

- route definition -> generated Frappe API method
- background job -> generated Frappe background task
- cron -> generated HUF/Frappe trigger
- secret usage -> Frappe secure settings / encrypted values

Later, if needed, add a constrained code-execution model.

## Risks and tradeoffs

## High-confidence benefits

- stronger backend roadmap than upstream TinyKit
- much better AI backend than TinyKit's custom route
- auth story becomes more real
- scheduling/background/server automation become real quickly
- observability and governance become first-class

## Main risks

### 1. Realtime parity

PocketBase realtime is easy and central to TinyKit's UX.

Mitigation:

- first use SSE/polling where acceptable
- add Frappe realtime/socket bridge for agent/chat/editor sync

### 2. Too much normalization too early

If you remodel every JSON blob into many DocTypes immediately, velocity will drop.

Mitigation:

- keep denormalized project payloads first

### 3. Tight frontend coupling to PocketBase SDK

This is the main engineering debt in TinyKit for your goal.

Mitigation:

- adapter refactor before backend swap

### 4. HUF scope confusion

If HUF is asked to replace all persistence/runtime concerns directly, the project will feel awkward.

Mitigation:

- use Frappe app for app-platform storage/runtime
- use HUF for intelligence/orchestration

## My recommendation

I agree with the direction.

The best fork is:

- TinyKit frontend + compiler + studio UX
- Frappe app as application backend
- HUF as the AI/backend automation layer

I would not position it internally as "swap PocketBase for HUF".
I would position it as:

"Replatform TinyKit onto Frappe, then use HUF to power the backend features TinyKit is missing."

That framing is more accurate and will produce better design decisions.

## Suggested first milestone

Aim for this first:

1. TinyKit fork boots with no PocketBase dependency.
2. Project CRUD comes from Frappe.
3. `/_tk/data` and `/_tk/assets` work from Frappe.
4. Builder chat uses HUF for project mutations.
5. Publish-by-domain still works.

If that milestone works, the rest is clearly incremental.

## Source references

- HUF `AGENTS.md`: https://github.com/tridz-dev/huf/blob/develop/AGENTS.md
- HUF branch reviewed: https://github.com/tridz-dev/huf/tree/doc/add_comprehensive_skills_coverage
- TinyKit repo reviewed: https://github.com/esafwan/tinykit
- TinyKit README: https://github.com/esafwan/tinykit/blob/main/README.md
