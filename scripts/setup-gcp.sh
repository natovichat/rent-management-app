#!/bin/bash

# Script להגדרת GCP עבור rent-management-app
# שימוש: ./scripts/setup-gcp.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="calm-armor-616"
REGION="us-central1"
SA_NAME="github-actions"
SA_DISPLAY_NAME="GitHub Actions Deployment"
DB_INSTANCE="rent-app-db"
DB_NAME="rentapp"
DB_USER="rentapp_user"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    GCP Setup for Rent Management App  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Login and set project
echo -e "${YELLOW}Step 1: Setting up GCP project...${NC}"
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✓ Project set to: $PROJECT_ID${NC}"
echo ""

# Step 2: Enable APIs
echo -e "${YELLOW}Step 2: Enabling required APIs...${NC}"
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com

echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Step 3: Create Service Account
echo -e "${YELLOW}Step 3: Creating Service Account for GitHub Actions...${NC}"

# Check if SA already exists
if gcloud iam service-accounts list --filter="displayName:$SA_DISPLAY_NAME" --format="value(email)" | grep -q "@"; then
  echo -e "${YELLOW}Service Account already exists${NC}"
  SA_EMAIL=$(gcloud iam service-accounts list --filter="displayName:$SA_DISPLAY_NAME" --format="value(email)")
else
  gcloud iam service-accounts create $SA_NAME \
    --display-name="$SA_DISPLAY_NAME"
  
  SA_EMAIL=$(gcloud iam service-accounts list --filter="displayName:$SA_DISPLAY_NAME" --format="value(email)")
  echo -e "${GREEN}✓ Service Account created: $SA_EMAIL${NC}"
fi

echo ""

# Step 4: Grant permissions
echo -e "${YELLOW}Step 4: Granting permissions to Service Account...${NC}"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudsql.client" \
  --quiet

echo -e "${GREEN}✓ Permissions granted${NC}"
echo ""

# Step 5: Create JSON key
echo -e "${YELLOW}Step 5: Creating Service Account key...${NC}"

KEY_FILE="$HOME/gcp-github-actions-key.json"

if [ -f "$KEY_FILE" ]; then
  echo -e "${YELLOW}Key file already exists at: $KEY_FILE${NC}"
  read -p "Do you want to create a new key? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Using existing key${NC}"
  else
    rm "$KEY_FILE"
    gcloud iam service-accounts keys create "$KEY_FILE" \
      --iam-account=$SA_EMAIL
    echo -e "${GREEN}✓ New key created at: $KEY_FILE${NC}"
  fi
else
  gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account=$SA_EMAIL
  echo -e "${GREEN}✓ Key created at: $KEY_FILE${NC}"
fi

echo ""

# Step 6: Database setup
echo -e "${YELLOW}Step 6: Setting up Cloud SQL database...${NC}"

# Check if instance exists
if gcloud sql instances describe $DB_INSTANCE --project=$PROJECT_ID &>/dev/null; then
  echo -e "${YELLOW}Cloud SQL instance already exists: $DB_INSTANCE${NC}"
  INSTANCE_IP=$(gcloud sql instances describe $DB_INSTANCE --format="value(ipAddresses[0].ipAddress)")
else
  echo -e "${BLUE}Creating Cloud SQL instance (this may take a few minutes)...${NC}"
  
  # Generate random password
  DB_ROOT_PASSWORD=$(openssl rand -base64 24)
  
  gcloud sql instances create $DB_INSTANCE \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --root-password="$DB_ROOT_PASSWORD" \
    --storage-size=10GB \
    --storage-type=SSD \
    --storage-auto-increase
  
  echo -e "${GREEN}✓ Cloud SQL instance created${NC}"
  echo -e "${YELLOW}Root password: $DB_ROOT_PASSWORD${NC}"
  echo -e "${RED}IMPORTANT: Save this password! You won't see it again.${NC}"
  
  INSTANCE_IP=$(gcloud sql instances describe $DB_INSTANCE --format="value(ipAddresses[0].ipAddress)")
fi

# Create database
if ! gcloud sql databases describe $DB_NAME --instance=$DB_INSTANCE &>/dev/null; then
  gcloud sql databases create $DB_NAME \
    --instance=$DB_INSTANCE
  echo -e "${GREEN}✓ Database created: $DB_NAME${NC}"
else
  echo -e "${YELLOW}Database already exists: $DB_NAME${NC}"
fi

# Create user
if ! gcloud sql users list --instance=$DB_INSTANCE --format="value(name)" | grep -q "^$DB_USER$"; then
  DB_USER_PASSWORD=$(openssl rand -base64 24)
  
  gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE \
    --password="$DB_USER_PASSWORD"
  
  echo -e "${GREEN}✓ Database user created: $DB_USER${NC}"
  echo -e "${YELLOW}User password: $DB_USER_PASSWORD${NC}"
  echo -e "${RED}IMPORTANT: Save this password!${NC}"
else
  echo -e "${YELLOW}Database user already exists: $DB_USER${NC}"
  echo -e "${YELLOW}If you need to reset password, run:${NC}"
  echo -e "  gcloud sql users set-password $DB_USER --instance=$DB_INSTANCE --password=NEW_PASSWORD"
fi

echo ""

# Get connection info
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE --format="value(connectionName)")

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}           Setup Complete!              ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✓ All resources created successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Add these secrets to GitHub:"
echo "   https://github.com/natovichat/rent-management-app/settings/secrets/actions"
echo ""
echo -e "${BLUE}GCP_SA_KEY:${NC}"
echo "   Copy the content of: $KEY_FILE"
echo "   Run: cat $KEY_FILE"
echo ""
echo -e "${BLUE}DATABASE_URL:${NC}"
echo "   postgresql://$DB_USER:YOUR_PASSWORD@$INSTANCE_IP:5432/$DB_NAME"
echo "   OR for Cloud SQL Proxy:"
echo "   postgresql://$DB_USER:YOUR_PASSWORD@localhost:5432/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"
echo ""
echo -e "${BLUE}JWT_SECRET:${NC}"
echo "   Generate with: openssl rand -base64 32"
echo "   Example: $(openssl rand -base64 32)"
echo ""
echo "2. Push code to GitHub to trigger deployment:"
echo "   git add ."
echo "   git commit -m \"feat(ci/cd): configure GCP deployment\""
echo "   git push origin main"
echo ""
echo "3. Monitor deployment at:"
echo "   https://github.com/natovichat/rent-management-app/actions"
echo ""
echo -e "${YELLOW}Important files:${NC}"
echo "  - Service Account Key: $KEY_FILE"
echo "  - Connection Name: $CONNECTION_NAME"
echo "  - Database IP: $INSTANCE_IP"
echo ""
echo -e "${GREEN}Done! 🚀${NC}"
