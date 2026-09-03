# syntax=docker/dockerfile:1
#
# Build context is the WORKSPACE ROOT, not apps/api — the image needs the root
# lockfile and pnpm-workspace.yaml to resolve @movea/api. Build it as:
#
#   docker build -f apps/api/Dockerfile .
#
# `pnpm --filter @movea/api...` keeps the mobile app's dependency tree out of
# every stage, so the image never pulls Expo or React Native.

ARG NODE_VERSION=22-alpine

# ---- base: workspace metadata only, so this layer survives source edits ----
FROM node:${NODE_VERSION} AS base
RUN corepack enable && corepack prepare pnpm@10.3.0 --activate
# bcrypt has a native binding; musl/alpine has no prebuilt binary for it.
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/api-contract/package.json ./packages/api-contract/

# ---- dependencies: full install (incl. devDependencies) for the API only ----
FROM base AS dependencies
RUN pnpm install --frozen-lockfile --filter @movea/api...

# ---- development target: hot reload, full deps, source bind-mounted ----
FROM dependencies AS development
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN chmod +x docker-entrypoint.dev.sh
ENV NODE_ENV=development
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.dev.sh"]

# ---- build: compile TypeScript -> apps/api/dist ----
FROM dependencies AS build
COPY apps/api ./apps/api
RUN pnpm --filter @movea/api build

# ---- PRODUCTION --------

# ---- production-dependencies: lean install, no devDependencies ----
FROM base AS production-dependencies
RUN pnpm install --frozen-lockfile --prod --filter @movea/api...

# ---- production target: used for both staging and production ----
FROM node:${NODE_VERSION} AS production
RUN corepack enable && corepack prepare pnpm@10.3.0 --activate
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
WORKDIR /app
ENV NODE_ENV=production

# node-linker=hoisted puts the runtime tree at the workspace root; Node's
# upward resolution from /app/apps/api finds it.
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=production-dependencies /app/package.json /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/package.json ./apps/api/
COPY apps/api/docker-entrypoint.sh ./apps/api/

WORKDIR /app/apps/api
RUN chmod +x docker-entrypoint.sh
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]
