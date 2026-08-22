# Decisions vs. code

What the records say against what is committed on this branch. Keep this table honest — an
ADR that quietly disagrees with the code is worse than no ADR.

Last checked: 21 Aug 2026, on `feat/ticket-reservation` (Auth module landed).

## Implemented and matching

| Record  | Where                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------- |
| ADR-001 | `src/app.module.ts`, `src/modules/` — one Nest app, modules registered at root                  |
| ADR-002 | `src/database/data-source.options.ts` — `type: 'postgres'`                                      |
| ADR-003 | `package.json` — `typeorm`, `@nestjs/typeorm`; migrations under `src/database/migrations/`      |
| ADR-004 | `src/main.ts` — `NestFactory.create(AppModule)` with no adapter, i.e. Express                   |
| ADR-005 | `src/modules/auth/` — bcrypt, RS256 JWT access token, SHA-256-hashed refresh tokens             |
| ADR-006 | `src/common/decorators/roles.decorator.ts`, `src/common/guards/roles.guard.ts`                  |
| ADR-012 | `src/main.ts` — `SwaggerModule` at `${apiPrefix}/docs`, URI versioning                          |
| ADR-014 | `docker-compose.yml`, `.env.example`                                                            |
| DDR-006 | `src/common/filters/all-exceptions.filter.ts` — `{ statusCode, errorCode, message, timestamp }` |
| DDR-008 | `src/config/env.validation.ts` — Joi schema, `abortEarly: false`, boot-time failure             |
| DDR-011 | `src/common/dto/pagination-query.dto.ts` — one-indexed pages, supersedes DDR-005                |

## Diverging — needs a fix or a superseding record

| Record  | Says                                        | Code does                    | Where               |
| ------- | ------------------------------------------- | ---------------------------- | ------------------- |
| DDR-007 | `forbidNonWhitelisted` deliberately **off** | `forbidNonWhitelisted: true` | `src/app.module.ts` |

Each is also flagged in a blockquote at the foot of its own record. Resolve them either way —
change the code, or supersede the record — but do not leave them silently disagreeing.

## Not yet built

Records that are accepted but have no code behind them yet. This is expected; the branch is
the application skeleton over a designed schema.

| Record           | Waiting on                                                            |
| ---------------- | --------------------------------------------------------------------- |
| ADR-007          | `seat_holds` table and the `uq_seat_hold_active` partial unique index |
| ADR-008          | State-machine guards for seat hold and reservation                    |
| ADR-009          | `@nestjs/schedule` — the 60-second sweep and 15-minute completion job |
| ADR-010          | `is_active` / `status` flags and `ON DELETE RESTRICT` on the schema   |
| ADR-011, DDR-010 | Reports module and the aggregate queries                              |
| ADR-013          | Migrations creating the foreign-key and composite indexes             |
| DDR-001–004      | Reservations module                                                   |
| DDR-009          | Seed script                                                           |

## Notes

- **Ownership checks (ADR-006, BR-34).** The reusable pieces — `JwtAuthGuard`, `RolesGuard`,
  `@Roles()`, `@CurrentUser()` — are in place, but there is nothing to apply them to yet:
  Reservations/Movies/Showtimes have no controllers or services. Wiring ownership checks into
  `ReservationsService` is deferred to when that module is actually built.
- **Refresh token reuse detection.** ADR-005/BR-32 are satisfied by rotation + revocation.
  Detecting _reuse_ of an already-revoked token as a theft signal (and revoking the rest of
  that user's sessions in response) was considered and deliberately deferred — it needs a
  schema change (tracking token lineage) beyond what either record asks for.

## Keeping this current

Re-check when a module lands, and when a record is added or superseded. The
`/decision-record` skill reminds you to update this file.
