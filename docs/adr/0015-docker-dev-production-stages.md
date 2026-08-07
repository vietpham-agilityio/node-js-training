# 0015. Dockerfile dev/production stages via `--target` + a Compose override file

Status: Accepted
Date: 2026-08-04

## Context

ADR 0012 gave the project a single `Dockerfile` that builds one thing: the production image (`NODE_ENV=production`, prod-only `node_modules`, prebuilt `dist/`, non-root). There was no way to build a lighter image for local container-based iteration — `docker compose up` always produced and ran the production image, so testing the cross-container TCP flows (order↔inventory, auth→user) while actively editing code meant rebuilding the full production image on every change.

A `dev` build target was worth adding as a real, distinct stage (own devDependencies, watch mode) rather than skipping Docker for local iteration (`pnpm start:<app>`), since the ask was specifically for a `docker build`-selectable dev target that still exercises the real containerized/cross-container setup from ADR 0012.

(A `staging` target — an alias of `production`, differentiated only via a Compose overlay + separate `.env.staging` — was designed and validated during this same change, but dropped before landing to keep the setup to what's actually needed: dev for iteration, production for everything else. If a staging environment is needed later, byte-identical-to-production reuse is the right shape for it — `staging`'s `NODE_ENV` must equal `production`'s, since `libs/common`'s `AppLoggerModule` only enables `pino-pretty` pretty-printing outside `NODE_ENV=production`, and `pino-pretty` is a devDependency absent from the production `node_modules` — but that's for whenever it's actually needed.)

Two more issues surfaced only by actually running the `dev` container end-to-end (not visible from reading `@nestjs/cli`'s docs or this project's code in isolation):

1. `@nestjs/cli`'s `--watch` mode kills and respawns the running app on every rebuild by shelling out to the `ps` binary to walk the process tree (`node_modules/@nestjs/cli/lib/utils/tree-kill.js`, non-Windows branch — Windows instead uses `taskkill /T /F`, which is why this never surfaced testing `pnpm start:<app> --watch` locally on this Windows dev machine). `node:22-slim` doesn't ship `procps` (no `ps`), so that lookup silently returns nothing; only the outer shell gets killed, the actual `node` process — still bound to the app's port — is orphaned, and the *next* rebuild's respawn crashes with `EADDRINUSE`. This bites on literally the first rebuild the CLI does on cold start (it always compiles twice on boot; harmless when the kill/respawn works, fatal when it doesn't).
2. Docker Desktop's bind-mount filesystem bridge (gRPC-FUSE/VirtioFS on Windows/Mac hosts) doesn't reliably forward host inotify events into the container, so neither webpack's watcher (watchpack) nor the type-checker's watcher (chokidar) ever saw edits made on the host — live-reload silently did nothing.

## Decision

- Added a `dev` stage (`FROM deps`, i.e. full devDependencies, no `--prod` install) that runs `pnpm exec nest start $APP --watch` directly from source — no build step, root user, mirrors the existing root `package.json` `start:<app> --watch` scripts. `ARG APP` is captured into `ENV APP` so the shell-form `CMD` can expand it at container runtime (exec-form `CMD` doesn't do runtime variable substitution).
- Renamed the old `runtime` stage to `production` (behavior unchanged), so `--target production` reads clearly next to `--target dev`.
- For local dev, used Compose's built-in override-file convention: `docker-compose.override.yml` is auto-merged whenever `docker compose up` runs with no `-f` flag, so `pnpm run docker:dev` needs no extra flags. It sets `build.target: dev`, `NODE_ENV: development` (set explicitly per service — Compose's runtime `environment:` always wins over the image's baked-in Dockerfile `ENV`, so the base file's `NODE_ENV: production` would otherwise leak through), and bind-mounts `./apps`, `./libs`, and the root config files over the image's copies for live-reload.
- `docker-compose.yml` (the base file, unauthored-`-f` production default) now sets `build.target: production` explicitly on every service, rather than relying on Docker's "last stage in the file wins" default now that a second named stage (`dev`) exists.
- Added `pnpm run docker:dev` (`docker compose up --build`) and `pnpm run docker:prod` (`docker compose -f docker-compose.yml up --build -d`, explicitly excluding the override file) to root `package.json`.
- `dev` installs `procps` (fixes tree-kill's process discovery) and sets `WATCHPACK_POLLING=true`/`CHOKIDAR_USEPOLLING=true`/`CHOKIDAR_INTERVAL=300` (forces both watchers to poll instead of relying on inotify) to address the two issues above. Verified live: brought up the full `docker compose up --build` stack, confirmed `GET /health` through the gateway, edited `apps/api-gateway/src/controller/health.controller.ts` on the host while the stack was running, and confirmed the container recompiled, killed the old process cleanly (no `EADDRINUSE`), and `/health` reflected the change within ~8s.

## Consequences

- `docker build --target dev|production --build-arg APP=<project> .` both work standalone, outside Compose.
- The `dev` stage carries `procps` and forces filesystem polling — both are dev-only costs (slightly slower rebuild detection than native inotify, one extra installed package) that never reach the `production` stage, which doesn't need either.
- `docker-compose.override.yml`'s bind mounts mean `dev` containers depend on the host's `apps/`/`libs`/config files being present and current at `docker compose up` time — this is a local-only convenience layer, not meant to be portable to a remote/CI dev deployment.
- Anyone adding a 7th app still gets both targets for free, same as ADR 0012's per-app-Dockerfile-avoidance argument — nothing here is per-app.
- No staging environment exists yet. If one gets built later, see the Context note above for the shape it should take (production-image reuse, not a third distinct `NODE_ENV`) — that design was validated (Compose's `ports:` list merges by concatenation across `-f` files, not by target-port replacement, so a staging overlay needs the `!override` YAML merge tag on any `ports:` list it redefines; `volumes:` merges correctly by target path without needing it).
