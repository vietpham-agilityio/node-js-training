# 0018. Drop `ResponseLoggingInterceptor` from `product`/`user`, keep it gateway-only

Status: Accepted
Date: 2026-08-06

## Context

`product`/`user` each registered `ResponseLoggingInterceptor` as an `APP_INTERCEPTOR`, wrapping their own HTTP responses in `{success, data, timestamp}` — on top of `api-gateway`'s own copy of the same interceptor, registered in `app.module.ts`. Since `ProductProxyService`/`UserProxyService` (`HttpProxyService.forward()`) return the downstream response body as-is, a request routed through the gateway got wrapped twice: `{success, data: {success, data: <entity>, timestamp}, timestamp}`. `order` never had this problem — `order.module.ts` never registered the interceptor, so `OrderProxyService` forwards a plain body that the gateway's interceptor wraps exactly once.

## Decision

Remove the `APP_INTERCEPTOR`/`ResponseLoggingInterceptor` provider from `product.module.ts` and `user.module.ts`, matching `order`'s existing pattern — the response envelope is now applied exactly once, by `api-gateway`, regardless of which downstream app served the request. `HttpErrorFilter` (`APP_FILTER`) stays registered in both, since error responses were never double-wrapped (`HttpProxyService.toHttpException()` already extracts just the `message` field from the downstream error body rather than nesting it).

Considered and rejected: unwrapping the envelope in `HttpProxyService.forward()` when present (implemented and reverted in this same change) — it fixed the double-wrap without changing `product`/`user`'s own response shape, but meant `product`/`user`'s direct-access API contract (they remain reachable on 3003/3004, see ADR 0007) still depended on a duck-typed envelope check in shared proxy code. Removing the interceptor is fewer moving parts and treats `api-gateway` as the sole owner of the response envelope, consistent with it being the sole intended entry point (ADR 0005).

## Consequences

Calling `product`/`user` directly on their own ports now returns a raw, unwrapped entity/array on success (matching `order`'s direct-access shape) instead of `{success, data, timestamp}` — a behavior change for any direct caller relying on the old envelope. Error responses direct from `product`/`user` are unaffected (`HttpErrorFilter` still applies). `apps/product/test/app.e2e-spec.ts` and `apps/user/test/app.e2e-spec.ts` were updated to assert against the raw body instead of `body.data`. Responses through `api-gateway` are unaffected in shape — they were always meant to be the single `{success, data, timestamp}` wrap and now actually are, instead of the nested double-wrap this ADR fixes.
