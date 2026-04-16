#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma

echo "Starting application..."
exec node server.js
