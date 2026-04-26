# Research Assessment

This document is the research snapshot that led to the implementation spec.

## Bottom line

Yes, the fork is doable.

The right framing is:

- not "swap PocketBase for HUF"
- but "move TinyKit onto Frappe, then use HUF to power the backend capabilities TinyKit is missing"

## Why this makes sense

TinyKit currently marks these as coming soon:

- backend functionality
- authentication
- showcase
- richer LLM functionality

HUF + Frappe already cover much of that surface:

- background jobs
- scheduler / cron
- server-side API methods
- webhooks and triggers
- auth and permissions foundations
- multi-provider LLM integration
- tools, flows, MCP, knowledge, auditability

## HUF capability summary

Based on HUF's `AGENTS.md`, README, and skills docs:

- Agent system with persistent conversations and run logs
- Tool system with CRUD, HTTP, custom function, and MCP support
- Trigger system with schedules, doc events, and webhooks
- Knowledge system with retrieval/indexing
- Flow engine for orchestration
- LiteLLM-based provider abstraction
- Security and permission patterns
- Observability for runs, tools, costs, and messages

## TinyKit architecture summary

TinyKit is currently:

- a SvelteKit app
- deeply tied to PocketBase
- project-document oriented
- runtime-contract driven

Important runtime/backend touchpoints:

- direct PocketBase browser auth and CRUD
- server-side PocketBase superuser CRUD
- `/_tk/data` runtime APIs
- `/_tk/assets` runtime APIs
- `/_tk/realtime` event stream
- `/api/projects/*` builder APIs
- domain-based published app serving

## Most important finding

TinyKit's core user contract is not PocketBase itself.

TinyKit's real product contract is:

- builder UX
- generated app conventions
- data/content/design helpers
- domain-based app serving
- live preview and near-realtime updates

If that contract is preserved, the backend can change.

## Main migration risk

The hardest parts are:

- realtime parity
- client-side direct PocketBase usage
- file storage behavior
- auth model differences

Not:

- AI backend capability
- scheduling
- tooling
- orchestration

Those are the areas where HUF and Frappe are already strong.
