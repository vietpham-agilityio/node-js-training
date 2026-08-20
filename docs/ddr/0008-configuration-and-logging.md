# DDR-008 — Configuration and logging conventions

Accepted · 14 Aug 2026 · Implements ADR-005

## Context

The application needs several values from its environment — database URL, JWT secret, token
lifetimes, seed admin credentials. A missing value found only when that code path first runs
produces a confusing failure long after startup.

Separately, a reviewer or developer needs enough of a trail to understand what happened
during a request.

## Decision

Load environment variables through `@nestjs/config` and validate them against a schema at
startup. The process exits immediately if a required value is missing or malformed.

A global interceptor logs one structured line per request: method, path, status, duration and
user id. Business events — reservation confirmed, reservation cancelled, holds expired by the
sweep — are logged from the service layer.

## Why

- Failing at startup turns a class of confusing runtime errors into one clear message before
  the application accepts traffic.
- One interceptor guarantees consistent request logging and cannot be forgotten on a new
  endpoint.
- Logging business events in services also captures work done by the scheduled jobs, which
  have no request at all.
- Structured lines are greppable and can be shipped somewhere later without changing the call
  sites.

## Rejected

- **Reading `process.env` directly** — missing values surface as `undefined` deep inside
  business logic.
- **Loading config without schema validation** — a typo in a variable name still fails at
  first use.
- **Logging in each controller** — repetitive, inconsistent, and misses the scheduled jobs
  entirely.
- **An external logging platform** — disproportionate for this project; structured output is
  enough.

## Consequences

| Gains                                                                                         | Costs accepted                                                                   |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Misconfiguration produces one clear startup error instead of a confusing failure mid-request. | Logs go to standard output only, so history is lost when the container restarts. |
| Every request and every seat-state change leaves a trail, including automated ones.           | Adding a config value means updating both the schema and `.env.example`.         |

## Follow-up

- Keep `.env.example` exhaustive and in step with the schema, so setup is self-documenting.
- Exclude password, token and secret fields from all log output.

## Revisit if

The system is deployed for sustained use, where log shipping and alerting become worthwhile.
