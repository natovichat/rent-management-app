#!/bin/sh
set -e

echo "Running Prisma database migrations..."
./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting NestJS application..."
exec node dist/main.js
