# ADR-012 — REST API with Generated OpenAPI Documentation

Accepted · 14 Aug 2026 · Related: DDR-005, DDR-006

## Context

The API needs a documented contract that a reviewer can explore and a client can build
against.

## Decision

Expose a REST API and generate OpenAPI documentation with `@nestjs/swagger`, served at
`/api/docs`. The documentation is produced from the same decorators used for request
validation.

## Consequences

- Documentation cannot drift from validation, because both come from one source.
- A reviewer can exercise every endpoint from the browser without a separate client.
- REST maps directly onto the resources in this domain, so the routes are predictable.
- Response shapes must be declared for the generated documentation to be useful.

## Rejected

- **GraphQL** — powerful where many clients need different shapes of the same data, but adds
  a query language to learn and is not needed by a single known client.
- **Hand-written API documentation** — drifts from the code the first time an endpoint
  changes.
