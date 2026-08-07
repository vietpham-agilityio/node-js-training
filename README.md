# node-js-training

A NestJS microservices practice project — a Nest CLI **monorepo** (not Nx), package manager **pnpm**. Six apps talk to each other over HTTP and TCP behind a single API gateway; see [`CLAUDE.md`](./CLAUDE.md) for the full architecture, conventions, and known gotchas, and [`docs/adr/`](./docs/adr/) for the design decisions behind them.

## Architecture

```
apps/
  api-gateway/   HTTP app. Sole client-facing entry point — proxies to order/inventory/user/product/auth.
  order/         HTTP + TCP microservice. TypeORM + SQLite.
  inventory/     TCP-only microservice (no HTTP). TypeORM + SQLite.
  user/          HTTP + TCP hybrid. TypeORM + SQLite, Swagger, URI versioning (v1/v2).
  product/       HTTP app. TypeORM + SQLite, Swagger, URI versioning (v1/v2).
  auth/          TCP-only microservice (no HTTP, no persistence). Issues/signs JWTs.
libs/
  common/        Cross-cutting primitives (filters, interceptors, guards, JWT/TLS/cache utils). @app/common
  constants/     Shared event names + shared domain shapes. @app/constants
```

| App         | HTTP port | TCP port | Notes                                                     |
|-------------|-----------|----------|------------------------------------------------------------|
| api-gateway | 3002      | —        | `/orders*`, `/users*`, `/products*`, `/inventory/:id/stock`, `/auth/login`, `/auth/register`, `/health`; Swagger at `/api-docs` |
| order       | 3001      | 8001     | create/list/update/delete orders                          |
| inventory   | —         | 8002     | pure microservice, no HTTP                                 |
| auth        | —         | 8003     | pure microservice, no HTTP, no persistence — signs/issues JWTs |
| user        | 3003      | 8004     | Swagger at `/api-docs`; TCP side validates credentials + creates users for `auth` |
| product     | 3004      | —        | Swagger at `/api-docs`                                     |

Key features covered by this practice repo: TCP/HTTP hybrid microservices, an event-driven order↔inventory flow, RS256 JWT auth with per-app local verification, role-based access control, Redis-backed response caching, TLS termination + helmet security headers at the gateway, structured Pino logging, and a Dockerized multi-service deployment.

## Setup

```bash
$ pnpm install
```

Copy `.env.example` to `.env` at the repo root and fill in an RS256 keypair (keygen one-liner is in the file) — required by `auth`/`user`/`product`/`api-gateway`. `REDIS_URL` and the `TLS_*` cert paths are optional for local dev (caching/HTTPS both fall back cleanly when unset).

To run the gateway over HTTPS locally, generate a self-signed cert into the gitignored `/certs` folder and point `TLS_KEY_PATH`/`TLS_CERT_PATH` at it:

```bash
$ mkdir certs
$ openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365 -subj "/CN=localhost"
```

## Running

Nest CLI monorepo mode: `nest build`/`nest start` alone only target the default project (`api-gateway`).

```bash
# build every project
$ pnpm exec nest build --all

# run one app in watch mode
$ pnpm run start:gateway   # also: start:order, start:inventory, start:user, start:product, start:auth

# whole stack (all six apps + Redis) via Docker Compose
$ pnpm run docker:dev
$ curl -k https://localhost:3002/health
```

## Testing

```bash
# unit tests (co-located *.spec.ts across every app)
$ pnpm run test:unit

# e2e tests, one script per app with its own persistence
$ pnpm run test:e2e:order
$ pnpm run test:e2e:user
$ pnpm run test:e2e:product
$ pnpm run test:e2e:inventory

# coverage
$ pnpm run test:cov
```

CI (`.github/workflows/ci.yml`) runs lint/build/all of the above on every push and PR against a `feat/*` branch.

## Further documentation

- [`CLAUDE.md`](./CLAUDE.md) — full architecture, cross-cutting conventions, env vars, and known/intentional limitations.
- [`docs/adr/`](./docs/adr/) — lightweight ADRs recording the design decisions behind the non-obvious choices (why TLS only at the gateway, why Redis for caching, why Docker Compose over Kubernetes for now, etc.).

## License

Private practice project — `UNLICENSED` (see `package.json`).
