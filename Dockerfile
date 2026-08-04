# syntax=docker/dockerfile:1

# Builds a single app out of this Nest CLI monorepo, selected via --build-arg APP=<project>.
# <project> is any application name from nest-cli.json's "projects" (order, inventory, auth,
# user, product, api-gateway) — libraries (constants, common) are inlined by webpack, not built
# standalone, so they are never a valid APP value here.
#
# Two buildable targets, select via --target <name>:
#   dev        full devDependencies, runs `nest start <app> --watch` from source, root user.
#              Meant to run with source bind-mounted over it (see docker-compose.override.yml)
#              for live-reload local iteration.
#   production the real deployable image: prod-only node_modules, prebuilt dist/, non-root.

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-slim AS base
RUN corepack enable && corepack prepare pnpm@10.3.0 --activate
WORKDIR /app

# Native modules (better-sqlite3, bcrypt) need a toolchain to compile during install.
FROM base AS toolchain
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

FROM toolchain AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG APP
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY apps ./apps
COPY libs ./libs
RUN pnpm exec nest build ${APP}

# `deps` already has full devDependencies (@nestjs/cli, pino-pretty, ts-node, ...) via the
# non-prod install above, so `dev` just needs source on top — no separate build step, it
# runs the Nest CLI's own watch/HMR mode the same way the root package.json's start:<app>
# --watch scripts do.
FROM deps AS dev
ARG APP
ENV APP=${APP} NODE_ENV=development
# Docker Desktop's bind-mount filesystem (gRPC-FUSE/VirtioFS on Windows/Mac hosts) doesn't
# reliably forward host inotify events into the container, so webpack's watcher (watchpack)
# and the type-checker's watcher (chokidar) never see edits made on the host unless forced
# into polling mode.
ENV WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true CHOKIDAR_INTERVAL=300
# @nestjs/cli's --watch mode kills and respawns the app process on every rebuild by walking
# the process tree via the `ps` binary (lib/utils/tree-kill.js, non-Windows branch). node:slim
# doesn't ship `ps` (no procps), so that lookup silently comes back empty, only the outer
# shell gets killed, and the actual node process — still holding the app's TCP/HTTP port —
# is orphaned. The next rebuild's respawn then fails with EADDRINUSE. Installing procps fixes
# tree-kill's process discovery; this was verified by reproducing/fixing it directly.
RUN apt-get update \
  && apt-get install -y --no-install-recommends procps \
  && rm -rf /var/lib/apt/lists/*
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY apps ./apps
COPY libs ./libs
RUN mkdir -p database
CMD ["sh", "-c", "pnpm exec nest start $APP --watch"]

FROM toolchain AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS production
ARG APP
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/${APP} ./dist
RUN mkdir -p database && chown -R node:node /app
USER node
CMD ["node", "dist/main.js"]
