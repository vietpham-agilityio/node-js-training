# 0017. Terminate TLS inside api-gateway; helmet security headers on every HTTP app

Status: Accepted
Date: 2026-08-05

## Context

Every HTTP surface in this repo served plain `http://`, and nothing set security response headers — no CSP, no `X-Content-Type-Options`, no `Referrer-Policy`, no HSTS. `api-gateway` is the sole client-facing entry point (ADR 0005), so it owns the one hop that crosses a real network in any deployment.

The prompt that started this was the widely-copied Nest snippet `import * as helmet from 'helmet'; app.use(helmet.hsts())`. Three things are wrong with it here, and they shaped the decision:

1. `import * as helmet` produces a non-callable namespace object under this repo's `esModuleInterop: true` + `module: nodenext`. Helmet 8 is a default export: `import helmet from 'helmet'`. (Same class of stale-docs trap as `CacheModule` moving out of `@nestjs/common` — see ADR 0016.)
2. `helmet.hsts()` alone ships 1 header where bare `helmet()` ships ~12.
3. `Strict-Transport-Security` is ignored by browsers on a plain-HTTP response (RFC 6797 §7.2), so HSTS is inert until TLS exists. Adding HSTS is therefore a decision *about TLS*, not a decision about headers.

For TLS there were two real alternatives: terminate at the edge in a reverse proxy (Caddy/nginx, or an ingress/ALB in a real deploy), or terminate in Node inside `api-gateway`. Edge termination is what production would do — no cert code in the app, no per-app cert management. In-app termination is more code and more friction, but this is a training repo whose stated goal here was to understand the Nest/Node HTTPS wiring first-hand.

## Decision

- **TLS terminates inside `api-gateway`, and only there.** `user`/`product`/`order` stay HTTP: they sit downstream of the gateway and their traffic runs on the Docker bridge network. `inventory`/`auth` are TCP-only and have no HTTP server to secure.
- **TLS is opt-in via env vars, not a code branch.** `loadHttpsOptions()` (`libs/common/src/utils/https-options.util.ts`, exported from `@app/common` next to `decodeBase64Key`) reads `TLS_KEY_PATH`/`TLS_CERT_PATH` and returns `undefined` when either is unset. `NestFactory.create(m, { httpsOptions: undefined })` falls back to `http.createServer`, so cert-less local dev and the e2e suites keep working with a single unconditional call site. A path that *is* set but unreadable throws — silently downgrading to HTTP when TLS was requested is the worse failure.
- **`applySecurityHeaders(app, { httpsEnabled })`** (`libs/common/src/security/security-headers.ts`) wraps one `helmet()` call, registered in all four HTTP apps' `main.ts` before `SwaggerModule.setup` and `VersionManagementMiddleware` so `/api-docs` and `/health` are covered too. Shared helper rather than four copies, same reasoning as `AppLoggerModule` and `AppCacheModule`.
- **CSP stays at helmet's defaults, including a strict `script-src 'self'`.** The plan for this change assumed the well-known "helmet breaks Swagger UI" problem and budgeted a `'unsafe-inline'` widening for it. That turned out to be unnecessary on `@nestjs/swagger` 11, which serves its bootstrap as an external same-origin `swagger-ui-init.js` rather than an inline `<script>`; the page's only inline content is a `<style>` block, and helmet's default `style-src` already allows `'unsafe-inline'`. Verified by loading `/api-docs` in a browser under the strict policy — full render, zero console messages. Widening `script-src` is the one CSP change that meaningfully costs you XSS protection, so it is not made on the basis of a reputation.
- **HSTS is emitted only when `httpsEnabled && NODE_ENV === 'production'`.** HSTS is host-scoped and **ignores the port**: sending it from `https://localhost:3002` pins *every* localhost port for `maxAge`, so `http://localhost:3003/api-docs` and `:3004` would be force-upgraded to HTTPS, fail to connect, and stay broken until cleared by hand via `chrome://net-internals/#hsts`. Gating on production keeps the code written and legible without booby-trapping local dev.
- **Certs are generated locally and gitignored** (`/certs`, self-signed via `openssl`, command documented in `.env.example` alongside the JWT keygen one-liner). Compose bind-mounts `./certs:/app/certs:ro` on `api-gateway` rather than baking them into an image layer; the `Dockerfile` is untouched.

## Consequences

- The gateway's client-facing hop is encrypted, and the security-header baseline now applies to all four HTTP apps rather than none.
- **The `Transport.TCP` legs remain plaintext and this change does not address them.** `httpsOptions` only wraps the Express server; `app.connectMicroservice(...)` runs its own socket server (`user` on 8004, `order` on 8001, `inventory` on 8002, `auth` on 8003) that is unaffected. So roughly half the inter-service traffic — the whole order↔inventory and auth↔user flow — is as unencrypted as before. Securing it would mean TLS options on the TCP transport or a service mesh, neither of which is in scope.
- Self-signed certs mean `curl -k` and browser interstitials for any local HTTPS work. Notably the preview/automation browser cannot accept the interstitial at all, so browser-based checks against the gateway have to run over the HTTP fallback (the CSP is identical either way; only HSTS differs).
- The two Compose paths differ on HSTS, and the gating lands the right way round by accident of ADR 0015's overlay. A plain `docker compose up` merges `docker-compose.override.yml`, which sets `NODE_ENV: development` — TLS on, **HSTS off**, which is exactly what you want against `localhost`. `pnpm docker:prod` (`-f docker-compose.yml`, skipping the override) keeps `NODE_ENV: production` and **HSTS is live**; smoke-test that one with `curl -k`, not a browser, or accept pinning localhost for a year. Both paths serve HTTPS, since `TLS_*` and the `./certs` mount live in the base file.
- Moving to edge termination later is deliberately a small diff: unset `TLS_KEY_PATH`/`TLS_CERT_PATH`, put the proxy in front, and add `app.set('trust proxy', 1)` so `req.protocol`/`req.ip` (and therefore pino-http's logged fields) reflect `X-Forwarded-*`. Nothing else in the app is coupled to TLS.
- Consistent with the JWT keypair (ADR 0008) and Redis (ADR 0016), there is no cert rotation, renewal, or CA story — the cert expires in 365 days and is regenerated by hand.
