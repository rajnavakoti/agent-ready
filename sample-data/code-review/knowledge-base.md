# CodeGuard — Code Review Agent Knowledge Base

## Codebase Overview
TypeScript monorepo (pnpm workspaces) with 3 packages:
- `@app/web` — Next.js 15 frontend (App Router, React Server Components, Tailwind CSS)
- `@app/api` — Node.js API (Hono framework, Drizzle ORM, PostgreSQL)
- `@app/shared` — Shared types, utils, validation schemas (Zod)

## Architecture
- Frontend: Next.js App Router with RSC. Client components marked with `"use client"`. Server Actions for mutations.
- API: Hono on Node.js. Middleware chain: cors → rateLimit → auth → validate → handler.
- Database: PostgreSQL 16 via Drizzle ORM. Migrations in `packages/api/drizzle/`. Migration naming: `NNNN_description.sql`.
- Auth: Custom JWT implementation. Access token (15min) + Refresh token (7 days). Stored in httpOnly cookies.
- Cache: Redis for session store and API response caching. TTL: 5min for list endpoints, 1hr for static content.

## Coding Standards
- **TypeScript**: strict mode, no `any`, no `as` assertions unless documented with `// SAFETY:` comment
- **Imports**: named exports for utilities, default exports for page components. No barrel files.
- **Testing**: Vitest for unit tests, Playwright for E2E. Coverage threshold: 80% (enforced in CI).
- **Formatting**: Biome (replaces ESLint + Prettier). Config in `biome.json`. Auto-fixed on commit via Husky.
- **Commits**: Conventional commits enforced. `feat:`, `fix:`, `chore:`, `test:`, `docs:`.

## Security Policies
- All user input validated with Zod at API boundary. No raw SQL — use Drizzle query builder only.
- Auth middleware: `packages/api/src/middleware/auth.ts`. Checks JWT signature, expiry, and role claims.
- CSRF: Double-submit cookie pattern. Token in `x-csrf-token` header matched against cookie.
- Rate limiting: 100 req/min per IP for public endpoints, 1000 req/min for authenticated.
- File uploads: max 5MB, allowed types: image/jpeg, image/png, application/pdf. Stored in S3 with pre-signed URLs.
- Secrets: never in code. Use environment variables. `.env.example` documents all required vars.

## Known Tech Debt
- Auth middleware has a race condition: if access token expires between middleware check and handler execution, the request fails with 500 instead of 401. Workaround: 30-second grace period added but not tested.
- `@app/shared` package has circular dependency with `@app/api` for 2 validation schemas. Build works but TS language server is slow.
- Database connection pool set to 10. Under load (>50 concurrent requests), pool exhaustion causes 503s. PgBouncer proposed but not implemented.
- E2E tests are flaky on CI — 3 tests fail ~10% of the time due to animation timing. Marked as `test.skip` in CI, run locally only.
