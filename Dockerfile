ARG NODE_VERSION=22.13.1
ARG PNPM_VERSION=10.3.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

FROM base AS build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

COPY . .

FROM base AS final

ENV NODE_ENV=production

USER node

COPY --from=build /app/package.json .
COPY --from=build /app/tsconfig.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src

EXPOSE 3001

CMD ["./node_modules/.bin/tsx", "src/server.ts"]
