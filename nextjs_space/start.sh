#!/bin/sh
set -e

echo "=== /app contents ==="
ls -la /app/
echo "=== /app/.next contents ==="
ls -la /app/.next/ 2>/dev/null || echo "no .next dir"

echo "Running database migrations..."
npx prisma db push --skip-generate --accept-data-loss

echo "Starting server..."
exec node server.js
