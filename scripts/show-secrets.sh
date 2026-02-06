#!/bin/bash

# Script to display all required GitHub Secrets

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          GitHub Secrets - Ready to Copy & Paste!              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. GCP_SA_KEY
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  SECRET NAME: GCP_SA_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 VALUE (copy everything below, including { and }):"
echo ""
cat ~/gcp-github-actions-key.json
echo ""
echo ""

# 2. DATABASE_URL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  SECRET NAME: DATABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 VALUE FORMAT:"
echo ""
echo "postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
echo ""
echo "⚠️  REPLACE [YOUR-PASSWORD] with the actual password you chose in Supabase!"
echo ""
echo "📌 Get this from Supabase:"
echo "   1. Go to: https://supabase.com/dashboard"
echo "   2. Select your project: rent-management-app"
echo "   3. Settings → Database → Connection string → URI"
echo "   4. Copy and REPLACE the password placeholder"
echo ""
echo ""

# 3. JWT_SECRET
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  SECRET NAME: JWT_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 VALUE (copy the string below):"
echo ""
openssl rand -base64 32
echo ""
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                          📝 SUMMARY                             "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Add these 3 secrets to GitHub:"
echo "   https://github.com/natovichat/rent-management-app/settings/secrets/actions"
echo ""
echo "1. GCP_SA_KEY       → Displayed above (JSON)"
echo "2. DATABASE_URL     → From Supabase (with real password!)"
echo "3. JWT_SECRET       → Displayed above (random string)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
