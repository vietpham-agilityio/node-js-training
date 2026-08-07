# 0001. Extract cross-cutting code into libs/common

Status: Accepted
Date: 2026-07-28

## Context

`apps/nest-js-training/src/common/` held the project's cross-cutting primitives — `HttpErrorFilter`, `ResponseLoggingInterceptor`, `AuthGuard`, `LoggingMiddleware`, `VersionManagementMiddleware`. `apps/api-gateway` needed the same filter/interceptor/middleware, so `apps/api-gateway/src/app.module.ts` imported them directly from `apps/nest-js-training/src/common/...` — a cross-app import into another app's `src/`. This only worked by accident under ts-node/jest module resolution and would break under real per-app `nest build`, and `api-gateway` couldn't even build at the time (see [0004](0004-defer-pattern-work-phases.md) for the fuller context of what else was broken).

## Decision

Create a new `libs/common` library (mirroring the existing `libs/constants` shape) and move the five primitives into it verbatim, exposed via a `@app/common` path alias (added to `tsconfig.json` paths, root `package.json` jest `moduleNameMapper`, and registered as a library project in `nest-cli.json`, matching how `@app/constants` was already wired). `apps/nest-js-training` and `apps/api-gateway` both now import from `@app/common` instead of a cross-app relative path.

## Consequences

Adding anything new to `libs/common` requires no extra plumbing (alias already exists) — but adding a *new* shared lib in the future needs the same three-place registration (tsconfig paths + jest moduleNameMapper + nest-cli.json), documented in `CLAUDE.md`. `apps/nest-js-training/src/common/` no longer exists; any future work on those five primitives happens in `libs/common/src`. The hard rule this establishes — apps never import another app's `src/` — is now enforced by having nowhere else for shared code to live.
