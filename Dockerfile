# syntax=docker/dockerfile:1

# Builds a single app out of this Nest CLI monorepo, selected via --build-arg APP=<project>.
# <project> is any application name from nest-cli.json's "projects" (order, inventory, auth,
# user, product, api-gateway) — libraries (constants, common) are inlined by webpack, not built
# standalone, so they are never a valid APP value here.

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

FROM toolchain AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS runtime
ARG APP
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/${APP} ./dist
RUN mkdir -p database && chown -R node:node /app
USER node
CMD ["node", "dist/main.js"]
