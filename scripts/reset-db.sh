#!/bin/bash

# Database Reset Script
# Clears all data and creates a fresh test account

echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Aborted."
  exit 0
fi

echo ""
echo "🔄 Resetting database..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../apps/backend"

# Run the TypeScript script using ts-node
npx ts-node ../../scripts/reset-database.ts

exit $?
