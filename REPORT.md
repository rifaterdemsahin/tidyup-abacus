# Project Report — TidyUp Abacus

**Date:** 2026-04-03  
**Repository:** [rifaterdemsahin/tidyup-abacus](https://github.com/rifaterdemsahin/tidyup-abacus)  
**Built with:** Abacus.AI

---

## 1. What Was Built

TidyUp Abacus is a full-stack household management web application. It allows family members to:

- Track **household items** (name, quantity, category, location, photo)
- Manage **locations** in the home (kitchen, garage, etc.)
- Organise items by **categories** with colour coding
- Create and assign **recurring or one-off tasks** (chores)
- Track **task completions** with notes and timestamps
- Log in securely as individual **family members**

---

## 2. Technical Summary

| Concern | Solution |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | PostgreSQL via Prisma ORM |
| Authentication | NextAuth.js (credentials + DB sessions) |
| File storage | AWS S3 (item photos, presigned URLs) |
| UI | Tailwind CSS, Radix UI, shadcn/ui components |
| Charts | Recharts, Plotly.js |
| State | Zustand, Jotai, TanStack Query, SWR |
| Deployment origin | Abacus.AI hosted environment |

---

## 3. Database Schema

```
User            — family members who authenticate
├── Account     — OAuth / credentials provider records
└── Session     — active login sessions

Location        — named places in the home
Category        — item categories with optional colour

Item            — household item
├── belongs to Category
└── belongs to Location

Task            — chore or household task
├── TaskAssignment   — which users are assigned
└── TaskCompletion   — log of completions with timestamps
```

---

## 4. Repository Structure

```
tidyup-abacus/
├── .gitignore
├── README.md          — setup and deployment guide
├── CLAUDE.md          — architecture notes for AI assistants
├── REPORT.md          — this file
└── nextjs_space/      — Next.js application
    ├── app/
    │   ├── api/       — REST API handlers (auth, items, tasks, locations)
    │   ├── dashboard/ — authenticated app pages
    │   └── login/     — authentication pages
    ├── components/    — shared UI components
    ├── hooks/         — custom React hooks
    ├── lib/           — server utilities (auth config, Prisma client, S3)
    ├── prisma/        — schema.prisma + migrations
    ├── public/        — static assets
    └── scripts/       — database seed scripts
```

---

## 5. How to Run

### Local Development

```bash
cd nextjs_space
npm install
# copy .env.example to .env and fill in your values
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random string for signing sessions |
| `NEXTAUTH_URL` | Full URL of the running app |
| `AWS_REGION` | S3 bucket region |
| `AWS_BUCKET_NAME` | S3 bucket name |
| `AWS_FOLDER_PREFIX` | Upload prefix inside the bucket |

---

## 6. Deployment

**GitHub Pages is not suitable** for this app — it requires a Node.js runtime for API routes, server components, database access, and authentication.

### Recommended Platforms

| Platform | Why |
|---|---|
| **Vercel** | Native Next.js support, zero config, Postgres add-on available |
| **Railway** | Simple Next.js + PostgreSQL setup, good free tier |
| **Render** | Docker or Node.js service + managed PostgreSQL |
| **Fly.io** | Docker-based, generous free allowance |

### Steps for Vercel (quickest path)

1. Push this repo to GitHub (done).
2. Go to [vercel.com](https://vercel.com) → Import project → select `tidyup-abacus`.
3. Set root directory to `nextjs_space`.
4. Add all environment variables in the Vercel dashboard.
5. Provision a Postgres database (Vercel Storage or Neon.tech).
6. Deploy.

---

## 7. Known Issues & Next Steps

- `prisma/schema.prisma` has a hardcoded Abacus.AI output path — update `output` to `"../node_modules/.prisma/client"` for portability.
- `.env` contained live Abacus.AI credentials — excluded from git via `.gitignore`.
- No `.env.example` file exists yet — worth adding to document required variables.
- `tsconfig.tsbuildinfo` (312 KB) is excluded from git via `.gitignore`.
