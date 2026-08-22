# DDR-012 — Users module endpoint and permission design

Accepted · 22 Aug 2026 · Implements ADR-006, ADR-012

## Context

`src/modules/users/` had only the `User` entity — no service or controller. ADR-006 decided
_how_ authorization works (`@Roles()` + `RolesGuard`, ownership from the authenticated id) but
not _what_ the Users module's own endpoints are. BR-33 and BR-34 constrain the shape (a client
can never set its own role; an admin may read broadly but doesn't act as another user) without
fully determining it, so this record fills in the rest: the endpoint list, the self/admin
split, and two guards neither BR nor ADR requires but that follow directly from other accepted
decisions.

## Decision

- `GET /users` and `GET /users/:id` — admin only, for listing/viewing any account.
- `GET /users/me` / `PATCH /users/me` — any authenticated user, scoped to their own row via
  `@CurrentUser()`, never a client-supplied id (BR-34). `GET /users/me` returns the full `User`
  row (phone, address, avatar, etc.); `GET /auth/me` is unchanged and keeps returning only the
  JWT claims (`id`, `email`, `role`) for a cheap "am I logged in" check.
- `PATCH /users/:id` (admin) is scoped to `role` and `isActive` only — never a target's
  personal fields (name, phone, address, ...). Editing another user's own information is not
  something an admin does in this system; it stays exclusively self-service through
  `PATCH /users/me`.
- `PATCH /users/:id` and `DELETE /users/:id` reject the request (403,
  `ADMIN_SELF_ACTION_FORBIDDEN`) when the target id equals the acting admin's own id.
- `DELETE /users/:id` implements `BaseAbstractService`'s abstract `remove()` as a soft delete
  (`isActive = false`), per ADR-010's convention for this row (`docs/database/README.md`
  already cites ADR-10 for why `users.is_active` exists). Clearing the flag through
  `PATCH /users/:id { isActive: true }` is how a deactivated account is restored.
- No endpoint creates a user — `AuthService.register` remains the only way a `User` row comes
  into existence, and it always writes `role: user` (BR-33).

## Why

- **Self-lockout guard.** DDR-009 seeds the one and only initial admin; ADR-006 confirms no
  route can create another. If an admin could deactivate or demote their own account through
  the generic admin-management endpoints, there would be no way back in — the system has
  exactly one path to becoming adminless (nobody left to seed again without touching the
  database directly). A same-id check on these two routes closes that off at negligible cost.
- **Admin edits limited to role/active-status.** Keeps a clean separation of concerns: an
  admin manages account standing (who can act, what they're allowed to do), a user manages
  their own information. It also means the admin DTO (`AdminUpdateUserDto`) never needs to
  reconcile with the profile DTO's validation rules, and an admin's mistake can't corrupt
  another user's personal data.
- **`GET /users/me` alongside `GET /auth/me`.** `AuthenticatedUser` (the JWT payload) only
  carries `{ id, email, role }` — everything else needs a database read. Rather than bloat the
  token or the `/auth/me` response, the Users module owns the fuller read since it owns the
  entity (ADR-001).

## Rejected

- **A single `/users/:id` PATCH usable by both the owner and an admin**, gated only by
  `RolesGuard`'s "any authenticated user" default when no `@Roles()` is set — would let a
  regular user pass `role`/`isActive` on their own PATCH if the DTO were shared, and blurs the
  self-service/admin-management line this record wants to keep sharp.
- **Letting an admin edit another user's profile fields too** — considered, since it would be
  a small DTO change, but rejected to keep the admin surface minimal and auditable: an admin
  route that can rewrite anything about any account is a much bigger thing to get wrong than
  one limited to role and status.
- **Hard-deleting a user on `DELETE /users/:id`** — `seat_holds.user_id` and
  `reservations.user_id` are `ON DELETE RESTRICT` (`docs/database/README.md`), so a hard delete
  would fail at the database for any user with reservation history anyway; soft delete is the
  only option that works uniformly.

## Consequences

| Gains                                                                                                                                                         | Costs accepted                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| An admin can never accidentally lock the system out of its own admin.                                                                                         | One more guard clause and error code (`ADMIN_SELF_ACTION_FORBIDDEN`) to maintain.                                                         |
| The self-service/admin boundary is enforced by which DTO exists, not by a check someone has to remember (mirrors DDR-007's structural-protection philosophy). | An admin genuinely wanting to fix another user's typoed name has no route for it — would need direct database access or a future feature. |

## Follow-up

- If a "support agent edits a customer's profile" need ever appears, it should be its own
  explicitly-scoped DTO/endpoint, not a widening of `AdminUpdateUserDto`.

## Revisit if

More than one admin account becomes routine (e.g. a future invite-another-admin flow) — the
self-lockout guard's rationale (there is exactly one path back in) gets weaker once admins can
create other admins.
