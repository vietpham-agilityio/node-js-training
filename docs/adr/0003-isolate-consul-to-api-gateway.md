# 0003. Isolate Consul registration to api-gateway

Status: Superseded by 0011
Date: 2026-07-28

## Context

`apps/inventory/src/inventory.module.ts` imported `ConsulService` from `apps/api-gateway/src/consul.service.ts` — a cross-app import that breaks independent per-app builds (same class of bug as [0001](0001-extract-libs-common.md)). `ConsulService` itself registered `'inventory-service'` in Consul, even though the file physically lived under `apps/api-gateway/src`. `InventoryService` also injected `ConsulService` for a `processOrder()` method that discovered `'order-service'` via Consul — dead code, never called from anywhere. Two real options existed: extract `ConsulService` into a new shared `libs/discovery` so both apps could use it cleanly, or drop the cross-app dependency and keep Consul scoped to the app that already owned the file.

## Decision

Remove Consul from `inventory` entirely — no `ConsulService` import, no injection, no dead `processOrder()` method. Rewire `ConsulService` as a normal provider in `apps/api-gateway`'s own `app.module.ts`, and change its hardcoded `serviceId`/`serviceName`/`servicePort` from `'inventory-service'` / `8002` to `'api-gateway'` / `3002` so it registers the app that actually owns it.

## Consequences

`inventory` is no longer discoverable via Consul — if that's needed later, it should go through a proper `libs/discovery` lib shared by both apps, not a repeat of the cross-app import. `api-gateway`'s Consul health check still points at `/health`, but `api-gateway` has `TerminusModule` imported without an actual `/health` route wired up, so the check target won't resolve yet — logged as a known limitation in `CLAUDE.md` rather than fixed here, since building a new health endpoint was out of scope for this pass.
