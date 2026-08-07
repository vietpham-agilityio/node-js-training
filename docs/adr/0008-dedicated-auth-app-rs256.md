# 0008. Dedicated `auth` app issuing RS256 JWTs, verified locally by every guarded app

Status: Accepted
Date: 2026-07-30

## Context

`libs/common`'s `AuthGuard` only checked that a Bearer header was present — not real authentication, as `CLAUDE.md` already documented. `UserEntity` had just gained `password` and `role` fields, creating the opportunity (and the need) to build real authentication and role-based authorization on top of them.

Three real alternatives existed for where login/credential-checking should live:

1. Add a login route directly on `user` (it already owns the password column).
2. A new dedicated `auth` app.
3. Skip a dedicated app; do everything ad hoc per-service.

And, separately, three alternatives for how every other service (order, product, user, api-gateway) verifies a token on each request:

1. **Shared HS256 secret**, distributed to every service, each verifying locally.
2. **Synchronous TCP call to `auth` on every guarded request** — true single source of truth (only `auth` can decide validity, and revocation is immediate), at the cost of a network hop and a hard runtime dependency on `auth` for every single authenticated request across every service.
3. **Asymmetric RS256**: `auth` holds the private key and is the only thing that can *mint* a valid token; every other service holds only the public key (not sensitive) and verifies signatures *locally*, no network call per request.

## Decision

Built a new dedicated, TCP-only `auth` app (mirroring `inventory`'s no-HTTP shape), registered in `nest-cli.json`, listening on port 8003. It owns nothing persistent — no database — and depends on `user` only for the one-time credential check at login/register time, via a new TCP listener added to `user` (port 8004, hybrid HTTP+TCP like `order`).

Chose **RS256 asymmetric signing** (option 3 above) for verification: `auth` holds `JWT_PRIVATE_KEY_BASE64` and signs; `user`, `product`, and `api-gateway` each register their own verify-only `JwtModule.registerAsync` with just `JWT_PUBLIC_KEY_BASE64`. Both are base64-encoded PEM strings in `.env` (real values are gitignored; `.env.example` documents the shape and the one-line keygen command). This gives the single-source-of-truth property of option 2 (only `auth` can issue a token another service will accept) without paying a network round-trip on every authenticated request, unlike option 2. `order`/`inventory` don't register `JwtModule` yet since neither applies `AuthGuard` today — consistent with the existing "cross-cutting conventions aren't applied uniformly yet" gap already called out in `CLAUDE.md`.

`AuthGuard` (`libs/common`) now actually verifies the token (`JwtService.verifyAsync`, RS256-only) and attaches the decoded payload (`sub`/`email`/`role`) to `request.user`. A new `RolesGuard` + `@Roles(...)` decorator (also `libs/common`) reads that payload's `role` against metadata set via `@Roles(...)`, giving every app a ready-made authorization primitive — no route was switched to use it yet, since no one has specified which roles should gate which existing routes.

Two flows through `api-gateway`'s new `AuthProxyController`, both TCP-proxied to `auth` (mirroring `InventoryProxyController`'s TCP-proxy shape) and both returning `{ accessToken }`:

- `POST /auth/login` — `auth` calls `user`'s `VALIDATE_CREDENTIALS` message pattern (bcrypt-compares against the hashed password, `select: false` on that column so it's never returned by default queries), then signs a token.
- `POST /auth/register` — public, unguarded (registration can't require a token you don't have yet). `auth` calls `user`'s new `CREATE_USER` message pattern with `role` **forced** to `USER_ROLE.USER` server-side, ignoring anything the client sent, then signs a token. `POST /users` (guarded, on `user`/gateway) remains the separate path for creating a user with an arbitrary role.

`UserService.create`/`update` now strip `password` from what they return (it was being echoed back in the HTTP response body even before hashing existed, since `select: false` only suppresses *querying* the column — `.save()` still hands back whatever was assigned onto the entity before persisting).

## Consequences

Login/register are a single occasional TCP hop (`auth` → `user`); every subsequent authenticated request to any guarded route is verified with zero network calls, pure local signature checking against the public key. Only `auth` can produce a token any service will accept, since only it holds the private key.

`api-gateway`'s proxy services still don't forward the caller's `Authorization` header downstream to `order`/`user`/`product` (a pre-existing gap, not introduced by this change) — so a guarded route hit *through the gateway* still 401s with "Missing bearer token" even with a valid token, while the same request against the downstream app directly (e.g. `user` on 3003) succeeds. That gap is explicitly deferred, not fixed here.

Adding a role requirement to an existing route is now just `@UseGuards(AuthGuard, RolesGuard)` + `@Roles(USER_ROLE.ADMIN)` — no route currently does this.

Rotating the RS256 keypair requires redeploying every app that verifies tokens (`user`, `product`, `api-gateway`) with the new public key, plus `auth` with the new private key, coordinated — there's no key-versioning/JWKS-rotation story, consistent with this project's stance of not building infrastructure nobody asked for yet.
