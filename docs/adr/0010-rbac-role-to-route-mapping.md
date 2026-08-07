# 0010. Apply @Roles/RolesGuard to the first three routes that need RBAC

Status: Accepted
Date: 2026-08-03

## Context

`RolesGuard` and `@Roles(...)` (`libs/common`) existed since an earlier session but were never attached to a route — every guarded route only checked "is this a valid token", not "does this role have permission" (see ADR 0004/0009 references and the "Known, intentional limitations" section of `CLAUDE.md`). No route had a stated required role, so applying the guard meant picking one.

Three permissions were requested: only `admin` can create a product, only `admin` can read user records, and `merchant` can update inventory stock. `USER_ROLE` (`libs/constants`) already has `ADMIN`, `USER`, `MERCHANT`.

## Decision

Attach `@Roles(...)` + `RolesGuard` narrowly, only on the routes named:

- `POST /products` (create) → `ADMIN`. `product`'s own `ProductController` and `api-gateway`'s `ProductProxyController` both get it (both are independently reachable, per ADR 0007) — `findAll`/`findOne`/`update`/`remove` are untouched.
- `GET /users` and `GET /users/:id` → `ADMIN`. Same dual-app pattern: `user`'s `UserController` and `api-gateway`'s `UserProxyController`. `create`/`update`/`remove` are untouched.
- `PATCH /inventory/:productId/stock` → `MERCHANT`. This one only exists on `api-gateway`'s `InventoryProxyController` — `inventory` itself is TCP-only with no `JwtModule`/`AuthGuard` registered (see `CLAUDE.md`), so the gateway is the only place RBAC can be enforced today.

`ADMIN` was **not** additionally granted the `MERCHANT`-gated inventory route, and `MERCHANT`/`USER` were not granted anything beyond what was asked — scope matches the three stated permissions, not a general "admin can do everything" policy. Extending role coverage to more routes, or giving `ADMIN` a superset of other roles' permissions, is a separate decision for whoever needs it next.

Guards are applied as `@UseGuards(AuthGuard, RolesGuard)` at the class level (order matters: `AuthGuard` populates `request.user` first) with `@Roles(...)` per-method, so unlisted routes keep authentication-only behavior — `RolesGuard` no-ops when no `@Roles` metadata is present.

## Consequences

- The four routes above now 403 (`ForbiddenException`) for authenticated users of the wrong role, in addition to the existing 401 for missing/invalid tokens.
- Every other guarded route in the repo is unchanged — still authentication-only. The next role to gate (e.g. restricting order or product mutation further) needs its own explicit `@Roles(...)` call, not inherited behavior.
- Because `api-gateway`'s proxy services don't forward the `Authorization` header downstream (existing known gap), a request that reaches the gateway's `RolesGuard` correctly can still fail once proxied to the underlying app's own guard on `user`/`product` if hit that way — this ADR doesn't touch that gap.
