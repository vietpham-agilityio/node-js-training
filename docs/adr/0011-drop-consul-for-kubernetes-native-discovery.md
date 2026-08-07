# 0011. Drop Consul; rely on Kubernetes-native service discovery

Status: Accepted
Date: 2026-08-03

## Context

ADR 0003 scoped Consul registration to `api-gateway`'s own `ConsulService` (self-register as `api-gateway` on `localhost:8500`). That class was actually deleted from the codebase in a later commit (`6d9e727`, "implement api-gateway pattern on application") without anyone updating ADR 0003 or `CLAUDE.md` to match — both kept describing live Consul registration for a class that no longer existed anywhere in `apps/`. The `consul` npm package remained as an unused dependency in the root `package.json`.

Separately, the plan going forward is to deploy each app as its own Kubernetes workload. Kubernetes Services + cluster DNS (`<service-name>.<namespace>.svc.cluster.local`) already provide registration, health-aware routing, and load-balancing across replicas — the same job Consul was doing. Running both would mean two service registries answering the same question.

## Decision

Formally drop Consul rather than resurrect `ConsulService`: removed the dead `consul` dependency from `package.json`. No code changes were needed in `apps/api-gateway` since the registration class was already gone. Service discovery going forward is Kubernetes-native — each app's `ClientsModule.register(...)` TCP client options (currently hardcoded `localhost`/literal ports, see `CLAUDE.md`'s "Known, intentional limitations") will need to move to K8s Service DNS names as part of the Kubernetes migration work, not Consul lookups.

## Consequences

- No Consul agent dependency for local dev or deployment; `api-gateway`'s health check (`GET /health` via `TerminusModule`) stays as-is but is no longer wired to any external registration/deregistration lifecycle.
- The hardcoded TCP host/port literals in each app's `ClientsModule.register(...)` (`order`, `inventory`, `auth`, `user`, `product`, `api-gateway`) are the next thing that has to change — they need to become K8s Service names once Dockerfiles/manifests exist. Not done in this pass.
- If a future need arises that Kubernetes doesn't cover natively (multi-cluster discovery, a service mesh), that's a new decision, not a revival of this one.
