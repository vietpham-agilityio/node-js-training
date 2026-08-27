# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# ---- base: shared setup, no source yet ----
FROM node:${NODE_VERSION} AS base
RUN corepack enable && corepack prepare pnpm@10.3.0 --activate
# bcrypt has a native binding; musl/alpine has no prebuilt binary for it.
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# ---- dependencies: full install (incl. devDependencies) ----
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# ---- development target: hot reload, full deps, source bind-mounted ----
FROM dependencies AS development
COPY . .
COPY docker-entrypoint.dev.sh ./
RUN chmod +x docker-entrypoint.dev.sh
ENV NODE_ENV=development
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.dev.sh"]

# ---- build: compile TypeScript -> dist/ ----
FROM dependencies AS build
COPY . .
RUN pnpm run build

# ---- PRODUCTION --------

# ---- production-dependencies: lean install, no devDependencies ----
FROM base AS production-dependencies
RUN pnpm install --frozen-lockfile --prod

# ---- production target: used for both staging and production ----
FROM node:${NODE_VERSION} AS production
RUN corepack enable && corepack prepare pnpm@10.3.0 --activate
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
WORKDIR /app
ENV NODE_ENV=production
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]
