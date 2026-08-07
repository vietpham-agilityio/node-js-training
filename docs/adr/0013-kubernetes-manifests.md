# 0013. Kubernetes manifests: ConfigMap + Service DNS + selective horizontal scaling

Status: Reverted 2026-08-04 — see "Reversion" below
Date: 2026-08-03

## Context

ADR 0011 decided Kubernetes-native service discovery over Consul; ADR 0012 got Docker images
built and proved cross-container networking works via Docker Compose. This is the actual K8s
step: manifests, applied and smoke-tested against a real cluster (Docker Desktop's built-in
Kubernetes, `Mode: kind`).

Three things from the original ask needed a concrete design, not just a direction:

1. **Centralized config management** — Compose's answer was a copy-pasted `environment:` block
   per service. Kubernetes has a first-class primitive for exactly this.
2. **Service discovery** — already decided (ADR 0011): K8s `Service` + cluster DNS.
3. **Horizontal scaling** — not every app can actually do this today. `order`, `inventory`,
   `user`, `product` each own a SQLite file on disk; more than one replica means more than one
   pod contending for the same file, which doesn't work regardless of orchestrator.

## Decision

- **`ConfigMap` (`app-config`)**, one object, referenced by every Deployment via `envFrom`. Same
  effect as Compose's per-service `environment:`, defined once. Kept the exact same variable
  *names* and *values* (`INVENTORY_SERVICE_HOST: inventory`, etc.) that Compose used, since a
  Kubernetes `Service` named `inventory` in the same namespace resolves via cluster DNS exactly
  like Compose's own service-name DNS did — zero app code changes needed beyond what ADR 0012
  already made (env-var-driven TCP client hosts, `0.0.0.0` TCP server binds).
- **`Secret` (`jwt-keys`)**, created imperatively from the existing `.env` (`kubectl create
  secret generic jwt-keys --from-env-file=<extracted two lines>`), never committed as YAML —
  same non-committed posture `.env` already has, just moved into the cluster's own secret store
  instead of a mounted file.
- **Replica counts reflect actual constraints, not a uniform default**: `order`/`inventory`/
  `user`/`product` stay at `replicas: 1` (each has a `PersistentVolumeClaim` for its SQLite
  file); `auth` and `api-gateway` are stateless and run 2 replicas. `api-gateway` additionally
  gets a `HorizontalPodAutoscaler` (2–5 replicas, target 70% CPU) as the concrete answer to
  "horizontal scaling" — proven live via manual `kubectl scale deployment/api-gateway
  --replicas=4` (pods came up, service kept routing) rather than left as an unverified manifest.
- One `Dockerfile` (ADR 0012) still builds every image; no per-app Dockerfile needed here either.
  `imagePullPolicy: IfNotPresent` + locally-built `nodejs-training-<app>:local` tags work with no
  registry, because Docker Desktop's Kubernetes shares the Docker Engine's image store even in
  its `kind`-backed mode — confirmed by deploying without ever pushing anywhere.
- `api-gateway`'s `Service` is `type: LoadBalancer`. On this cluster's `kind` backend the
  `EXTERNAL-IP` stayed `<pending>` (no load-balancer controller installed) — `kubectl
  port-forward` was used for the smoke test instead, documented in `k8s/README.md` as the
  fallback. Left as `LoadBalancer` rather than downgrading to `NodePort`, since a cloud cluster
  (the eventual real target) provisions one automatically; this is a local-cluster gap, not a
  manifest bug.

## Consequences

- `kubectl get hpa` shows `cpu: <unknown>/70%` until `metrics-server` is installed in-cluster —
  documented in `k8s/README.md` with the exact patch command Docker Desktop's kind cluster needs
  (`--kubelet-insecure-tls`). The HPA object is real and functional once that's in place; it's
  just inert without it today.
- Verified live end-to-end against the actual cluster: `kubectl apply -k k8s/` → all 8 pods
  `Running`/`1/1` → registered a user and hit RBAC 403s through `api-gateway` → `POST /orders`
  round-tripped `order` → `inventory` → `order` purely over Kubernetes Service DNS, ending in
  `status: Completed` — same event flow ADR 0012 verified under Compose, now proven under K8s
  too.
- Making `order`/`inventory`/`user`/`product` genuinely horizontally scalable still requires
  moving off a per-pod SQLite file (a real database + `ReadWriteMany` or managed service) — not
  attempted here, tracked in `CLAUDE.md`'s "What's next".

## Reversion

The manifests worked (verified live, see Consequences above), but after a first hands-on
deploy the project decided Docker Compose is the more convenient day-to-day workflow for now,
and stepped back from Kubernetes. The `k8s/` directory (all manifests + its own `README.md`)
was removed on 2026-08-04. Per this ADR log's own convention, this record is kept rather than
deleted — if K8s deployment is picked back up later, the design decisions above (ConfigMap,
`jwt-keys` Secret, per-app replica pinning, `api-gateway`'s HPA) are still the validated
starting point.
