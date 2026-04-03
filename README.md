# TidyUp Abacus

A home management app built with Next.js for tracking household inventory, tasks, and locations. Built on [Abacus.AI](https://abacus.ai).

## Features

- **Inventory management** — track items by category and location
- **Task management** — recurring and one-off household tasks with assignments
- **Family members** — assign tasks to users
- **Authentication** — secure login via NextAuth
- **File uploads** — item photos stored in AWS S3
- **Dashboard** — overview of inventory and tasks

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | NextAuth.js |
| Storage | AWS S3 |
| Styling | Tailwind CSS + Radix UI |
| Charts | Recharts / Plotly |

## Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for item photos)

## Local Setup

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd tidyup-abacus/nextjs_space
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables** — copy `.env.example` to `.env` and fill in:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   NEXTAUTH_SECRET="your-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   AWS_REGION="us-east-1"
   AWS_BUCKET_NAME="your-bucket"
   AWS_FOLDER_PREFIX="uploads/"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Seed the database (optional)**
   ```bash
   npm run prisma:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Production Deployment

This app requires a **Node.js server** — it cannot be hosted on static-only platforms. Recommended options:

- **Vercel** (easiest — native Next.js support)
- **Railway / Render** (includes managed PostgreSQL)
- **Docker** on any VPS / cloud VM

See [CLAUDE.md](CLAUDE.md) for architecture details.
