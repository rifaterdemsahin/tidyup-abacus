# Deployment Progress — TidyUp Abacus → Fly.io + Doppler

**Target:** https://tidyup-abacus.fly.dev  
**Secrets manager:** Doppler (project: `tidyup-abacus`, config: `prd`)  
**Platform:** Fly.io (region: lhr)  
**Last updated:** 2026-04-03

---

## Checklist

### Prerequisites
- [x] flyctl installed (v0.4.29)
- [x] flyctl authenticated (rifaterdemsahin@gmail.com)
- [x] doppler CLI installed
- [x] doppler authenticated

### Files
- [x] `Dockerfile` — multi-stage Next.js build
- [x] `fly.toml` — app config (port 3000, 1GB RAM)
- [x] `next.config.js` — standalone output enabled
- [x] `.env.example` — secret names documented
- [x] `.doppler.yaml` — project pointer

### Doppler Setup
- [ ] Create project `tidyup-abacus` in Doppler
- [ ] Add secrets to config `prd`
- [ ] Verify secrets with `doppler secrets`

### Fly.io Setup
- [ ] Create app with `fly launch`
- [ ] Import secrets from Doppler → Fly
- [ ] Set `NEXTAUTH_URL` to `https://tidyup-abacus.fly.dev`

### Database
- [ ] Confirm DATABASE_URL is reachable from Fly.io
- [ ] Run `prisma migrate deploy` on first deploy

### Deploy
- [ ] `fly deploy` — build + push image
- [ ] Verify app is running (`fly status`)
- [ ] Open app (`fly open`)

---

## Secrets Required in Doppler (config: prd)

| Secret | Value | Status |
|---|---|---|
| `DATABASE_URL` | postgres connection string | using Abacus.AI DB |
| `NEXTAUTH_SECRET` | random 32-char string | from .env |
| `NEXTAUTH_URL` | https://tidyup-abacus.fly.dev | needs setting |
| `AWS_REGION` | us-west-2 | from .env |
| `AWS_BUCKET_NAME` | abacusai bucket | from .env |
| `AWS_FOLDER_PREFIX` | 34781/ | from .env |
| `AWS_ACCESS_KEY_ID` | **needed from user** | PENDING |
| `AWS_SECRET_ACCESS_KEY` | **needed from user** | PENDING |

> Note: `AWS_PROFILE` does not work on Fly.io — must use explicit key/secret.

---

## Issues / Blockers

- `AWS_PROFILE=hosted_storage` in current .env will not work on Fly.io.  
  → Need `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` from user.
- Abacus.AI DATABASE_URL may not accept connections from Fly.io IPs.  
  → Test connectivity; if blocked, provision Fly Postgres or Neon.tech.

---

## Run Log

Steps executed and their outcomes are appended below as they run.
