#!/usr/bin/env bash
# Run production API E2E: create "נכס בדיקות" test property.
# Requires E2E_PROD_JWT (copy auth_token from browser localStorage after prod login).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/frontend"

: "${E2E_PROD_JWT:?Set E2E_PROD_JWT to your production JWT (localStorage key: auth_token)}"

export FRONTEND_URL="${FRONTEND_URL:-https://rent-management-app-frontend.vercel.app}"
export BACKEND_URL="${BACKEND_URL:-https://rent-app-backend-33ifaayi2a-uc.a.run.app/api}"

npx playwright test test/e2e/production/prod-e2e-create-test-property.spec.ts --reporter=list "$@"
