# 0014. Structured logging with nestjs-pino

Status: Accepted
Date: 2026-08-04

## Context

Every app's logging was two hand-rolled pieces in `libs/common`: `LoggingMiddleware` (`console.log` of method/url/timestamp on every request) and `ResponseLoggingInterceptor` (which, besides shaping the `{success, data, timestamp}` response envelope, also `console.log`'d request duration on success and failure). Plain-text `console.log` has no levels, no structure, and nothing to parse — fine for a single local process, but the project's next step is deploying and monitoring these six apps as containers (Docker Compose today, `docs/adr/0012`; Kubernetes attempted and reverted, `docs/adr/0013`). A log aggregator (ELK/Loki/Datadog/CloudWatch, whatever ends up in front of the containers) needs JSON lines, not free-text, to be queryable by field.

Two real alternatives existed: `winston` (widely used, more manual wiring — no first-party Nest integration) and raw `pino` (fast, JSON-native, but no Nest DI integration — every app would hand-roll its own request-scoped child logger and HTTP request/response logging).

## Decision

- Added `nestjs-pino` (+ peer `pino-http`, + dev-only `pino-pretty` for local readability) and wrapped its `LoggerModule.forRoot()` in a single `AppLoggerModule` (`libs/common/src/logger/pino-logger.module.ts`, exported via `@app/common`), rather than each app configuring Pino independently — this is the one piece of `libs/common` wired into *every* app uniformly, unlike the filter/interceptor pair which `order`/`inventory` still don't register.
- `AppLoggerModule` sets `level: 'debug'` outside `NODE_ENV=production` and `'info'` in production, and only attaches the `pino-pretty` transport outside production — `pino-pretty` is a devDependency, pruned from the production Docker image by `pnpm install --prod` (`docs/adr/0012`), and `NODE_ENV=production` is hardcoded in the Dockerfile's runtime stage, so the split is consistent with how the image is actually built.
- Every `main.ts` now calls `NestFactory.create(...)`/`createMicroservice(...)` with `{ bufferLogs: true }`, then immediately `app.useLogger(app.get(Logger))` — this makes Nest's own bootstrap/framework logs (not just request logs) go through Pino, and the buffering avoids losing whatever Nest logs before the swap happens.
- Deleted `LoggingMiddleware` entirely (and its now-unused test) — `pino-http`, wired in automatically by `LoggerModule.forRoot()`, already logs every HTTP request/response (method, url, status, response time) as a structured line. A hand-rolled middleware doing the same thing via `console.log` was pure duplication once Pino was in place.
- Stripped the two `console.log` calls out of `ResponseLoggingInterceptor` — same reasoning, `pino-http`'s auto-logging already covers request timing. The interceptor's remaining job is purely to shape the `{success, data, timestamp}` response envelope; the name is now a bit of a misnomer but wasn't worth a rename+re-wire across 4 apps for this change.
- `order` and `inventory` (which never registered the shared filter/interceptor) got `AppLoggerModule` too, since structured logging isn't tied to the HTTP-response-shaping convention those two opted out of.
- `pino-http`'s default `req` serializer logs the full request, headers included — which meant every RS256 Bearer JWT and any cookie was landing in logs verbatim. Added `redact: { paths: ['req.headers.authorization', 'req.headers.cookie'] }` to `pinoHttp` to censor both before they're ever written, rather than after the fact.

## Consequences

- All six apps now emit JSON logs in production (pretty-printed locally), ready to ship to whatever aggregator ends up watching the containers — no code change needed at that point, just pointing the container runtime's log driver at it.
- A single request spanning multiple TCP hops (`api-gateway` → `order` → `inventory`, or `auth` → `user`) does **not** share a correlation/request ID across those hops today — `pino-http` generates one for the inbound HTTP leg only, and it isn't threaded through `ClientsModule` TCP calls. Tracing a request end-to-end means correlating by timestamp/payload shape, not by ID. Propagating a request ID through the TCP layer is tracked as future work (see CLAUDE.md's "What's next").
- Nest's own internal logs (module init, route mapping, etc.) now go through the same Pino instance as everything else, so local dev output changes shape (structured/pretty-printed via `pino-pretty` instead of Nest's default colorized logger) — this is expected, not a regression.
