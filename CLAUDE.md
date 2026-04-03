# CLAUDE.md — TidyUp Abacus

## Project Overview

A household management Next.js app. Users can manage home inventory (items, locations, categories), recurring tasks, and family member assignments.

## Repository Layout

```
tidyup-abacus/
└── nextjs_space/          # The Next.js application
    ├── app/               # App Router pages & API routes
    │   ├── api/           # Server-side API handlers
    │   ├── dashboard/     # Authenticated dashboard (inventory, tasks, family, locations)
    │   └── login/         # Auth pages
    ├── components/        # Shared React components (Radix UI + custom)
    ├── hooks/             # Custom React hooks
    ├── lib/               # Server utilities (auth, db, S3 helpers)
    ├── prisma/            # Database schema and migrations
    ├── public/            # Static assets
    └── scripts/           # DB seed scripts
```

## Key Architecture Decisions

- **Next.js App Router** — server components used for data fetching; client components for interactivity.
- **Prisma + PostgreSQL** — all domain data (Items, Tasks, Locations, Categories, Users) lives in Postgres.
- **NextAuth** — credentials-based auth; sessions stored in the database via `@next-auth/prisma-adapter`.
- **AWS S3** — item photos uploaded server-side; presigned URLs returned to the client.

## Data Models (Prisma)

- `User` — family members who can log in
- `Item` — household item with category, location, quantity, optional photo
- `Location` — named places in the house (e.g. "Kitchen", "Garage")
- `Category` — item categories with colour coding
- `Task` — chore/task with recurrence, status, optional location
- `TaskAssignment` — links tasks to users
- `TaskCompletion` — log of when a task was completed by whom

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for signing JWT sessions |
| `NEXTAUTH_URL` | Full URL of the running app |
| `AWS_REGION` | S3 region |
| `AWS_BUCKET_NAME` | S3 bucket for item photos |
| `AWS_FOLDER_PREFIX` | Prefix/folder inside the bucket |
| `AWS_PROFILE` | (optional) AWS credentials profile for local dev |

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Database migrations
npx prisma migrate deploy
npx prisma generate

# Seed
npm run prisma:seed

# Lint
npm run lint
```

## GitHub Pages — Why It Won't Work

GitHub Pages serves **static files only**. This app cannot be deployed there because:

1. It has **API routes** (`app/api/`) that run Node.js server code.
2. It uses **server components** that fetch from the database at request time.
3. It requires a live **PostgreSQL** connection.
4. **NextAuth** session management requires a running server.
5. **AWS S3 presigned URL generation** is server-side.

### Recommended Deployment Targets

| Platform | Notes |
|---|---|
| **Vercel** | Easiest — zero-config Next.js, add a Postgres add-on |
| **Railway** | One-click Next.js + PostgreSQL, good free tier |
| **Render** | Similar to Railway, supports Docker |
| **Fly.io** | Docker-based, generous free allowance |
| **Self-hosted VPS** | Run with `npm run build && npm start` behind nginx |

## Notes for AI Assistants

- Do not suggest converting this to a static export (`output: 'export'`) — the app depends on server-side features that are incompatible with static export.
- The `.env` file contains real credentials from Abacus.AI hosting — never commit it; add it to `.gitignore`.
- The Prisma `output` path in `schema.prisma` is hardcoded to an Abacus.AI path — update it for local development.
