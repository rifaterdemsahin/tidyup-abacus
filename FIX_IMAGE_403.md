# Fix: Images Returning 403 Forbidden

**File fixed:** `nextjs_space/lib/s3.ts`  
**Date:** 2026-04-03  
**Commit:** bd46f44

---

## The Error

Visiting an inventory item with a photo showed the grey placeholder instead of the image.

Directly hitting the image URL returned:

```
HTTP/2 403 Forbidden
server: Tigris OS
```

URL that was failing:
```
https://fly.storage.tigris.dev/billowing-sound-420/tidyup/public/uploads/1775243250378-...jpeg
```

---

## Investigation — 3 attempts to fix

### Attempt 1 — Wrong URL format (first fix)

The original code in `getFileUrl` built an AWS S3 URL:

```ts
return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
```

With `region = "auto"` (Tigris uses `auto`, not a real AWS region), this produced:

```
https://billowing-sound-420.s3.auto.amazonaws.com/tidyup/...
```

This URL doesn't exist anywhere — pointing to AWS with a fake region.

**Fix applied:** Use `AWS_ENDPOINT_URL_S3` env var:

```ts
const endpoint = process.env.AWS_ENDPOINT_URL_S3 ?? `https://s3.${region}.amazonaws.com`;
return `${endpoint}/${bucketName}/${cloud_storage_path}`;
```

This generated the right-looking URL:
```
https://fly.storage.tigris.dev/billowing-sound-420/tidyup/...
```

But the image **still failed**.

---

### Attempt 2 — URL format correct, but bucket is private

Testing the corrected URL directly:

```bash
curl -sI "https://fly.storage.tigris.dev/billowing-sound-420/tidyup/public/uploads/..."
```

Result:
```
HTTP/2 403
server: Tigris OS
```

The URL format was now correct, but Tigris returned 403.

Checked bucket ACL:
```bash
aws s3api get-bucket-acl \
  --bucket billowing-sound-420 \
  --endpoint-url https://fly.storage.tigris.dev
```

Result — **no public grants**:
```json
{
  "Grants": [
    { "Permission": "FULL_CONTROL" }   ← only the owner
  ]
}
```

The Tigris bucket is **private by default**. A direct URL — even with the correct
endpoint — returns 403 because there is no public-read policy on the bucket.

---

### Attempt 3 — Root fix: always use presigned URLs

A presigned URL is a time-limited URL that embeds authentication credentials
in the query string. It allows anyone with the link to fetch the object without
the bucket needing to be public.

The code already used presigned URLs for private items:

```ts
// existing code for isPublic = false — worked fine
const command = new GetObjectCommand({ Bucket, Key });
return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
```

The fix was to use the same approach for public items too — removing the direct
URL path entirely.

**Before:**
```ts
export async function getFileUrl(
  cloud_storage_path: string,
  isPublic: boolean
): Promise<string> {
  if (isPublic) {
    // direct URL — fails with 403 on private bucket
    const endpoint = process.env.AWS_ENDPOINT_URL_S3 ?? `https://s3.${region}.amazonaws.com`;
    return `${endpoint}/${bucketName}/${cloud_storage_path}`;
  } else {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: cloud_storage_path,
      ResponseContentDisposition: "attachment"
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }
}
```

**After:**
```ts
export async function getFileUrl(
  cloud_storage_path: string,
  isPublic: boolean
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ...(isPublic ? {} : { ResponseContentDisposition: "attachment" })
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

Key decisions:
- Both public and private items now use presigned URLs
- `ResponseContentDisposition: "attachment"` is kept only for private items
  (forces a download prompt). Public items (photos) display inline.
- Presigned URLs expire after **1 hour** — sufficient for a session

---

## Why Presigned URLs Work on a Private Bucket

```
Browser                App Server              Tigris
  │                        │                      │
  │  GET /api/upload/url   │                      │
  │──────────────────────▶│                      │
  │                        │  signs URL with      │
  │                        │  AWS credentials     │
  │                        │  (embedded in query) │
  │  { url: "https://fly.storage.tigris.dev/...  │
  │         ?X-Amz-Signature=abc123..." }         │
  │◀──────────────────────│                      │
  │                        │                      │
  │  GET https://fly.storage.tigris.dev/...?X-Amz-Signature=...
  │──────────────────────────────────────────────▶│
  │                        │       200 + image    │
  │◀──────────────────────────────────────────────│
```

Tigris validates the signature in the URL. No public bucket policy needed.

---

## Result

```bash
curl -sI "https://fly.storage.tigris.dev/billowing-sound-420/tidyup/public/uploads/..."
HTTP/2 403   ← before fix

# After fix — presigned URL:
curl -sI "https://fly.storage.tigris.dev/billowing-sound-420/...?X-Amz-Credential=...&X-Amz-Signature=..."
HTTP/2 200   ✓
```

Item page https://tidyup-abacus.fly.dev/dashboard/inventory/cmnj9qqkx0003nfhoomqgb4de
now displays the photo correctly.
