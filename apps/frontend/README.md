# Rent Application Frontend

Next.js 14 frontend application with Hebrew RTL support and Google OAuth authentication.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript strict mode
- ✅ MUI (Material-UI) with RTL support
- ✅ Hebrew locale (heIL)
- ✅ Heebo/Rubik fonts
- ✅ Google OAuth authentication
- ✅ React Query for API calls
- ✅ Protected routes with middleware
- ✅ MUI DataGrid ready for tables

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Landing page
│   │   ├── auth/
│   │   │   └── callback/       # OAuth callback handler
│   │   └── dashboard/          # Protected dashboard
│   ├── lib/
│   │   ├── theme.ts            # MUI theme with RTL
│   │   ├── api.ts              # Axios client
│   │   └── auth.ts             # Authentication utilities
│   └── providers/
│       └── ThemeProvider.tsx   # RTL cache and providers
├── middleware.ts               # Route protection
└── package.json
```

## RTL Support

The application is fully configured for Hebrew RTL:

- MUI theme with `direction: 'rtl'`
- Hebrew locale (heIL)
- RTL Emotion cache with stylis-plugin-rtl
- Hebrew fonts (Heebo/Rubik)
- RTL-aware DataGrid configuration

## Authentication Flow

1. User clicks login button on landing page
2. Redirects to Google OAuth consent screen
3. Google redirects back to `/auth/callback` with authorization code
4. Frontend exchanges code for JWT token via backend API
5. Token stored in localStorage
6. User redirected to dashboard

## Protected Routes

Routes under `/dashboard` are protected by:
- Middleware (server-side check)
- Client-side authentication check
- Automatic redirect to login if not authenticated

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Next Steps

- [ ] Connect to backend API endpoints
- [ ] Implement MUI DataGrid for properties/leases tables
- [ ] Add React Hook Form for data entry
- [ ] Implement Zustand for client state management
- [ ] Add error boundaries
- [ ] Add loading states and skeletons
- [ ] Implement toast notifications
