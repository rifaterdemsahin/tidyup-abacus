# Fly.io Cost Estimate — 30 Minutes/Month Usage

**App:** tidyup-abacus  
**Usage assumption:** 30 minutes of active use per month  
**Date:** 2026-04-03

---

## Current Setup

| Resource | Spec |
|---|---|
| App machines | 2 × shared-cpu-1x, 1 GB RAM (London, lhr) |
| Postgres | tidyup-abacus-db — shared-cpu-1x, 256 MB RAM, 1 GB disk |
| Storage | Tigris S3 bucket (billowing-sound-420) |
| Auto-stop | Enabled — machines stop when idle |

---

## How Fly.io Billing Works

Fly bills by **machine-seconds** — you only pay while a machine is **running**.

With `auto_stop_machines = true` and `min_machines_running = 0` (set in fly.toml),
machines **stop automatically** when there is no incoming traffic, and
**wake up** when a request arrives (cold start ~1–3 seconds).

This means for 30 minutes of actual use per month, you pay for ~30 minutes of compute,
not 24/7.

---

## Pricing Reference (Fly.io, April 2026)

| Resource | Price |
|---|---|
| shared-cpu-1x, 1 GB RAM | $0.0000193 / second ($0.01158 / minute) |
| Fly Postgres shared-cpu-1x, 256 MB RAM | ~$1.94 / month (always-on) |
| Postgres disk — 1 GB | $0.15 / month |
| Tigris S3 — first 5 GB storage | Free |
| Tigris S3 — first 10 GB egress/month | Free |
| Outbound bandwidth (first 100 GB) | Free |

---

## Monthly Cost Breakdown — 30 min/month usage

### App Machines (2 machines, auto-stop enabled)

With auto-stop, both machines sleep when idle.
A request wakes **one** machine; the second is a standby for HA.

- Active time per month: ~30 minutes = 1,800 seconds
- Running machines during active period: ~1 (one wakes, one stays stopped)
- Cost: 1,800 sec × $0.0000193 = **~$0.035**

> Cold start note: each visit wakes the machine in ~2–3 seconds.
> If you want zero cold starts, set `min_machines_running = 1` — this adds ~$0.84/month.

### Postgres (always-on — Fly Postgres cannot auto-stop)

Fly Postgres runs 24/7 regardless of app usage.

- Compute: shared-cpu-1x, 256 MB RAM → **~$1.94 / month**
- Disk: 1 GB → **~$0.15 / month**
- Total Postgres: **~$2.09 / month**

### Tigris S3 Storage

- First 5 GB free, first 10 GB egress free
- For this app at low usage: **$0.00 / month**

### Summary

| Item | Monthly Cost |
|---|---|
| App machines (30 min active, auto-stop) | ~$0.04 |
| Fly Postgres (always-on) | ~$2.09 |
| Tigris S3 | $0.00 |
| Bandwidth | $0.00 |
| **Total** | **~$2.13 / month** |

---

## How to Reduce Costs Further

### Option A — Keep as-is (~$2.13/month)
No changes needed. The Postgres is the dominant cost.

### Option B — Use Neon.tech free-tier Postgres (~$0.04/month)
Replace Fly Postgres with [Neon.tech](https://neon.tech) (free tier: 0.5 GB storage, auto-suspend).
This removes the $2.09/month Postgres cost entirely.

Steps:
1. Create a free Neon project
2. Update `DATABASE_URL` secret in Fly and Doppler
3. Run `prisma db push` to sync schema
4. Delete the Fly Postgres cluster (`fly postgres detach` + destroy)

**Estimated saving: ~$2.09/month → total ~$0.04/month**

### Option C — Single machine instead of 2 (~$1.07/month)
Scale down to 1 machine (removes HA standby):
```bash
fly scale count 1 --app tidyup-abacus
```

---

## Free Allowances (Fly.io Hobby plan)

Fly includes free allowances each month that may cover this app entirely:

| Allowance | Amount |
|---|---|
| shared-cpu-1x machines | 3 VMs free |
| 256 MB RAM machines | 3 VMs free |
| Outbound bandwidth | 100 GB free |
| Fly Postgres (shared-cpu-1x, 256 MB) | 1 instance free |

> If your account is on the **free hobby plan** and this is your only app,
> the Postgres and app machines may fall within the free tier — making the
> **effective cost $0/month**.

Check your current usage at: https://fly.io/dashboard/personal/billing

---

## Bottom Line

| Scenario | Monthly Cost |
|---|---|
| Free tier covers it | **$0** |
| Paid plan, current setup | **~$2.13** |
| Paid plan + Neon free Postgres | **~$0.04** |
