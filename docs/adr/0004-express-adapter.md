# ADR-004 — Express Adapter (NestJS Default) for the HTTP Layer

Accepted · 14 Aug 2026

## Context

NestJS is a framework, not an HTTP server. It runs on an underlying HTTP library through an
adapter, and offers two: Express (the default) and Fastify.

## Decision

Use the default Express adapter. No adapter configuration is needed.

## Consequences

- The largest middleware ecosystem, and virtually all NestJS documentation and community
  answers assume Express.
- Standard packages such as `multer` for file handling work without a Fastify-specific
  equivalent.
- Lower throughput than Fastify on JSON benchmarks — irrelevant at this scale, where no
  performance requirement exists.
- Cheap to change later: switching adapters is a change in `main.ts` plus any
  Express-specific middleware.

## Rejected

- **Fastify adapter** — roughly twice the throughput on JSON workloads, but that is
  performance this system has no need for, and it costs ecosystem breadth and documentation
  alignment. Adding it would be optimising for a problem that does not exist.
