# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Zekher is a Next.js 15 (App Router) + React 19 AI-powered Holocaust education platform. It uses **Bun** as the package manager (lockfile: `bun.lock`). See `README.md` for the full tech stack and development commands.

### Services

| Service | How to run | Port | Notes |
|---|---|---|---|
| Next.js dev server | `bun dev` | 3000 | Main app; requires PostgreSQL + Redis running first |
| PostgreSQL (16 + pgvector) | `sudo pg_ctlcluster 16 main start` | 5432 | Must have `vector` extension enabled |
| Redis | `sudo redis-server --daemonize yes` | 6379 | Required by env validation (`REDIS_URL`) |

### Key dev commands

Defined in `package.json` — `bun lint`, `bun type-check`, `bun dev`, `bun build`. Database commands: `bun db:generate`, `bun db:push`, `bun db:migrate`.

### Non-obvious caveats

- **`bun db:migrate` may fail** on the `serial` type ALTER. Use `bun db:push` to apply schema changes, or create tables directly via SQL if needed.
- **Env validation** (`lib/shared/env.ts`) requires `DATABASE_URL` and `REDIS_URL` at minimum. Both PostgreSQL and Redis must be running before `bun dev`.
- **AI chat** requires `GOOGLE_GENERATIVE_AI_API_KEY` (or another LLM provider key) plus a `NEXT_PUBLIC_CONVEX_URL` for full Convex-backed chat persistence. Without Convex, the chat still works in a "guest" mode.
- The `.env.local` file must exist with at least `DATABASE_URL` and `REDIS_URL` set. See `.env.local.example` for all optional keys.
- No automated test suite is currently configured in `package.json` (Jest is a devDependency but no `test` script exists).
- Sentry wraps `next.config.ts`; if `SENTRY_AUTH_TOKEN` is missing, build-time source-map upload is silently skipped — this is fine for local dev.
