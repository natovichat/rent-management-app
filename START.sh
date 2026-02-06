#!/bin/bash

# Rent Application Startup Script
# Automatically starts PostgreSQL, runs migrations, and starts servers

set -e

echo "🚀 Starting Rent Application..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check PostgreSQL
echo "📊 Checking PostgreSQL..."
if docker ps --filter "name=postgres" --format "{{.Names}}" | grep -q "postgres"; then
    echo -e "${GREEN}✅ PostgreSQL container running${NC}"
else
    echo -e "${YELLOW}⚙️  Starting PostgreSQL container...${NC}"
    docker-compose up -d postgres
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Run migrations
echo ""
echo "📦 Running database migrations..."
cd apps/backend
if [ ! -d "prisma/migrations" ]; then
    npx prisma migrate dev --name init
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${GREEN}✅ Migrations already exist${NC}"
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"

# Seed database (if needed)
echo ""
echo "🌱 Checking database seed..."
if npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"accounts\";" 2>/dev/null | grep -q "0"; then
    echo "Seeding database with test data..."
    npx prisma db seed
    echo -e "${GREEN}✅ Database seeded${NC}"
else
    echo -e "${GREEN}✅ Database already has data${NC}"
fi

# Start backend
echo ""
echo "🔙 Starting backend server..."
cd ../..
echo "Backend will run on: http://localhost:3001"
gnome-terminal -- bash -c "cd apps/backend && npm run start:dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/apps/backend && npm run start:dev"' 2>/dev/null || \
echo -e "${YELLOW}⚠️  Please start backend manually: cd apps/backend && npm run start:dev${NC}"

# Wait for backend
echo "Waiting for backend to start..."
sleep 5

# Start frontend
echo ""
echo "🎨 Starting frontend server..."
echo "Frontend will run on: http://localhost:3000"
gnome-terminal -- bash -c "cd apps/frontend && npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/apps/frontend && npm run dev"' 2>/dev/null || \
echo -e "${YELLOW}⚠️  Please start frontend manually: cd apps/frontend && npm run dev${NC}"

# Summary
echo ""
echo "========================================"
echo -e "${GREEN}✅ Rent Application Started!${NC}"
echo "========================================"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔙 Backend:  http://localhost:3001"
echo "📊 API Docs: http://localhost:3001/api"
echo "🗄️  Prisma Studio: cd apps/backend && npx prisma studio"
echo ""
echo "🧪 Test Dev Login:"
echo "curl -X POST http://localhost:3001/auth/dev-login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\"}'"
echo ""
echo "📖 Pages:"
echo "- Properties: http://localhost:3000/properties"
echo "- Units: http://localhost:3000/units"
echo ""
echo -e "${YELLOW}📝 Note: Use Ctrl+C in each terminal to stop servers${NC}"
