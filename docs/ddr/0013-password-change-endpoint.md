# DDR-013 — Password change endpoint

Accepted · 22 Aug 2026 · Implements ADR-005

## Context

Auth module has `register`, `login`, `refresh` and `logout` — there was no way for a user to
change their password once signed up, short of registering a new account. No ADR, DDR or
business rule describes a change-password flow; this record exists because Users module was
being built out and this gap became concrete rather than because a record already called for
it.

## Decision

`PATCH /users/me/password`, guarded by `JwtAuthGuard` only (self-service, no admin variant).
Body is `{ currentPassword, newPassword }`. The service:

1. Loads the caller's `User` row (never a client-supplied id — the id comes from
   `@CurrentUser()`).
2. Verifies `currentPassword` against the stored `passwordHash` with `bcrypt.compare`; a
   mismatch throws `AppException(INVALID_CREDENTIALS, ..., 401)` — the same code and status
   `AuthService.login` uses for a wrong password.
3. Hashes `newPassword` with the same `BCRYPT_SALT_ROUNDS` constant Auth already uses
   (`src/modules/auth/constants/auth.constants.ts`), and writes it directly via
   `repository.update(id, { passwordHash })` — bypassing `BaseAbstractService.update()`,
   since that method exists for DTO-shaped entity fields and a raw `newPassword` string is not
   one (the entity column is `passwordHash`, already hashed).
4. Returns `204 No Content`.

`newPassword` is validated `@MinLength(8) @MaxLength(72)`, matching `RegisterDto.password` —
72 is bcrypt's effective input cap, not an arbitrary choice.

Existing refresh tokens are **not** revoked when a password changes.

## Why

- Requiring the current password is the standard defense against a hijacked, still-logged-in
  session being used to lock the real owner out by changing their password to something only
  the attacker knows.
- Reusing `BCRYPT_SALT_ROUNDS`/bcrypt rather than introducing a second hashing scheme keeps
  exactly one password-hashing story in the codebase, and keeps the seeded admin's hash
  (`src/database/seed/seed.service.ts`) comparable the same way a real signup's is.
- Bypassing the generic `update()` avoids stretching the base CRUD service's contract to
  handle a field that requires a transform (hash) before it can be persisted at all — `update`
  stays a plain merge-and-save.

## Rejected

- **Revoking all existing refresh tokens on password change** — the safer, more complete
  choice, but out of reach here without Users module reaching into Auth's `RefreshToken`
  repository, which ADR-001 reserves to the module that owns it. Doing this properly belongs
  with — and is really the same piece of work as — the refresh-token-reuse-detection feature
  that `docs/decisions-vs-code.md` already notes was deliberately deferred pending a schema
  change (token lineage tracking). Revisiting one without the other would be a half-measure.
- **Putting this on the Auth module instead** (`PATCH /auth/password`) — plausible, since Auth
  owns the other credential-mutating flows, but it would need its own `Repository<User>`
  injection there purely for this one write, duplicating what Users module already has as its
  owned entity. Users module doing it keeps the entity-owning module doing the one write that
  isn't itself an auth _session_ concern (no tokens are issued or rotated here).

## Consequences

| Gains                                                                            | Costs accepted                                                                                                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| A compromised password can be changed by its owner without support intervention. | A stolen, still-valid access/refresh token pair survives a password change until it expires or is explicitly logged out. |
| One hashing scheme, one salt-rounds constant, shared with register and seed.     | —                                                                                                                        |

## Follow-up

- When refresh-token reuse detection is eventually built (tracking token lineage), revisit
  revoking a user's other sessions on password change at the same time — same schema
  dependency, same underlying problem.

## Revisit if

A real incident (support ticket, security report) shows a stolen session was used after the
legitimate owner changed their password.
