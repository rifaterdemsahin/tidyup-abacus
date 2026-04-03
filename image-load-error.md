# Image Load Error — Investigation & Fix

**Item:** Rifat Erdem Sahin  
**Item ID:** `cmnj9qqkx0003nfhoomqgb4de`  
**URL:** https://tidyup-abacus.fly.dev/dashboard/inventory/cmnj9qqkx0003nfhoomqgb4de  
**Date:** 2026-04-03

---

## Symptom

The inventory item detail page loaded correctly (name, category, location, notes)
but the photo was not displayed — only the grey placeholder box appeared.

---

## Investigation

### Step 1 — Check the database record

```sql
SELECT id, name, "photoUrl" FROM "Item"
WHERE id = 'cmnj9qqkx0003nfhoomqgb4de';
```

**Result:**
```
photoUrl = tidyup/public/uploads/1775242824922-WhatsApp Image 2026-01-15 at 19.05.58.jpeg
```

The `photoUrl` field stores the **storage path** (key), not a full URL. ✓

---

### Step 2 — Trace how the URL is generated

The item detail page (`app/dashboard/inventory/[id]/page.tsx:44`) calls:

```
POST /api/upload/url  { cloud_storage_path, isPublic: true }
```

That API route calls `getFileUrl(cloud_storage_path, isPublic)` from `lib/s3.ts`.

The `getFileUrl` function for **public** files (line 87, before fix):

```ts
// BEFORE — broken
return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
```

With the live environment values:
- `bucketName` = `billowing-sound-420` (Tigris bucket)
- `region` = `auto` (Tigris uses `auto` not a real AWS region)

This generated:
```
https://billowing-sound-420.s3.auto.amazonaws.com/tidyup/public/...
```

**This URL is completely wrong.** It points to AWS S3 with a fake region `auto`.
The bucket does not exist on AWS — it lives on Tigris.

---

### Step 3 — Confirm the file exists in Tigris

```bash
aws s3 ls s3://billowing-sound-420/tidyup/public/uploads/ \
  --endpoint-url https://fly.storage.tigris.dev
```

**Result:**
```
2026-04-03 20:00:25   434744   1775242824922-WhatsApp Image 2026-01-15 at 19.05.58.jpeg
```

The file **exists** in Tigris. The upload had worked correctly. Only the URL was wrong.

---

## Root Cause

`lib/s3.ts` was written targeting AWS S3 and hardcodes the AWS URL pattern:

```ts
`https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`
```

This project runs on **Fly Tigris** (an S3-compatible service), whose public URL format is:

```
https://fly.storage.tigris.dev/{bucket}/{key}
```

The original code had no knowledge of a custom endpoint — it always assumed AWS.

---

## Fix Applied

**File:** `nextjs_space/lib/s3.ts`

```ts
// BEFORE
return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;

// AFTER
const endpoint = process.env.AWS_ENDPOINT_URL_S3 ?? `https://s3.${region}.amazonaws.com`;
return `${endpoint}/${bucketName}/${cloud_storage_path}`;
```

**How it works:**
- `AWS_ENDPOINT_URL_S3` is already set in Fly secrets as `https://fly.storage.tigris.dev`
- The fix reads that environment variable and builds the correct URL
- Falls back to the standard AWS URL format when the variable is not set (local dev with real AWS)
- No hardcoded service URLs — works with any S3-compatible storage

**Correct URL now generated:**
```
https://fly.storage.tigris.dev/billowing-sound-420/tidyup/public/uploads/1775242824922-WhatsApp Image 2026-01-15 at 19.05.58.jpeg
```

---

## Related Fix — CORS for Uploads

Separately, the photo **upload** was also failing with "Failed to upload photo".

**Cause:** Tigris requires a CORS policy before browsers can `PUT` directly via presigned URLs.

**Fix applied:**
```bash
aws s3api put-bucket-cors \
  --bucket billowing-sound-420 \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["https://tidyup-abacus.fly.dev"],
      "AllowedMethods": ["GET","PUT","POST","DELETE","HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }]
  }' \
  --endpoint-url https://fly.storage.tigris.dev
```

---

## Files Changed

| File | Change |
|---|---|
| `nextjs_space/lib/s3.ts` | Fixed `getFileUrl` public URL construction to use `AWS_ENDPOINT_URL_S3` |
| Tigris bucket CORS | Set via AWS CLI (not a code file — bucket-level setting) |

---

## Verification

After deploy, the correct URL resolves to the image in Tigris and the photo
displays on the item detail page.

The fix is backwards compatible:
- With `AWS_ENDPOINT_URL_S3` set → uses Tigris endpoint
- Without `AWS_ENDPOINT_URL_S3` → falls back to standard `https://s3.{region}.amazonaws.com`
