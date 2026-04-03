# How This Project Was Built — Tools, Methods & MCP

**Project:** TidyUp Abacus — Household Management App  
**Date:** 2026-04-03  
**Agent:** Claude Code (claude-sonnet-4-6) running in CLI mode

---

## What Was Accomplished

| # | Task | Result |
|---|---|---|
| 1 | Explored the Abacus.AI export | Understood the full app structure |
| 2 | Created README.md, CLAUDE.md, REPORT.md | Documentation added |
| 3 | Created Dockerfile, fly.toml, .env.example | Deployment config added |
| 4 | Set up Doppler project with all secrets | `tidyup-abacus` / `prd` config |
| 5 | Deployed to Fly.io | Live at https://tidyup-abacus.fly.dev |
| 6 | Debugged 3 blocking issues | All resolved, app running |
| 7 | Created user account (Erdem) | Login working |
| 8 | Seeded locations and categories | 8 locations, 16 categories |
| 9 | Created JOURNEY.md, COST_ESTIMATE.md | Full documentation |
| 10 | Committed and pushed everything | GitHub repo up to date |

---

## Tools Used

### 1. `Read` — Reading Files

Used to inspect every file in the project before touching it.

```
Read /Users/.../nextjs_space/next.config.js
Read /Users/.../nextjs_space/prisma/schema.prisma
Read /Users/.../nextjs_space/package.json
Read /Users/.../nextjs_space/.env
```

**Why:** Claude Code never modifies a file it hasn't read first.
Reading gives full context — structure, existing values, potential conflicts —
before any edit is made. This prevented accidentally overwriting config that
was intentional (e.g. the `typescript.ignoreBuildErrors` flag).

---

### 2. `Write` — Creating New Files

Used to create files that didn't exist yet:

```
Write README.md           — project overview and setup guide
Write CLAUDE.md           — architecture notes for AI assistants
Write REPORT.md           — full project report
Write DEPLOY.md           — deployment progress tracker
Write JOURNEY.md          — explanation of every change made
Write COST_ESTIMATE.md    — Fly.io cost breakdown
Write TOOLS_AND_METHODS.md — this file
Write Dockerfile          — multi-stage Docker build
Write fly.toml            — Fly.io app configuration
Write start.sh            — container startup script
Write .env.example        — documents required secrets
Write .doppler.yaml       — Doppler CLI project pointer
Write .gitignore          — protects credentials from git
```

**Why:** `Write` creates a file from scratch with full content.
Used only for new files — existing files were always edited with `Edit` instead.

---

### 3. `Edit` — Modifying Existing Files

Used for surgical changes to files that already existed:

```
Edit next.config.js       — changed output mode + removed outputFileTracingRoot
Edit prisma/schema.prisma — fixed hardcoded Abacus.AI output path
Edit fly.toml             — added dockerfile reference + release_command
Edit start.sh             — added/removed debug lines during troubleshooting
Edit .gitignore           — added Doppler token exclusion
Edit DEPLOY.md            — updated checklist as steps completed
Edit README.md            — added live app link
```

**Why:** `Edit` sends only the diff (old string → new string) rather than
rewriting the entire file. This is faster, safer, and makes the change
reviewable. Claude Code requires a file to be read before it can be edited —
this enforces understanding before modification.

---

### 4. `Bash` — Running Shell Commands

The primary tool for interacting with external services and the filesystem.
Every deployment step, secret management operation, and database query
ran through `Bash`.

**Git operations:**
```bash
git status
git add <files>
git commit -m "..."
git push origin main
git pull --rebase origin main   # resolved a remote conflict
```

**Fly.io CLI (`flyctl`):**
```bash
fly auth whoami                            # confirmed login
fly apps list                              # checked existing apps
fly launch --name tidyup-abacus ...        # created app + provisioned Postgres + Tigris
fly deploy --app tidyup-abacus             # built Docker image and deployed
fly deploy --app tidyup-abacus --no-cache  # forced full rebuild
fly logs --app tidyup-abacus --no-tail     # read container logs
fly status --app tidyup-abacus             # checked machine health
fly machine restart <id>                   # restarted crashed machines
fly secrets set KEY=VALUE                  # set secrets on the app
fly secrets list                           # verified staged secrets
fly machine list                           # inspected machine specs
fly postgres connect -a tidyup-abacus-db -d tidyup_abacus  # psql session
```

**Doppler CLI:**
```bash
doppler whoami                             # confirmed login
doppler projects                           # listed existing projects
doppler projects create tidyup-abacus      # created new project
doppler configs --project tidyup-abacus    # listed available configs
doppler secrets set KEY=VALUE ...          # added secrets
doppler secrets --project ... --config prd # verified all secrets
```

**Node.js (local):**
```bash
node -e "require('bcryptjs').hash('YYmm123!', 10).then(h => console.log(h))"
# Generated bcrypt hash of the password before inserting into DB
```

**curl (health check):**
```bash
curl -s -o /dev/null -w "HTTP %{http_code}" https://tidyup-abacus.fly.dev/
curl -sL -o /dev/null -w "Final HTTP %{http_code} at %{url_effective}" ...
# Confirmed the app was serving HTTP 200 after deploy
```

---

### 5. `Grep` — Searching File Contents

Used to quickly find specific patterns across the codebase without reading
every file manually:

