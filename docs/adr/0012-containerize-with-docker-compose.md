# 0012. Containerize with a single parameterized Dockerfile + Docker Compose

Status: Accepted
Date: 2026-08-03

## Context

ADR 0011 set the direction (Kubernetes-native service discovery, no Consul) but nothing was actually containerized yet. Two real alternatives existed for the Dockerfile shape: one `Dockerfile` per app (6 near-identical files, each hardcoding its own `nest build <project>`), or a single root `Dockerfile` parameterized by `--build-arg APP=<project>` shared by all six. The six apps already share one `pnpm-lock.yaml`/`node_modules` and one webpack-bundling build step per Nest CLI project, so per-app Dockerfiles would just be six copies of the same stages with one line different.

Two blocking correctness issues surfaced only once actual cross-container networking was attempted (not visible from reading the code in isolation):

1. Every TCP server (`order`, `inventory`, `auth`, `user`) bound `host: 'localhost'` in its `main.ts`. That's fine when every app is a separate process on one machine (today's local dev), but inside its own container `localhost` is only that container's loopback — no other container can ever reach it, Docker or Kubernetes alike.
2. Every TCP *client* (`ClientsModule.register(...)` in `order`, `inventory`, `auth`, `api-gateway`) hardcoded its target host as a literal or omitted it (defaulting to `localhost`). In Compose/K8s, the other service lives in a different container reachable only by its service name via DNS, never `localhost`.

A third issue surfaced only at build time: `corepack enable` alone pulls whatever pnpm version corepack considers current (resolved to 11.18.0 in this session), not the 10.3.0 this repo was developed against. pnpm 11's `pnpm install --prod` silently ignored `package.json`'s `pnpm.onlyBuiltDependencies: ["better-sqlite3", "bcrypt"]` allowlist and refused to run their native build scripts, breaking the image (`ERR_PNPM_IGNORED_BUILDS`).

A fourth issue: the repo's real (gitignored) `.env` has `NODE_ENV=test` set, since `dotenv/config` in Jest's `setupFiles` loads it and the app code branches `process.env.NODE_ENV === 'test' ? ':memory:' : './database/*.sqlite'` for local test runs. Naively pointing Compose's `env_file` at that same `.env` would have carried `NODE_ENV=test` straight into every container, silently switching every service to an in-memory (non-persistent) database.

## Decision

- One root `Dockerfile`, multi-stage (`toolchain` → `deps`/`prod-deps` → `build` → `runtime`), selected per image via `--build-arg APP=<project>`. `docker-compose.yml` passes this per service. Libraries (`constants`, `common`) are never a valid `APP` value — webpack inlines their source into whichever app bundles them, confirmed by inspecting a built bundle's `require(...)` calls (only external `node_modules` packages, no `libs/*` references).
- Pinned `corepack prepare pnpm@10.3.0 --activate` in the base stage instead of bare `corepack enable`, matching the version this repo is developed against, rather than chasing down why a newer pnpm changed `onlyBuiltDependencies` handling.
- Changed all four TCP server binds from `'localhost'` to `'0.0.0.0'` (`apps/{order,inventory,auth,user}/src/main.ts`). No downside for local dev — binding all interfaces still accepts `localhost` connections.
- Made the 5 TCP client target hosts env-var-driven with a `'localhost'` fallback (`process.env.INVENTORY_SERVICE_HOST ?? 'localhost'`, and the equivalent `ORDER_SERVICE_HOST`/`AUTH_SERVICE_HOST`/`USER_SERVICE_HOST`), rather than reaching for `@nestjs/config` — this follows the exact pattern `api-gateway`'s HTTP proxy base URLs already used (plain `process.env` + `dotenv`), just extended to the TCP client configs that didn't have it yet. Local multi-process dev is unaffected (all four still default to `localhost`); Compose overrides them to each other's service name.
- In `docker-compose.yml`, every service that has `env_file: .env` also sets `environment: { NODE_ENV: production, ... }` explicitly — `environment:` wins over `env_file` in Compose's merge order, so this can't be silently re-broken by whatever `NODE_ENV` happens to be sitting in the developer's local `.env`.
- Per-app SQLite files get a named Docker volume each (`order-db`, `inventory-db`, `user-db`, `product-db`) mounted at `/app/database`, so data survives `docker compose down` (but not `down -v`).
- Verified live: built all six images, ran `docker compose up`, and drove a full HTTP flow through the containerized `api-gateway` — register → login, RBAC 401/403s (`docs/adr/0010`), and a `POST /orders` that round-tripped `order` → `inventory` → `order` entirely over cross-container TCP, ending with the order's status flipping to `Completed`. That last part revealed `CLAUDE.md`'s "known bug: order status never updates" note was already stale — the round trip works today.

## Consequences

- Anyone adding a 7th app to this monorepo gets a Dockerfile for free (`--build-arg APP=<name>`) as long as it follows the same `nest-cli.json` project shape — no new Dockerfile to write.
- `.env` must exist at repo root (copied from `.env.example`) before `docker compose up`, since several services declare `env_file: .env` for the JWT keypair. It does not need the new `*_SERVICE_HOST` vars — Compose's `environment:` block supplies those directly.
- Kubernetes is still a separate step: these Dockerfiles/images are reusable there, but the `*_SERVICE_HOST` env vars will need to become K8s Service DNS names instead of Compose service names, and each app's own SQLite-on-a-volume story doesn't survive horizontal scaling (a replica set would each get its own empty/divergent database) — tracked, not solved, by this ADR.
- If pnpm's own default version drifts again, the pin in the `Dockerfile` (not this ADR) is the place to bump it — deliberately decoupled from whatever `corepack enable` alone would resolve to.
