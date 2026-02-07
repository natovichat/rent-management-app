#!/bin/bash

# Production E2E Smoke Tests Runner
# Runs critical smoke tests against production environment on Vercel

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        Production Smoke Tests - Vercel Environment        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
FRONTEND_URL="https://rent-management-app-frontend.vercel.app"
BACKEND_URL="https://rent-app-backend-6s337cqx6a-uc.a.run.app"
TEST_DIR="apps/frontend/test/e2e/production"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Frontend:${NC} $FRONTEND_URL"
echo -e "${BLUE}Backend:${NC} $BACKEND_URL"
echo ""

# Check if Playwright is installed
echo -e "${YELLOW}→${NC} Checking Playwright installation..."
cd apps/frontend
if ! npx playwright --version > /dev/null 2>&1; then
  echo -e "${RED}✗${NC} Playwright not installed"
  echo ""
  echo "Installing Playwright..."
  npm install -D @playwright/test
  npx playwright install chromium
  echo -e "${GREEN}✓${NC} Playwright installed"
else
  echo -e "${GREEN}✓${NC} Playwright installed"
fi
echo ""

# Verify production is accessible
echo -e "${YELLOW}→${NC} Verifying production frontend is accessible..."
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
  echo -e "${GREEN}✓${NC} Frontend accessible"
else
  echo -e "${RED}✗${NC} Frontend not accessible at $FRONTEND_URL"
  exit 1
fi

echo -e "${YELLOW}→${NC} Verifying production backend is accessible..."
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" | grep -q "200\|404"; then
  echo -e "${GREEN}✓${NC} Backend accessible"
else
  echo -e "${RED}✗${NC} Backend not accessible at $BACKEND_URL"
  exit 1
fi
echo ""

# Run tests
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Running Smoke Tests                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

FRONTEND_URL="$FRONTEND_URL" \
BACKEND_URL="$BACKEND_URL" \
npx playwright test "$TEST_DIR/smoke-tests.spec.ts" --reporter=list

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║              ✅ ALL SMOKE TESTS PASSED! ✅                 ║"
  echo "║           Production environment is healthy                ║"
  echo "╚════════════════════════════════════════════════════════════╝"
else
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║              ❌ SMOKE TESTS FAILED! ❌                     ║"
  echo "║          Production has critical issues!                   ║"
  echo "╚════════════════════════════════════════════════════════════╝"
fi

echo ""
echo "View detailed report:"
echo "npx playwright show-report"

exit $EXIT_CODE
