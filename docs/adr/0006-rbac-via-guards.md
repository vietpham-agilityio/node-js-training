# ADR-006 — Role-Based Access Control via Guards

Accepted · 14 Aug 2026 · Related: ADR-005, DDR-007

## Context

Two roles are required — `admin` and regular `user`. Admins manage movies and showtimes and
view reporting; regular users reserve seats and manage only their own reservations. Only an
admin may promote another admin.

## Decision

Store the role on the user record. Enforce it with a `@Roles()` decorator and a `RolesGuard`
applied at the route level. Ownership checks — that a user acts only on their own
reservations — are made in service code using the authenticated user id, never a value
supplied by the client.

## Consequences

- Authorization is visible at the route definition, so the security surface can be read and
  audited quickly.
- A new admin-only route opts in with one decorator.
- The initial admin comes from seed data, so no route can create the first one (DDR-009).
- Only two roles are modelled; a third would need either another enum value or a permissions
  table.

## Rejected

- **A permissions or ACL table** — unnecessary complexity for two roles with no requirement
  asking for finer control.
- **Checking the role inside each controller method** — works, but scatters the rule and is
  easy to forget on a new endpoint.
