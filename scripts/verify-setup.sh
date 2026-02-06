#!/bin/bash

# Rent Application Setup Verification Script

echo "🔍 Verifying Rent Application Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
else
  echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check npm version
echo "📦 Checking npm version..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -ge 9 ]; then
  echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"
else
  echo -e "${YELLOW}⚠️  npm 9+ recommended. Current: $(npm -v)${NC}"
fi

# Check directory structure
echo ""
echo "📁 Checking directory structure..."
DIRS=("apps/backend" "apps/frontend" "packages/shared" "docs")
for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✅ $dir exists${NC}"
  else
    echo -e "${RED}❌ $dir missing${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check key files
echo ""
echo "📄 Checking key files..."
FILES=(
  "package.json"
  "docker-compose.yml"
  "README.md"
  "apps/backend/package.json"
  "apps/backend/tsconfig.json"
  "apps/backend/.env.example"
  "apps/frontend/package.json"
  "apps/frontend/tsconfig.json"
  "apps/frontend/.env.example"
  "packages/shared/package.json"
  "packages/shared/tsconfig.json"
)
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ $file exists${NC}"
  else
    echo -e "${RED}❌ $file missing${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check if dependencies are installed
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✅ Root dependencies installed${NC}"
else
  echo -e "${YELLOW}⚠️  Root dependencies not installed. Run: npm install${NC}"
fi

if [ -d "apps/backend/node_modules" ]; then
  echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
  echo -e "${YELLOW}⚠️  Backend dependencies not installed${NC}"
fi

if [ -d "apps/frontend/node_modules" ]; then
  echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
  echo -e "${YELLOW}⚠️  Frontend dependencies not installed${NC}"
fi

# Check PostgreSQL
echo ""
echo "🗄️  Checking PostgreSQL..."
if command -v psql &> /dev/null; then
  echo -e "${GREEN}✅ PostgreSQL CLI available${NC}"
  if pg_isready &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
  else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Use Docker or start PostgreSQL service${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  PostgreSQL CLI not found. Install PostgreSQL or use Docker${NC}"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Setup verification complete!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Copy .env.example files and configure:"
  echo "   - apps/backend/.env.example → apps/backend/.env"
  echo "   - apps/frontend/.env.example → apps/frontend/.env.local"
  echo "2. Install dependencies: npm install"
  echo "3. Set up database: cd apps/backend && npx prisma migrate dev"
  echo "4. Start development: npm run dev"
else
  echo -e "${RED}❌ Found $ERRORS error(s). Please fix them before proceeding.${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
