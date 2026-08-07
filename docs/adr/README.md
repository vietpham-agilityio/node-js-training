# Architecture Decision Records

Lightweight MADR-style ADRs for this repo. Numbered sequentially, never renumbered or deleted — a superseded decision gets a new ADR that says so and points back, the old one's `Status` changes to `Superseded by NNNN`.

## When to write one

Any time a change picks between multiple real alternatives and the choice isn't obvious from reading the code — e.g. where shared code lives, which service owns a cross-cutting concern, what gets deferred vs. built now, a dependency you chose not to add. Small mechanical fixes (typos, obviously-broken code, formatting) don't need one.

## Format

Copy `0000-template.md` to `NNNN-short-title.md` (next sequential number, kebab-case title) and fill it in. Keep it short: Context is what forced the decision, Decision is what was chosen, Consequences is what that costs or unlocks later.

## Index

| ADR | Title |
|-----|-------|
| [0001](0001-extract-libs-common.md) | Extract cross-cutting code into libs/common |
| [0002](0002-shared-order-type-in-libs-constants.md) | Shared Order type lives in libs/constants, not re-exported from apps/order |
| [0003](0003-isolate-consul-to-api-gateway.md) | ~~Isolate Consul registration to api-gateway~~ — superseded by [0011](0011-drop-consul-for-kubernetes-native-discovery.md) |
| [0004](0004-defer-pattern-work-phases.md) | Defer messaging/CQRS/facade/SOLID pattern work to follow-up sessions |
| [0005](0005-api-gateway-sole-entry-point.md) | api-gateway proxies order's full HTTP surface as the sole client-facing entry point |
| [0006](0006-typeorm-persistence-and-split-user-product-apps.md) | Unify on TypeORM+SQLite persistence; split user/product out of nest-js-training into standalone apps |
| [0007](0007-proxy-user-product-via-http.md) | Proxy user/product through api-gateway over HTTP, with gateway-level versioning and Swagger |
| [0008](0008-dedicated-auth-app-rs256.md) | Dedicated auth app issuing RS256 JWTs, verified locally by every guarded app |
| [0009](0009-proxy-service-error-mapping-hierarchy.md) | Shared ProxyService/TCPProxyService/HttpProxyService hierarchy for downstream-error mapping |
| [0010](0010-rbac-role-to-route-mapping.md) | Apply @Roles/RolesGuard to product create (admin), user reads (admin), inventory stock update (merchant) |
| [0011](0011-drop-consul-for-kubernetes-native-discovery.md) | Drop Consul; rely on Kubernetes-native service discovery once the app deploys to K8s |
| [0012](0012-containerize-with-docker-compose.md) | Single parameterized Dockerfile + docker-compose.yml; fixed TCP bind/client hosts and pnpm version for cross-container networking |
| [0013](0013-kubernetes-manifests.md) | ~~Kubernetes manifests: ConfigMap for centralized config, Service DNS for discovery, selective horizontal scaling~~ — reverted, see the ADR's "Reversion" note |
| [0014](0014-nestjs-pino-structured-logging.md) | Structured logging with nestjs-pino, replacing console.log-based LoggingMiddleware/ResponseLoggingInterceptor logging |
| [0015](0015-docker-dev-production-stages.md) | Dockerfile dev/production stages via `--target` + a Compose override file |
| [0016](0016-redis-response-cache-for-user-product.md) | Redis-backed HTTP response cache for user/product reads via a shared AppCacheModule |
| [0017](0017-tls-in-api-gateway-and-helmet-headers.md) | Terminate TLS inside api-gateway; helmet security headers on every HTTP app |
| [0018](0018-drop-response-interceptor-from-product-user.md) | Drop ResponseLoggingInterceptor from product/user, keep it gateway-only to fix double-wrapped proxy responses |
