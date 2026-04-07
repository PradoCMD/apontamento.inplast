#!/bin/sh
set -e

echo "🏭 Inplast Aponta - Starting..."
echo "📦 Running database migrations..."

cd /app
node dist/index.cjs
