# Rent Application

A comprehensive property and lease management SaaS application built with NestJS (backend) and Next.js (frontend).

## 🏗️ Architecture

This is a monorepo containing:

- **Backend** (`apps/backend`): NestJS API with PostgreSQL, Prisma ORM, and Google OAuth authentication
- **Frontend** (`apps/frontend`): Next.js 14 with TypeScript, Material-UI, and RTL support for Hebrew
- **Shared** (`packages/shared`): Shared TypeScript types and utilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 14+ (or use Docker)
- **Google Cloud Project** with OAuth credentials
- **Git**

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 2. Environment Setup

#### Backend Environment

Copy the example environment file and configure:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` with your configuration:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rent_app?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

#### Frontend Environment

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Wait for PostgreSQL to be ready, then run migrations
cd apps/backend
npx prisma migrate dev --name init
npx prisma generate
```

#### Option B: Local PostgreSQL

Ensure PostgreSQL is running locally, then:

```bash
cd apps/backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Development Servers

#### Option A: Run Both Services Together

```bash
# From root directory
npm run dev
```

This starts both backend (port 3000) and frontend (port 3001) concurrently.

#### Option B: Run Services Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Backend runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# Frontend runs on http://localhost:3001
```

## 🐳 Docker Development

Run the entire stack with Docker:

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 📁 Project Structure

```
rent-application/
├── apps/
│   ├── backend/          # NestJS backend API
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules (auth, properties, leases, etc.)
│   │   │   ├── common/   # Shared guards, decorators, filters
│   │   │   ├── config/   # Configuration files
│   │   │   └── database/ # Prisma schema and migrations
│   │   ├── prisma/       # Prisma schema
│   │   └── Dockerfile
│   └── frontend/         # Next.js frontend
│       ├── src/
│       │   ├── app/      # Next.js app router pages
│       │   ├── components/ # React components
│       │   ├── lib/      # Utilities (API client, theme)
│       │   └── hooks/   # Custom React hooks
│       └── Dockerfile
├── packages/
│   └── shared/          # Shared TypeScript types
│       └── src/
│           └── types/
├── docs/                # Documentation
├── docker-compose.yml   # Docker Compose configuration
└── package.json         # Root workspace configuration
```

## 🛠️ Available Scripts

### Root Level

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build all workspaces
- `npm run test` - Run tests in all workspaces
- `npm run lint` - Lint all workspaces
- `npm run format` - Format code with Prettier
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run Prisma migrations
- `npm run prisma:generate` - Generate Prisma Client

### Backend Scripts

```bash
cd apps/backend

npm run start:dev      # Start in development mode
npm run build          # Build for production
npm run start:prod     # Start production server
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run prisma:studio  # Open Prisma Studio
```

### Frontend Scripts

```bash
cd apps/frontend

npm run dev            # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check     # Type check without building
```

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen:
   - User Type: External
   - Application name: Rent Application
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (backend)
     - `http://localhost:3001/auth/callback` (frontend)
6. Copy Client ID and Client Secret to your `.env` files

## 🗄️ Database Management

### Prisma Commands

```bash
cd apps/backend

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Database Schema

The database schema is defined in `apps/backend/prisma/schema.prisma`. Refer to `docs/database-schema.mdc` for the complete schema documentation.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run backend tests
cd apps/backend && npm run test

# Run frontend tests
cd apps/frontend && npm run test

# Run with coverage
cd apps/backend && npm run test:cov
```

## 📝 Code Quality

### Linting

```bash
# Lint all workspaces
npm run lint

# Lint specific workspace
cd apps/backend && npm run lint
cd apps/frontend && npm run lint
```

### Formatting

```bash
# Format all code
npm run format

# Format specific workspace
cd apps/backend && npm run format
cd apps/frontend && npm run format
```

## 🚢 Deployment

### Backend Deployment

1. Build the backend:
```bash
cd apps/backend
npm run build
```

2. Set production environment variables
3. Run migrations:
```bash
npx prisma migrate deploy
```

4. Start the server:
```bash
npm run start:prod
```

### Frontend Deployment

1. Build the frontend:
```bash
cd apps/frontend
npm run build
```

2. Start the production server:
```bash
npm run start
```

Or deploy to Vercel/Netlify (recommended for Next.js).

## 🐛 Troubleshooting

### PostgreSQL Connection Error

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Port Already in Use

```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (frontend)
lsof -ti:3001 | xargs kill -9
```

### Prisma Client Not Generated

```bash
cd apps/backend
npx prisma generate
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm install --workspaces
```

## 🚀 Deployment to Production (GCP + Supabase)

This project includes automatic CI/CD deployment using:
- **Google Cloud Run** - Backend & Frontend hosting
- **Supabase** - PostgreSQL database (Free tier!)
- **GitHub Actions** - Automatic deployment pipeline

### Quick Deploy (5 minutes!)

```bash
# 1. Setup GCP (Service Account)
gcloud auth login
gcloud config set project calm-armor-616
# (see full commands in QUICK_DEPLOY.md)

# 2. Setup Supabase (Database - FREE!)
# Go to: https://supabase.com
# Create project and get connection string

# 3. Add GitHub Secrets
# Go to: https://github.com/natovichat/rent-management-app/settings/secrets/actions
# Add: GCP_SA_KEY, DATABASE_URL, JWT_SECRET

# 4. Push to GitHub (triggers automatic deployment)
git push origin main
```

**📖 Detailed Guides:**
- [Quick Deploy Guide](docs/QUICK_DEPLOY.md) - 5 minute setup ⚡
- [Supabase Setup](docs/SUPABASE_SETUP.md) - Database configuration 🗄️
- [Full Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Complete documentation 📚

**🎯 Deployment Features:**
- ✅ Automatic deployment on push to `main`
- ✅ Backend deployed to Cloud Run
- ✅ Frontend deployed to Cloud Run
- ✅ Database migrations run automatically
- ✅ Zero-downtime deployments
- 💰 **Free database** with Supabase!

## 📚 Documentation

- [MVP Implementation Guide](docs/MVP_IMPLEMENTATION_GUIDE.md)
- [Requirements](docs/REQUIRMENTS)
- [Database Schema](docs/database-schema.mdc)
- [Rent Application Standards](.cursor/rules/rent-application-standards.mdc)
- [Quick Deploy Guide](docs/QUICK_DEPLOY.md) ⚡ - Start here!
- [Supabase Setup](docs/SUPABASE_SETUP.md) 🗄️ - Free database
- [Full Deployment Guide](docs/DEPLOYMENT_GUIDE.md) 📚 - Complete docs

## 🔗 Useful Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Material-UI Documentation](https://mui.com)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

## 📄 License

Private - All rights reserved

## 👥 Contributing

This is a private project. For questions or issues, please contact the development team.

---

**Happy Coding! 🚀**
