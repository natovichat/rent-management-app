#!/bin/bash

# Database Reset Script
# WARNING: This will delete ALL data in the database

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  DATABASE RESET - WARNING!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will:"
echo "  - Delete ALL existing data"
echo "  - Drop all database tables"
echo "  - Recreate schema from Prisma"
echo "  - Database will be completely clean"
echo ""

cd "$(dirname "$0")/.."

echo "📂 Working directory: $(pwd)"
echo ""

# Navigate to backend
echo "🔄 Navigating to backend..."
cd apps/backend

# Reset Prisma database
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Step 1: Resetting Prisma database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx prisma migrate reset --force --skip-seed

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Step 2: Generating Prisma client..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx prisma generate

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DATABASE RESET COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Current state:"
echo "  - All tables: ✅ Created (empty)"
echo "  - All data: 🗑️  Deleted"
echo "  - Prisma client: ✅ Generated"
echo ""
echo "🚀 Database is ready for fresh implementation!"
echo ""
