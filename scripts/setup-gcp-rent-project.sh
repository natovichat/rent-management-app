#!/bin/bash
# =============================================================================
# Setup script: Migrate rent-app-backend to rent-application-9a1da
# Run this AFTER enabling billing on the rent-application-9a1da project
# =============================================================================

set -e

PROJECT_ID="rent-application-9a1da"
REGION="us-central1"
SA_NAME="github-actions-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
FIREBASE_SA_KEY="config/firebase-service-account.json"

echo "🚀 Setting up GCP project: ${PROJECT_ID}"
echo "================================================"

# Step 1: Enable required APIs
echo ""
echo "📦 Step 1: Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  --project="${PROJECT_ID}"
echo "✅ APIs enabled"

# Step 2: Create GitHub Actions service account
echo ""
echo "👤 Step 2: Creating GitHub Actions service account..."
if gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" &>/dev/null; then
  echo "  ℹ️  Service account already exists, skipping creation"
else
  gcloud iam service-accounts create "${SA_NAME}" \
    --display-name="GitHub Actions Deploy" \
    --project="${PROJECT_ID}"
  echo "  ✅ Service account created: ${SA_EMAIL}"
fi

# Step 3: Grant required roles to the service account
echo ""
echo "🔑 Step 3: Granting IAM roles..."

ROLES=(
  "roles/run.admin"
  "roles/storage.admin"
  "roles/iam.serviceAccountUser"
  "roles/secretmanager.admin"
  "roles/artifactregistry.admin"
  "roles/cloudbuild.builds.editor"
)

for ROLE in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}" \
    --quiet
  echo "  ✅ Granted: ${ROLE}"
done

# Step 4: Create service account key for GitHub Actions
echo ""
echo "🗝️  Step 4: Creating service account key for GitHub Actions..."
KEY_FILE="/tmp/github-actions-sa-key.json"
gcloud iam service-accounts keys create "${KEY_FILE}" \
  --iam-account="${SA_EMAIL}" \
  --project="${PROJECT_ID}"
echo "  ✅ Key saved to: ${KEY_FILE}"
echo ""
echo "  ⚠️  IMPORTANT: Copy the content below and add it as GitHub Secret 'GCP_SA_KEY':"
echo "  Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/\.git$//')/settings/secrets/actions"
echo ""
cat "${KEY_FILE}"
echo ""

# Step 5: Create FIREBASE_PRIVATE_KEY secret in Secret Manager
echo ""
echo "🔐 Step 5: Creating FIREBASE_PRIVATE_KEY secret in Secret Manager..."
if [ -f "${FIREBASE_SA_KEY}" ]; then
  PRIVATE_KEY=$(python3 -c "import json; d=json.load(open('${FIREBASE_SA_KEY}')); print(d['private_key'])")
  
  if gcloud secrets describe FIREBASE_PRIVATE_KEY --project="${PROJECT_ID}" &>/dev/null; then
    echo "  ℹ️  Secret already exists, adding new version..."
    echo -n "${PRIVATE_KEY}" | gcloud secrets versions add FIREBASE_PRIVATE_KEY \
      --data-file=- \
      --project="${PROJECT_ID}"
  else
    echo -n "${PRIVATE_KEY}" | gcloud secrets create FIREBASE_PRIVATE_KEY \
      --data-file=- \
      --project="${PROJECT_ID}"
  fi
  echo "  ✅ FIREBASE_PRIVATE_KEY secret created"
else
  echo "  ❌ Firebase service account key not found at: ${FIREBASE_SA_KEY}"
  echo "     Please create it from Firebase Console > Project Settings > Service Accounts"
fi

# Step 6: Grant Cloud Run access to Secret Manager
echo ""
echo "🔓 Step 6: Granting Cloud Run service account access to secrets..."
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format="value(projectNumber)")
CLOUD_RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding FIREBASE_PRIVATE_KEY \
  --member="serviceAccount:${CLOUD_RUN_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --project="${PROJECT_ID}" \
  --quiet
echo "  ✅ Cloud Run can access FIREBASE_PRIVATE_KEY"

echo ""
echo "================================================"
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Copy the service account key above and update GitHub Secret 'GCP_SA_KEY'"
echo "     URL: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/\.git$//')/settings/secrets/actions"
echo "  2. Trigger a new deployment (push to main or run workflow manually)"
echo "  3. After deployment, get the new Cloud Run URL and update:"
echo "     - GOOGLE_CALLBACK_URL GitHub Secret"
echo "     - Google OAuth authorized redirect URIs in Google Cloud Console"
echo "  4. Delete old Cloud Run service from calm-armor-616:"
echo "     gcloud run services delete rent-app-backend --project=calm-armor-616 --region=us-central1"
echo ""
echo "🔗 GitHub Actions: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/\.git$//')/actions"
