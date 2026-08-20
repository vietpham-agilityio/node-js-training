# ADR-005 — Self-Issued JWT Authentication with Revocable Refresh Tokens

Accepted · 14 Aug 2026 · Related: ADR-006, DDR-008

## Context

The requirements state that users should be able to sign up and log in. That makes
authentication a feature this backend owns rather than delegates.

## Decision

Implement authentication in the application. Passwords are hashed with bcrypt. Login issues
a short-lived JWT access token (15 minutes) and a longer-lived refresh token (7 days) stored
hashed in the database so it can be revoked.

## Consequences

- Access-token validation is stateless, so no database lookup is needed on every request.
- Refresh tokens can be revoked on logout or password change, which a purely stateless
  design could not do.
- The role is carried as a token claim, so authorization checks need no extra query.
- Password reset, token rotation and secret management become the application's
  responsibility.

## Rejected

- **A third-party identity provider (Clerk, Auth0)** — removes the work, but delegates the
  exact feature the requirements ask this backend to demonstrate, and adds an external
  dependency to the login path.
- **Session cookies with a server-side store** — a reasonable web pattern, but awkward for
  an API client and would need a shared session store to scale.
