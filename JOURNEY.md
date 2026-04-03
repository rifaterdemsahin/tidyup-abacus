# From Abacus.AI to Fly.io — What Changed and How It Works

## Starting Point

The app was built on **Abacus.AI**, a platform that hosts full-stack apps in a managed environment.
When exported, the project came as a `nextjs_space/` folder with:

- Next.js 14 source code (App Router, TypeScript)
- A `prisma/schema.prisma` pointing to an Abacus.AI-hosted PostgreSQL database
- An `.env` file with live Abacus.AI credentials (database URL, AWS S3 bucket, NextAuth secret)
- No `Dockerfile`, no `fly.toml`, no `.gitignore`, and a near-empty `README.md`

The goal: take that raw export and make it run on **Fly.io** with secrets managed in **Doppler**.

---

## What the App Does

TidyUp is a household management app with:

| Feature | Description |
|---|---|
| Inventory | Track items by category and location, with optional photos |
| Tasks | Recurring or one-off chores, assigned to family members |
| Locations | Named places in the home (Kitchen, Garage, etc.) |
| Family | Multiple user accounts with role-based access |
| Auth | Login/signup via NextAuth.js (credentials-based) |
| Storage | Item photos uploaded to S3-compatible storage |

---

## Problem 1 — The Abacus.AI Config Doesn't Travel Well

### What Abacus.AI sets up for you (invisibly)
- A managed PostgreSQL database at their hosted endpoint
- An AWS S3 bucket under their account
- A Linux server at `/home/ubuntu/petersfield_tidy_app/`
- Environment variables injected at runtime
- A Node.js process manager that runs `next start`

### What you get when you export
Just the source files. No server. No database. No secrets management.
The `.env` file has credentials that only work inside Abacus.AI's network.

---

## Changes Made — File by File

### 1. `prisma/schema.prisma` — hardcoded path removed

**Before (Abacus.AI original):**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "/home/ubuntu/petersfield_tidy_app/nextjs_space/node_modules/.prisma/client"
}
```

**After:**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}
```

**Why:** The hardcoded absolute path only exists on Abacus.AI's server.
In Docker (or any other machine), that path doesn't exist, so `prisma generate` would write
the client to a location that can never be found at runtime. Switching to a relative path
makes it portable.

---

### 2. `next.config.js` — removed `outputFileTracingRoot`

**Before (Abacus.AI original):**
```js
experimental: {
  outputFileTracingRoot: path.join(__dirname, '../'),
},
```

**After:**
```js
experimental: {},
```

**Why:** This was the root cause of the most painful bug in the deployment.

`outputFileTracingRoot` tells Next.js where to start tracing files when building
the standalone output. On Abacus.AI, `__dirname` resolved to
`/home/ubuntu/petersfield_tidy_app/nextjs_space/` and `../` resolved to
`/home/ubuntu/petersfield_tidy_app/` — the project parent, used for monorepo setups.

In Docker, `__dirname` resolves to `/app/` and `path.join(__dirname, '../')` resolves to `/`
— the **root of the Linux filesystem**.

This caused Next.js to trace and include the entire Linux filesystem (`/etc/`, `/usr/`, etc.)
in the standalone output. More critically, it changed the standalone output structure:
instead of placing `server.js` at `.next/standalone/server.js`, it placed it at
`.next/standalone/app/server.js` (because the project lives at `/app/` relative to root `/`).

The container started with `node server.js` which looked for `/app/server.js` — not there.
Removing the option restored the standard standalone output structure.

Also added:
```js
output: process.env.NEXT_OUTPUT_MODE || 'standalone',
```
To default to standalone mode (required for Docker) when the env var is not set.

---

### 3. `Dockerfile` — created from scratch

Abacus.AI doesn't use Docker — it runs the app directly. A multi-stage Dockerfile was created:

```
Stage 1 (deps)     → install all npm packages with yarn
Stage 2 (builder)  → prisma generate + next build → produces .next/standalone/
Stage 3 (runner)   → copy only what's needed to run: standalone output + prisma CLI + static assets
```

**Key decisions:**

- **Alpine Linux base** (`node:20-alpine`) — small image, fast cold starts on Fly.io
- **Non-root user** (`nextjs:nodejs`) — security best practice
- **Prisma in runner** — the runner stage copies `node_modules/.prisma`, `node_modules/@prisma`,
  `node_modules/prisma`, and the entire `node_modules/.bin/` directory.
  The full `.bin/` copy was required because `prisma` CLI depends on WASM sidecar files
  (`prisma_schema_build_bg.wasm`) that live next to the binary — copying just the JS entry
  file wasn't enough.

---

### 4. `start.sh` — created to run migrations before boot

```sh
#!/bin/sh
set -e
echo "Running database migrations..."
npx prisma db push --skip-generate --accept-data-loss
echo "Starting server..."
exec node server.js
```

**Why:** The app has no Prisma migration files (Abacus.AI used `prisma db push` directly).
Running `db push` at container start ensures the database schema is always in sync with the
Prisma schema, even after a redeploy with schema changes.

