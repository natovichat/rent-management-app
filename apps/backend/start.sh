#!/bin/sh
set -e

echo "Starting NestJS application..."
exec node dist/main.js
