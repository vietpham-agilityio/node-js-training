# Decisions vs. code

What the records say against what is committed on this branch. Keep this table honest — an
ADR that quietly disagrees with the code is worse than no ADR.

Last checked: 20 Aug 2026, at `97d94fd`.

## Implemented and matching

| Record  | Where                                                                                      |
| ------- | ------------------------------------------------------------------------------------------ |
| ADR-001 | `src/app.module.ts`, `src/modules/` — one Nest app, modules registered at root             |
| ADR-002 | `src/database/data-source.options.ts` — `type: 'postgres'`                                 |
| ADR-003 | `package.json` — `typeorm`, `@nestjs/typeorm`; migrations under `src/database/migrations/` |
| ADR-004 | `src/main.ts` — `NestFactory.create(AppModule)` with no adapter, i.e. Express              |
| ADR-012 | `src/main.ts` — `SwaggerModule` at `${apiPrefix}/docs`, URI versioning                     |
| ADR-014 | `docker-compose.yml`, `.env.example`                                                       |
| DDR-008 | `src/config/env.validation.ts` — Joi schema, `abortEarly: false`, boot-time failure        |

## Diverging — needs a fix or a superseding record

| Record  | Says                                            | Code does                                                          | Where                                         |
| ------- | ----------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| DDR-005 | Pages are zero-indexed                          | One-indexed (`page = 1`, `skip = (page - 1) * limit`)              | `src/common/dto/pagination-query.dto.ts`      |
| DDR-006 | `{ statusCode, errorCode, message, timestamp }` | `{ statusCode, message, error, path, timestamp }` — no `errorCode` | `src/common/filters/all-exceptions.filter.ts` |
| DDR-007 | `forbidNonWhitelisted` deliberately **off**     | `forbidNonWhitelisted: true`                                       | `src/app.module.ts`                           |

Each of the three is also flagged in a blockquote at the foot of its own record. Resolve them
either way — change the code, or supersede the record — but do not leave them silently
disagreeing.

## Not yet built

Records that are accepted but have no code behind them yet. This is expected; the branch is
the application skeleton over a designed schema.

| Record           | Waiting on                                                            |
| ---------------- | --------------------------------------------------------------------- |
| ADR-005          | Auth module — bcrypt, JWT access token, hashed refresh tokens         |
| ADR-006          | `@Roles()` decorator and `RolesGuard`                                 |
| ADR-007          | `seat_holds` table and the `uq_seat_hold_active` partial unique index |
| ADR-008          | State-machine guards for seat hold and reservation                    |
| ADR-009          | `@nestjs/schedule` — the 60-second sweep and 15-minute completion job |
| ADR-010          | `is_active` / `status` flags and `ON DELETE RESTRICT` on the schema   |
| ADR-011, DDR-010 | Reports module and the aggregate queries                              |
| ADR-013          | Migrations creating the foreign-key and composite indexes             |
| DDR-001–004      | Reservations module                                                   |
| DDR-009          | Seed script                                                           |

## Keeping this current

Re-check when a module lands, and when a record is added or superseded. The
`/decision-record` skill reminds you to update this file.