`exec` replaces the shell process with Node, so the container's PID 1 is the actual server
(important for signal handling and graceful shutdown on Fly.io).

---

### 5. `fly.toml` — created for Fly.io

```toml
app = 'tidyup-abacus'
primary_region = 'lhr'

[build]
  dockerfile = "Dockerfile"

[deploy]
  release_command = "npx prisma db push --skip-generate --accept-data-loss"

[http_service]
  internal_port = 3000
  force_https   = true

[[vm]]
  memory = '1gb'
```

**Key settings:**

- `release_command` — runs `prisma db push` once before new machines are started, as a
  Fly-managed migration step (separate from the per-container `start.sh` run)
- `1gb` RAM — Next.js + Prisma build needs headroom; 256 MB would OOM during build
- `force_https = true` — redirects all HTTP traffic to HTTPS automatically

---

### 6. `.gitignore` — created

The exported project had no `.gitignore`. The `.env` file contained live database credentials,
AWS keys, and a NextAuth secret. Without a `.gitignore`, the next `git add .` would have
committed all of them to GitHub.

Added exclusions for:
- `nextjs_space/.env` and `.env.local`
- `nextjs_space/node_modules/`
- `nextjs_space/.next/` (build output)
- `.DS_Store`
- Doppler token file

---

### 7. `.env.example` — created

Documents what secrets the app needs, with placeholder values.
Serves as onboarding for anyone cloning the repo.

---

### 8. `.doppler.yaml` — created

```yaml
setup:
  project: tidyup-abacus
  config: prd
```

Points the Doppler CLI at the right project and environment.
Allows `doppler run -- yarn dev` locally once set up.

---

## Infrastructure Provisioned by `fly launch`

Running `fly launch` detected the Next.js project and automatically offered to provision:

| Resource | What was created | Notes |
|---|---|---|
| Fly app | `tidyup-abacus` | Region: London (lhr) |
| Fly Postgres | `tidyup-abacus-db` cluster | Internal hostname: `tidyup-abacus-db.flycast:5432` |
| Tigris S3 bucket | `billowing-sound-420` | Endpoint: `https://fly.storage.tigris.dev` |

Fly injected the credentials for these directly into the app as secrets:
`DATABASE_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`.

This replaced the Abacus.AI database and S3 bucket — the app no longer depends on
any Abacus.AI infrastructure.

---

## Doppler — What It Stores

All secrets live in Doppler under project `tidyup-abacus`, config `prd`:

| Secret | Purpose |
|---|---|
| `DATABASE_URL` | Fly Postgres connection string |
| `NEXTAUTH_SECRET` | JWT signing key for user sessions |
| `NEXTAUTH_URL` | `https://tidyup-abacus.fly.dev` |
| `AWS_ACCESS_KEY_ID` | Tigris S3 access key |
| `AWS_SECRET_ACCESS_KEY` | Tigris S3 secret key |
| `AWS_ENDPOINT_URL_S3` | `https://fly.storage.tigris.dev` |
| `AWS_BUCKET_NAME` | `billowing-sound-420` |
| `AWS_FOLDER_PREFIX` | `tidyup/` |
| `AWS_REGION` | `auto` |
| `NODE_ENV` | `production` |

Secrets are set directly on the Fly app with `fly secrets set`.
Doppler acts as the single source of truth — to rotate a secret, update it in Doppler
and re-push to Fly.

---

## Bugs Encountered and Fixed

### Bug 1 — Prisma WASM missing at runtime
**Symptom:** `ENOENT: no such file or directory, open '/app/node_modules/.bin/prisma_schema_build_bg.wasm'`

**Cause:** The Dockerfile copied only `node_modules/.bin/prisma` (the JS entry file).
The Prisma CLI bundles WASM sidecars as separate files in the same `.bin/` directory.

**Fix:** Copy the entire `node_modules/.bin/` directory instead of just the `prisma` binary.

---

### Bug 2 — `server.js` not found at startup
**Symptom:** `Error: Cannot find module '/app/server.js'`

**Cause:** `outputFileTracingRoot: path.join(__dirname, '../')` resolved to `/` in Docker,
causing Next.js to nest the standalone output under `app/server.js` instead of `server.js`.

**Fix:** Removed `outputFileTracingRoot` from `next.config.js`.

---

### Bug 3 — Stale Docker layer cache
**Symptom:** Bug 2 persisted after the `schema.prisma` fix because Docker Depot reused
the cached builder layer from before the fix.

**Fix:** `fly deploy --no-cache` to force a full rebuild from scratch.

---

## Final State

```
https://tidyup-abacus.fly.dev   →  HTTP 307  →  /login  →  HTTP 200
```

- 2 machines running in London (lhr), 1 GB RAM each
- Fly Postgres database, synced via `prisma db push` on every deploy
- Tigris S3 bucket for item photo uploads
- All secrets in Doppler, mirrored to Fly
- GitHub repo: https://github.com/rifaterdemsahin/tidyup-abacus
