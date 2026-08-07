# 0004. Defer messaging/CQRS/facade/SOLID pattern work to follow-up sessions

Status: Accepted
Date: 2026-07-28

## Context

The ask was broad: implement messaging/transport-layer patterns, cross-cutting conventions applied uniformly across all apps, CQRS/event-driven architecture, DI, decorators, a facade layer, and a SOLID pass — all in one project. Investigation found the monorepo's foundation was broken first: `apps/api-gateway` had no `main.ts` and wasn't registered in `nest-cli.json` (unbuildable), its `ProxyController` had two real bugs (wrong DI type, malformed URL literal), `apps/nest-js-training` and `apps/order` both hardcoded `app.listen(3001)` (port collision), and there were four separate cross-app `src/` import violations (see [0001](0001-extract-libs-common.md), [0002](0002-shared-order-type-in-libs-constants.md), [0003](0003-isolate-consul-to-api-gateway.md)). Building CQRS/messaging patterns on top of a foundation like that would mean redoing the pattern work once the plumbing got fixed anyway.

## Decision

Scope the first pass to foundation + docs only: fix the broken/tangled plumbing, add a root `CLAUDE.md`, and add the `nest-microservice-module` scaffolding skill. The pattern implementations — messaging/transport formalization, cross-cutting conventions applied uniformly (plus an RPC exception filter for the TCP side), CQRS (`@nestjs/cqrs`), a facade layer in front of the CQRS bus, and a SOLID pass (repository DI token, SRP split of `InventoryService.handleOrderCreated`) — are explicitly deferred, tracked under "What's next" in `CLAUDE.md`.

## Consequences

The project doesn't yet have CQRS, a facade layer, or a formalized messaging layer — that's intentional, not an oversight, and `CLAUDE.md` says so explicitly so a future session (or a future ADR) doesn't need to rediscover why. Each deferred phase should be scoped and planned as its own request rather than attempted together, the same way this ADR's own scope was narrowed from the original all-in-one ask.
