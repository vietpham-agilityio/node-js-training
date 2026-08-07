# 0009. Shared `ProxyService`/`TCPProxyService`/`HttpProxyService` hierarchy for downstream-error mapping

Status: Accepted
Date: 2026-08-03

## Context

`api-gateway`'s five proxy services (`AuthProxyService`, `InventoryProxyService`, `OrderProxyService`, `ProductProxyService`, `UserProxyService`) each hand-rolled their own private `toHttpException(error: unknown): HttpException` method to translate a downstream failure into an `HttpException` the gateway's `HttpErrorFilter` (`@app/common`) can serialize. The five fell into two nearly-identical clusters by transport:

- `AuthProxyService`/`InventoryProxyService` proxy over TCP (`ClientProxy.send`, per [0008](0008-dedicated-auth-app-rs256.md)); their downstream RPC errors surface as a plain object with a `status`/`message`/`code`, checked and re-thrown via `extractErrorMessage` (`@app/common`).
- `OrderProxyService`/`ProductProxyService`/`UserProxyService` proxy over HTTP (`HttpService`, per [0005](0005-api-gateway-sole-entry-point.md) and [0007](0007-proxy-user-product-via-http.md)); their downstream failures surface as Axios errors (`isAxiosError`, `response.status`, `response.data.message`), with a three-way split (known status / axios-but-unreachable / not-axios-at-all) baked into each copy.

Within each cluster the `toHttpException` bodies were copy-pasted with only per-service strings (fallback messages, which status codes are trusted) differing — the same shape of duplication `libs/common` already exists to eliminate (see [0001](0001-extract-libs-common.md)). Unifying the two clusters into one class wasn't viable: the error shapes genuinely differ by transport (RPC error object vs. Axios error), so a single flat implementation would need to branch on transport internally, which is worse than keeping the transports apart.

## Decision

Add a three-class template-method hierarchy to `libs/common/src/services/` (`@app/common`):

- `ProxyService` (abstract) — owns the shared shape: `toHttpException(error)` calls an abstract `extractKnownError(error)` hook, and returns that as an `HttpException` if present, otherwise delegates to an abstract `fallbackException(error)` hook.
- `TCPProxyService extends ProxyService` — implements both hooks for the RPC-error shape (status/message extracted via `extractErrorMessage`), leaving `unavailableMessage` (field) and `statusFallbackMessage(status)` (hook) abstract, and `acceptStatus(status)` (hook, default: accept any) overridable — `InventoryProxyService` overrides it to trust only 404, matching its pre-refactor behavior.
- `HttpProxyService extends ProxyService` — implements both hooks for the Axios-error shape, leaving only `serviceName` abstract, from which all three fallback message variants (`"X service error"`, `"X service unavailable"`, `"Unexpected error calling x service"`) are derived.

Each concrete proxy service now extends the matching base class and supplies only its per-service field(s)/hook overrides — no service re-implements `toHttpException` from scratch. Existing behavior (including the `{message}`-wrapping `HttpProxyService.extractKnownError` needs so array-shaped downstream validation-error messages still round-trip through `HttpErrorFilter.getResponse()` correctly) was preserved exactly and is pinned by unit tests for all three base classes plus expanded per-service error-case coverage.

## Consequences

Adding a sixth proxy service (TCP or HTTP) means extending the matching base class and filling in its abstract members — not writing a new `toHttpException`. If a proxy service ever needs a downstream transport this hierarchy doesn't cover (e.g. gRPC), it either gets a third sibling base class following the same `ProxyService` contract, or `ProxyService` itself needs generalizing — this hierarchy doesn't attempt to anticipate that. `extractErrorMessage` (`@app/common`) remains the single source of "how to pull a display message off an unknown error object" and is now consumed only from within `TCPProxyService`, not duplicated per TCP-based proxy service.
