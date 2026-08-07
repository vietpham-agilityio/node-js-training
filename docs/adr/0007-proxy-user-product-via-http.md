# 0007. Proxy `user`/`product` through `api-gateway` over HTTP, with gateway-level versioning and Swagger

Status: Accepted
Date: 2026-07-29

## Context

`docs/adr/0006-typeorm-persistence-and-split-user-product-apps.md` split `user`/`product` into their own HTTP apps (ports 3003/3004) but left the "should they be proxied through `api-gateway`" question open — they were directly reachable, unlike `order`, which `docs/adr/0005-api-gateway-sole-entry-point.md` already made the gateway the sole entry point for. That gap is now being closed: `api-gateway` becomes the single client-facing entry point for `order`, `user`, and `product` alike.

Two transports were available for this proxy. `inventory-proxy.service.ts` already proxies `inventory` over TCP (`ClientProxy`), since `inventory` has no HTTP surface at all. `order-proxy.service.ts` proxies `order` over HTTP (`HttpService`), since `order` is an HTTP app. `user`/`product` are HTTP-only apps with no TCP listener — and `libs/constants/src/shared/router/route.ts` already had `USER_BASE_URL`/`PRODUCT_BASE_URL` (reading `USER_SERVICE_BASE_URL`/`PRODUCT_SERVICE_BASE_URL`) and `API_ENDPOINT.USER`/`API_ENDPOINT.PRODUCT` defined but unused, with matching entries already present in `.env` — clear groundwork for an HTTP proxy that was never wired up.

Going TCP instead would have meant retrofitting `user`/`product` into hybrid apps (adding a TCP listener alongside their existing HTTP server), redefining every route as a `@MessagePattern`, and building the RPC exception filter called out as missing in the "What's next" section of `CLAUDE.md` — since plain Nest HTTP exceptions (e.g. `NotFoundException`, thrown today in these services' controllers/services) don't serialize cleanly over TCP without one.

Separately, the gateway itself had no URI versioning or Swagger docs, unlike `user`/`product`, which both use `VersioningType.URI` + `VersionManagementMiddleware` (`@app/common`) + `@nestjs/swagger`.

## Decision

Proxy `user`/`product`'s full HTTP surface (create/list/get-one/update/delete) through new `UserProxyService`/`ProductProxyService` + `UserProxyController`/`ProductProxyController`, mirroring `order-proxy.service.ts`/`proxy.controller.ts`'s shape exactly (axios-error-to-`HttpException` translation, route/guard/Swagger-decorator parity with the downstream controllers). DTOs and entities are imported directly from `apps/user/src/*` / `apps/product/src/*`, extending the same accepted apps→apps exception to the "hard rule" that `OrderProxyService` already relies on for `apps/order/src/*`.

No request-time version forwarding was added: the proxy calls the same unversioned downstream path `OrderProxyService` already uses (e.g. `${USER_BASE_URL}/users`), letting the downstream app's own `VersionManagementMiddleware` default it to v1. Neither `user` nor `product` has any actual v2-diverging behavior today (the `CreateUserDTO.address` "introduced in v2" comment is aspirational), so there's nothing to route differently yet — this can be revisited once one exists.

`api-gateway`'s `main.ts` was brought up to the same versioning/Swagger bootstrap `user`/`product` already use (`enableVersioning` + `VersionManagementMiddleware` + `DocumentBuilder`/`SwaggerModule.setup('api-docs', ...)`), applied globally rather than scoped to the new routes only, since Nest's URI versioning is an app-level setting.

## Consequences

External clients now have one HTTP entry point (3002) for `order`, `inventory` (via TCP proxy), `user`, and `product`. `user-proxy.controller.ts`/`product-proxy.controller.ts` must be manually kept in sync with `users.controller.ts`/`product.controller.ts` — the same maintenance cost ADR 0005 already accepted for the order proxy, since no shared route contract exists between apps.

Enabling versioning globally on the gateway also affects the pre-existing `order`/`inventory`/`health` routes: because `VersionManagementMiddleware` rewrites any unversioned incoming path to `/v1/...` before Nest's router sees it (the same mechanism `user`/`product` already depend on), those routes keep responding at their original unversioned paths and are now additionally reachable at `/v1/...` — a non-breaking superset, not a behavior change.

`user`/`product` themselves remain unchanged and still directly reachable on 3003/3004 — this ADR does not close that off, it only adds the gateway as an additional, now-complete front door. Closing the direct ports off (if ever desired) is separate, future work.
