---
name: nest-microservice-module
description: Scaffold a new NestJS resource (module + controller + service + DTO) inside an app in this monorepo, pre-wired to the project's own conventions (@app/common filter/interceptor, @app/constants event names, HTTP and/or TCP transport). Use when adding a new resource/module to apps/order, apps/inventory, apps/nest-js-training, apps/api-gateway, or a new app.
---

# NestJS module scaffolder for this monorepo

Read `CLAUDE.md` at the repo root first — it documents the current port map, the `@app/common` / `@app/constants` conventions, and known limitations. This skill scaffolds *new* resources that follow those conventions; it does not re-derive them from scratch.

## Before generating anything, determine three things

Ask the user (or infer from their request) if not already clear:

1. **Target app** — an existing app under `apps/<name>` (must already be registered in `nest-cli.json`), or a brand-new app (if new, also register it in `nest-cli.json` with a `tsconfig.app.json`, following the shape of `apps/order`).
2. **Resource name** — singular, kebab-case for filenames, PascalCase for classes (e.g. `payment` → `PaymentController`, `payment.controller.ts`).
3. **Transport style**:
   - **HTTP only** — a `@Controller()` with REST routes (mirror `apps/order/src/order.controller.ts`).
   - **TCP only** — `@MessagePattern`/`@EventPattern` handlers, no HTTP routes (mirror `apps/inventory/src/inventory.controller.ts`).
   - **Both** — HTTP routes plus TCP event handlers in the same controller (mirror `apps/order/src/order.controller.ts`, which does both).

Do not generate a TypeORM entity unless the target app already uses TypeORM (currently only `apps/nest-js-training` does). For apps without persistence, use a plain in-memory array in the service, matching `apps/order`/`apps/inventory`.

## Files to generate

For a resource named `<name>` in `apps/<app>/src/`:

- `<name>.dto.ts` — `Create<Name>DTO` with `class-validator` decorators + `@ApiProperty` (mirror `apps/order/src/order.dto.ts`), and `Update<Name>DTO extends PartialType(Create<Name>DTO)`.
- `<name>.entity.ts` (or reuse an existing shared shape from `@app/constants` if one already models this resource — don't duplicate a type that belongs in `libs/constants`).
- `<name>.service.ts` — plain injectable class, in-memory store unless the app has TypeORM.
- `<name>.controller.ts` — per the chosen transport style:
  - HTTP routes: `ValidationPipe` on `@Body()` params, `ParseIntPipe` on numeric `@Param()`, Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) if the app already uses Swagger (check its `main.ts` for `SwaggerModule.setup`).
  - TCP: `@MessagePattern`/`@EventPattern` using event name constants from `@app/constants` — add new event names to `libs/constants/src/constants.events.ts` rather than inlining string literals in the controller.
- `<name>.module.ts` — if this app's HTTP entry point doesn't already register `HttpErrorFilter`/`ResponseLoggingInterceptor` globally (check its `app.module.ts`/`<app>.module.ts` for `APP_FILTER`/`APP_INTERCEPTOR` providers), register them in the new module the same way `apps/nest-js-training/src/module/app/app.module.ts` does, importing from `@app/common`. If the app already registers them globally, don't duplicate.
- Register the new module in the app's root module (`imports: [...]`).

## After generating

1. Run `npx nest build --all` (not `pnpm build` / `nest build` alone — those only build the default project in this monorepo) and confirm no errors.
2. Run `pnpm test <path-to-new-spec-if-any>` if you also wrote tests.
3. Confirm no new file imports another app's `src/` directly — anything genuinely shared belongs in `libs/common` or `libs/constants`, exposed via the `@app/*` alias (see CLAUDE.md's "apps never import another app's src/" rule).