```
Grep "AWS_BUCKET_NAME"    # found where the env var was consumed
Grep "createS3Client"     # located the S3 client factory
Grep "DATABASE_URL"       # traced where the DB connection was configured
```

**Why:** Faster than reading entire files when you only need to know
where a specific variable or function is used.

---

### 6. `Glob` — Finding Files by Pattern

Used to discover the project structure quickly:

```
Glob nextjs_space/**/*.ts    # all TypeScript files
Glob nextjs_space/app/**     # all app router pages
Glob nextjs_space/lib/**     # all server utilities
```

**Why:** Gives a map of the project before diving into individual files.
Faster than `ls` and works recursively with pattern matching.

---

## MCP — Model Context Protocol

### What MCP Is

MCP (Model Context Protocol) is Anthropic's open standard that allows Claude
to connect to **external tools and services** beyond the built-in tools above.
It works like a plugin system — MCP servers expose capabilities
(tools, resources, prompts) that Claude can call just like native tools.

In this session, several MCP servers were available but not needed
because the CLI tools (flyctl, doppler, psql) were accessible directly
via `Bash`. MCP becomes essential when:

- The service has no CLI (e.g. Notion, Google Calendar, Canva)
- Authentication requires OAuth that only MCP can handle
- You want structured data back rather than raw terminal output

### MCP Servers Available in This Session

The following MCP servers were loaded (visible in system-reminder):

| MCP Server | What It Provides |
|---|---|
| `mcp__claude_ai_Canva` | Create and edit Canva designs |
| `mcp__claude_ai_Gmail` | Read and send Gmail |
| `mcp__claude_ai_Google_Calendar` | Read and create calendar events |
| `mcp__claude_ai_Notion` | Read and write Notion pages/databases |

These were **not used** in this project because the tasks (deployment,
database setup, file management) were all achievable through the CLI.

### When MCP Would Have Been Used

If the project needed:
- **Notion** — writing a project brief to a Notion workspace
- **Gmail** — sending a "your app is live" email to the client
- **Google Calendar** — scheduling a deployment review meeting
- **Canva** — generating a logo or cover image for the README

### How MCP Tools Work (vs CLI Tools)

| Aspect | CLI via `Bash` | MCP Tool |
|---|---|---|
| Auth | Uses local credentials (~/.fly, ~/.doppler) | Handled by MCP server (OAuth / token) |
| Output | Raw terminal text | Structured JSON |
| Reliability | Depends on CLI being installed | Works anywhere Claude runs |
| Use case | DevOps, file system, databases | SaaS apps without CLIs |

---

## How the Deployment Was Reasoned Through

### Problem → Diagnosis → Fix loop

Every bug was solved the same way:

1. **Read the error** in `fly logs`
2. **Trace the root cause** by reading the relevant source file
3. **Make a minimal targeted fix** with `Edit` or `Write`
4. **Commit and redeploy** with `Bash`
5. **Verify** with `curl` or `fly logs`

Example — the `outputFileTracingRoot` bug:

```
Error: Cannot find module '/app/server.js'
  → Read next.config.js
  → Saw outputFileTracingRoot: path.join(__dirname, '../')
  → Reasoned: in Docker __dirname = /app, so ../  = /
  → Next.js places server.js at app/server.js not server.js
  → Edit next.config.js: remove outputFileTracingRoot
  → fly deploy --no-cache
  → curl → HTTP 200 ✓
```

---

## Full Sequence of Events

```
1.  Read project files          Bash ls, Read files
2.  Write docs                  Write README.md, CLAUDE.md, REPORT.md
3.  Write deploy config         Write Dockerfile, fly.toml, .env.example
4.  Fix schema.prisma path      Edit prisma/schema.prisma
5.  Create Doppler project      Bash doppler projects create
6.  Load secrets into Doppler   Bash doppler secrets set ...
7.  Run fly launch              Bash fly launch  →  Postgres + Tigris auto-provisioned
8.  Set missing Fly secrets     Bash fly secrets set NEXTAUTH_* AWS_BUCKET_NAME
9.  Fix next.config.js          Edit next.config.js (standalone output)
10. Write start.sh              Write start.sh (prisma db push + node server.js)
11. Update fly.toml             Edit fly.toml (release_command + dockerfile)
12. First deploy                Bash fly deploy  →  FAIL: prisma WASM missing
13. Fix Dockerfile              Edit Dockerfile (copy full .bin dir)
14. Second deploy               Bash fly deploy  →  FAIL: server.js not found
15. Debug with ls               Edit start.sh (add ls -la)
16. Third deploy                Bash fly deploy  →  see /app has app/ not server.js
17. Root cause found            Read next.config.js → outputFileTracingRoot
18. Fix                         Edit next.config.js (remove experiment)
19. Fourth deploy --no-cache    Bash fly deploy --no-cache  →  SUCCESS
20. Verify live                 Bash curl → HTTP 200 at /login ✓
21. Create user                 Bash bcrypt hash + fly postgres connect INSERT
22. Seed locations/categories   Bash fly postgres connect INSERT (8 + 16 rows)
23. Write all docs              Write JOURNEY.md, COST_ESTIMATE.md, TOOLS_AND_METHODS.md
24. Commit + push all           Bash git add / commit / push
```

---

## Repository

**GitHub:** https://github.com/rifaterdemsahin/tidyup-abacus  
**Live App:** https://tidyup-abacus.fly.dev  
**Login:** erdem@petersfield.com
