# 0006. Unify on TypeORM+SQLite persistence; split user/product out of nest-js-training into standalone apps

Status: Accepted
Date: 2026-07-29

## Context

The monorepo had three different persistence strategies at once: `nest-js-training` used TypeORM + `better-sqlite3` for its `user`/`product` modules, while `order` and `inventory` kept plain in-memory arrays (an explicitly documented, intentional limitation). `nest-js-training` itself existed as a "reference" app demonstrating Swagger, URI versioning, and the `libs/common` cross-cutting pieces (`AuthGuard`, `ResponseLoggingInterceptor`, `HttpErrorFilter`, `LoggingMiddleware`) bundled with the unrelated `user`/`product` business modules — bundling a teaching app with real domain modules made it unclear whether `user`/`product` were meant to be a permanent part of the system or a demo fixture.

## Decision

Give `order` and `inventory` real persistence: both now use `@nestjs/typeorm` + `better-sqlite3`, each with its own SQLite file (`order-db.sqlite`, `inventory-db.sqlite`) and `synchronize: true`, following the exact pattern `nest-js-training`'s `user`/`product` modules already used. `inventory`'s previously-hardcoded 4-item stock array is now seeded into its table on `OnModuleInit` if empty, preserving prior behavior for anyone testing the order→inventory flow manually.

Split `user` and `product` out of `nest-js-training` into their own standalone apps (`apps/user`, port 3003; `apps/product`, port 3004), mirroring the `order`/`inventory` pattern of one app per bounded concern. Both keep `nest-js-training`'s full original feature set as a faithful relocation, not a simplification: Swagger docs, URI versioning (`v1`/`v2` via `VersionManagementMiddleware`), `AuthGuard` on mutating routes, and the `ResponseLoggingInterceptor`/`HttpErrorFilter` pair wired the same way `api-gateway` wires them. Each app gets its own SQLite file (`user-db.sqlite`, `product-db.sqlite`).

`nest-js-training` is deleted outright now that both of its real modules live elsewhere and its cross-cutting demos are exercised for real in `user`/`product`/`api-gateway`. `nest-cli.json`'s default (unnamed) project now points at `api-gateway`, since `nest-js-training` is gone and `api-gateway` is the system's sole client-facing HTTP entry point (see [0005](0005-api-gateway-sole-entry-point.md)) — though that ADR's "sole entry point" claim was always scoped to order's operations specifically, not the whole system, so `user`/`product` being directly reachable on their own ports doesn't contradict it.

`order`'s previously-unwired `test/app.e2e-spec.ts` (a boilerplate `GET /` stub asserting a route that never existed) was rewritten to cover the real CRUD routes and wired into the root `test:e2e` script in place of `nest-js-training`'s. `user` and `product` got equivalent real e2e coverage of their own (ported from `nest-js-training`'s existing users-flow e2e test plus a new products-flow one), though neither is wired into the root script — consistent with the project's existing stance that only one app's e2e suite runs by default.

`dotenv` was added as a dependency (previously nothing loaded `.env` into `process.env` anywhere, despite a `.env` file existing) and wired into Jest via `setupFiles: ["dotenv/config"]` plus `api-gateway`'s `main.ts`, since `api-gateway` is the only app currently reading an env var (`ORDER_SERVICE_BASE_URL`). `@nestjs/config` was deliberately not introduced — this repo's stated stance is no `@nestjs/config`, and plain `dotenv` is the smaller addition that unblocks the one env var currently in use.

## Consequences

Four independent SQLite files now exist instead of one; nothing shares a database, consistent with each app owning its own storage. `user`/`product`/`order`/`inventory` each hardcode their own SQLite filename and port literal, consistent with this repo's existing no-`@nestjs/config`, hardcoded-literals stance for ports elsewhere (e.g. `ClientsModule.register`).

`user` and `product`'s Swagger/versioning bootstrap code in `main.ts` is now duplicated three ways (`api-gateway`, `user`, `product`), each hand-rolling the same `VersionManagementMiddleware` wiring and `DocumentBuilder` setup — no shared bootstrap helper exists yet. Extracting that into `libs/common` is a reasonable follow-up, tracked under "What's next" in `CLAUDE.md`.

`user` and `product` are not proxied through `api-gateway` — they're directly reachable on their own ports, unlike `order`. Whether they should be folded into the gateway's proxy pattern (extending `docs/adr/0005`'s scope beyond order) is deferred, not decided here.
