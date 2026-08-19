# Movie Reservation System — API

NestJS + TypeORM + PostgreSQL backend for the ticket reservation capstone.

The database it talks to is designed on the `chore/establish-ticket-reservation-views`
branch (11 tables, 6 views, `BR-xx` business rules). This branch is the application
layer over that schema.

---

## Prerequisites

| Tool       | Version                                                     |
| ---------- | ----------------------------------------------------------- |
| Node.js    | 22+                                                         |
| pnpm       | 10+                                                         |
| PostgreSQL | 16+ (local install, or `pnpm run db:up` for the Docker one) |

---

## Getting started

```bash
pnpm install
```

```bash
cp .env.example .env
```

Fill in `.env`, then start the database and the API:

```bash
pnpm run db:up
```

```bash
pnpm run start:dev
```

- API — http://localhost:3000/api/v1
- Swagger UI — http://localhost:3000/api/docs
- Health probe — http://localhost:3000/api/health

---

## Layout

```
src/
  main.ts                       bootstrap: helmet, CORS, prefix, versioning, Swagger
  app.module.ts                 root module — register domain modules here
  config/
    env.validation.ts           Joi schema; a bad env fails startup, not runtime
    app.config.ts               typed `app` namespace
  database/
    data-source.options.ts      connection options shared by Nest and the CLI
    data-source.ts              entry point for the TypeORM CLI
    database.module.ts          TypeOrmModule.forRootAsync
    migrations/                 generated migrations land here
  common/
    filters/                    AllExceptionsFilter — one JSON error shape
    dto/                        PaginationQueryDto and friends
  modules/
    health/                     Terminus probe with a database ping
```

Domain modules (`auth`, `users`, `movies`, `showtimes`, `reservations`, `tickets`)
go under `src/modules/` and get registered in `app.module.ts` as each one lands.

---

## Conventions

**API surface.** URI versioning under a global `api` prefix, so routes resolve to
`/api/v1/<resource>`. Health is `VERSION_NEUTRAL` — orchestrators get one stable URL.

**Validation.** A global `ValidationPipe` runs with `whitelist` and
`forbidNonWhitelisted`, so any property a DTO does not declare is a 400. Write the
DTO and the rules follow.

**Errors.** Everything thrown becomes
`{ statusCode, message, error, path, timestamp }`. 5xx bodies are generic; the stack
goes to the log instead.

**Schema changes.** `synchronize` is off. The schema is migration-managed:

```bash
pnpm run migration:generate src/database/migrations/AddSeatHolds
```

```bash
pnpm run migration:run
```

---

## Scripts

| Script                                           | What it does                                  |
| ------------------------------------------------ | --------------------------------------------- |
| `pnpm run start:dev`                             | watch-mode dev server                         |
| `pnpm run build` / `start:prod`                  | compile to `dist/`, run the compiled app      |
| `pnpm run lint` / `lint:check`                   | ESLint with / without `--fix`                 |
| `pnpm run format` / `format:check`               | Prettier write / verify                       |
| `pnpm test` / `test:watch` / `test:cov`          | Jest unit tests                               |
| `pnpm run test:e2e`                              | end-to-end suite (needs a reachable database) |
| `pnpm run migration:generate\|run\|revert\|show` | TypeORM migrations                            |
| `pnpm run db:up` / `db:down` / `db:logs`         | Postgres via Docker Compose                   |

---

## Commit conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org), enforced
by commitlint through a husky `commit-msg` hook:

```
feat(reservations): hold seats for ten minutes
fix(auth): reject expired refresh tokens
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`. Scopes are free-form — use the module you touched.

Git hooks, installed automatically by `pnpm install`:

| Hook         | Runs                                              |
| ------------ | ------------------------------------------------- |
| `pre-commit` | `lint-staged` — ESLint + Prettier on staged files |
| `commit-msg` | `commitlint`                                      |
| `pre-push`   | `tsc --noEmit` + unit tests                       |

To skip a hook in an emergency, `git commit --no-verify`.
