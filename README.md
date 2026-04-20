# English Learning Platform — Backend

Express + Node.js RESTful API for an English learning platform with Clerk authentication and Stripe payments. TypeScript, ESM, strict mode.

---

## Requirements

- Node.js `>= 20.0.0`
- pnpm `>= 10.0.0`

---

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Create a `.env` file at the root:

```env
PORT=3000
DATABASE_DIR_PATH=.
DATABASE_FILE_NAME=learning.sqlite

# Clerk
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key
CLERK_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
```

### 3. Run in development

```bash
pnpm dev
```

Server runs at `http://localhost:3000` (or `PORT` env variable).

### 4. Build & run production

```bash
pnpm build
pnpm start
```

---

## Scripts

| Script              | Description                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Run with tsx (no build)          |
| `pnpm dev:watch`    | Run with tsx watch (auto-reload) |
| `pnpm build`        | Compile TypeScript to `dist/`    |
| `pnpm start`        | Run compiled `dist/server.js`    |
| `pnpm test`         | Run Jest test suite              |
| `pnpm format:check` | Prettier check                   |

---

## Authentication

This API uses **Clerk** for identity management. Every protected request must include a valid Clerk JWT in the `Authorization` header.

### Auth flow

```
POST /auth/webhook        → Clerk fires on user.created — syncs user to local DB
GET  /users/me            → requires Authorization: Bearer <token>
```

### Public vs protected routes

| Route                         | Auth required |
| ----------------------------- | ------------- |
| `POST /auth/webhook`          | ❌ (svix sig) |
| `GET  /users/me`              | ✅            |
| `GET  /users/me/courses`      | ✅            |
| `GET  /courses`               | ✅            |
| `GET  /courses/:id`           | ✅            |
| `POST /courses`               | ✅ Admin      |
| `PUT  /courses/:id`           | ✅ Admin      |
| `DELETE /courses/:id`         | ✅ Admin      |
| `POST /payments/checkout`     | ✅            |
| `POST /payments/webhook`      | ❌ (stripe sig)|

### Using the token

Include the Clerk JWT as a Bearer token in the `Authorization` header on every protected request:

```http
Authorization: Bearer <token>
```

If the token is missing, invalid, or expired all protected routes respond with:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "message": "Authentication required. Please provide a valid Bearer token."
}
```

---

## Authorization (roles)

After **authentication**, the API enforces **roles** for write operations on content:

| Role    | Description                                                            |
| ------- | ---------------------------------------------------------------------- |
| `user`  | Default role. Can read courses.                                        |
| `admin` | Can create, update, and delete courses in addition to all user access. |

New accounts synced from Clerk get `role: "user"` by default.

If a non-admin calls a write endpoint the API responds with:

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "message": "Admin role required to perform this action."
}
```

---

## Project structure

### Module structure (each module follows the same pattern)

```
src/modules/<module>/
└── <module>.ts            # Domain interface (input shape + response type) & Repository interface (abstraction)
└── <module>.router.ts     # HTTP layer: root entry
└── <module>.controller.ts # Parse request, validate, respond and call specific service
└── <module>.service.ts    # Use-case orchestration, error mapping
└── <module>.typeorm.ts    # TypeORM implementation
└── <module>.entity.ts     # TypeORM entity (DB columns, relations, hooks)
```

---

### Layer responsibilities

| Layer          | File pattern                              | Responsibility                                                                    |
| -------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| **Entry**      | `*.router.ts`                       | The entry point for every HTTP request.                                           |
| **Controller** | `*.controller.ts`                   | Parses request body/params, validates input with Zod, calls service, returns JSON.|
| **Service**    | `*.service.ts`                      | Implements use cases; validates cross-entity rules; maps errors to `AppError`.    |
| **Repository** | `*.typeorm.ts`                      | Abstracts data access; TypeORM implementation maps entities to domain types.      |
| **Domain**     | `*.entity.ts`                       | Domain shape (interfaces) + TypeORM column/relation decorators.                   |

### Error handling

All errors are funnelled through `AppError` (status + message) and caught by the global `errorHandler` middleware.

```
Route handler → next(new AppError(404, "Course not found"))
                          ↓
              errorHandler middleware
                          ↓
              res.status(404).json({ message: "Course not found" })
```

---

## Development

- **Lint:** ESLint + TypeScript ESLint
- **Format:** Prettier (`pnpm format:check`)
- **Commit:** Husky + lint-staged + Commitlint (conventional commits)
- **Testing:** Jest + Supertest (`pnpm test`)
