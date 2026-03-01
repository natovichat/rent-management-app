# מבנה הפרויקט — סקירה ברמה גבוהה

> **עדכון אחרון:** מרץ 2026

---

## תמונה כללית

מערכת ניהול נכסים (Rent Management App) בנויה כ-**monorepo** עם שני אפליקציות ראשיות:

```
Backend  →  NestJS + Prisma + PostgreSQL (Google Cloud SQL)
Frontend →  Next.js 14 + React + Material UI
Hosting  →  Backend: Google Cloud Run | Frontend: Vercel
```

---

## מבנה ברמת שורש

```
rentApplication/
├── apps/                  # קוד האפליקציה
│   ├── backend/           # שרת NestJS
│   └── frontend/          # לקוח Next.js
├── packages/              # קוד משותף (types)
├── data/                  # קבצי CSV לייבוא נתונים
├── docs/                  # תיעוד פעיל
├── scripts/               # סקריפטים תפעוליים
├── reports/               # דוחות (security pentest וכו')
├── legacy/                # קבצים ישנים שאינם בשימוש
├── docker-compose.yml     # סביבת פיתוח מקומית (PostgreSQL)
├── vercel.json            # הגדרות Vercel לפרונטאנד
├── package.json           # Monorepo root (npm workspaces)
└── .github/workflows/     # CI/CD → GitHub Actions → Cloud Run
```

---

## Backend (`apps/backend/`)

### מבנה כללי

```
apps/backend/
├── src/                   # קוד המקור
├── prisma/                # סכמת DB, migrations, seeds
├── scripts/               # סקריפטים לתחזוקה
├── test/                  # בדיקות E2E
├── Dockerfile             # בנייה לפרודקשן
├── nest-cli.json          # הגדרות NestJS CLI
└── .env / .env.example    # משתני סביבה
```

### קוד מקור (`src/`)

```
src/
├── main.ts                # נקודת כניסה, הגדרות global (CORS, ValidationPipe, Swagger)
├── app.module.ts          # Module ראשי — מאחד את כל המודולים
├── config/
│   └── configuration.ts  # טעינת משתני סביבה (DATABASE_URL, JWT, Google OAuth)
├── database/
│   ├── prisma.service.ts  # Prisma Client כ-Injectable Service
│   └── prisma.module.ts   # Module לחיבור DB
├── common/
│   ├── decorators/        # Decorators משותפים
│   ├── filters/           # Global exception filters
│   ├── guards/            # Guards משותפים
│   └── interceptors/      # Interceptors (logging וכו')
└── modules/               # כל הדומיינים העסקיים
```

### מודולים עסקיים (`src/modules/`)

כל מודול בנוי לפי אותו Pattern:
```
<module>/
├── <module>.module.ts     # הגדרת Module + Providers
├── <module>.controller.ts # REST endpoints + בדיקת הרשאות
├── <module>.service.ts    # לוגיקה עסקית + שאילתות Prisma
├── dto/                   # Data Transfer Objects (validation)
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── query-*.dto.ts     # פילטרים ופגינציה
└── entities/              # TypeScript types להחזרת נתונים
```

**רשימת המודולים:**

| מודול | תיאור |
|---|---|
| `auth` | Google OAuth + JWT (login, callback, me) |
| `users` | ניהול משתמשים — whitelist, roles (ADMIN/MEMBER) |
| `properties` | נכסים — CRUD, פילטרים, soft-delete |
| `persons` | אנשים אוניברסליים (בעלים, דיירים, חברות) |
| `ownerships` | בעלות על נכסים — % בעלות, ולידציה |
| `mortgages` | משכנתאות — קישור לנכס ולאדם |
| `bank-accounts` | חשבונות בנק |
| `rental-agreements` | חוזי שכירות — סטטוס אוטומטי |
| `property-events` | אירועי נכס (הוצאה, נזק, תשלום שכירות) |
| `planning-process-states` | מצבי תהליכי תכנון לנכס |
| `utility-info` | מידע תשתיות (ארנונה, חשמל וכו') |

### Prisma (`prisma/`)

```
prisma/
├── schema.prisma          # ⭐ סכמת ה-DB — מקור האמת היחיד
├── migrations/            # היסטוריית migrations (SQL)
│   ├── 20260227000000_initial_schema/
│   └── 20260227100000_add_user_auth/
├── seed.ts                # Seed ראשי לנתוני דמו מלאים
└── seeds/                 # Seeds ספציפיים
    ├── clear-all-data.ts          # מחיקת כל הנתונים
    ├── import-netobitz-v2.ts      # ייבוא נתוני נטוביץ (נכסים)
    ├── import-netobitz-leases.ts  # ייבוא חוזי שכירות
    └── update-property-file-numbers.ts
```

**מודלי ה-DB העיקריים:**
`User` → `Person` → `Property` → `Ownership` → `Mortgage` → `RentalAgreement` → `PropertyEvent`

### סקריפטים (`scripts/`)

```
scripts/
├── check-accounts.ts          # בדיקת מצב חשבונות
├── ensure-test-account.ts     # יצירת חשבון בדיקה
├── delete-account-2.ts        # מחיקת חשבון ספציפי
├── populate-from-csv.ts       # אכלוס DB מ-CSV
└── reset-test-account.ts      # איפוס חשבון בדיקה
```

---

## Frontend (`apps/frontend/`)

### מבנה כללי

```
apps/frontend/
├── src/                   # קוד המקור
├── public/                # assets סטטיים
├── test/                  # בדיקות E2E (Playwright)
├── vercel.json            # הגדרות build ב-Vercel
├── next.config.js         # הגדרות Next.js
└── .env.local             # NEXT_PUBLIC_API_URL
```

### דפים (`src/app/`) — Next.js App Router

```
app/
├── page.tsx               # redirect → /dashboard
├── layout.tsx             # Layout ראשי (RTL, MUI Theme, Providers)
├── globals.css            # CSS גלובלי
├── login/                 # דף התחברות (Google OAuth)
├── auth/callback/         # OAuth callback
├── dashboard/             # לוח בקרה ראשי
├── properties/
│   ├── page.tsx           # רשימת נכסים
│   └── [id]/page.tsx      # דף פרטי נכס (dynamic route)
├── mortgages/
│   ├── page.tsx           # רשימת משכנתאות
│   └── [id]/page.tsx      # פרטי משכנתא
├── leases/                # חוזי שכירות
├── ownerships/            # בעלויות
├── persons/               # אנשים
├── bank-accounts/         # חשבונות בנק
├── notifications/         # התראות
└── settings/
    ├── page.tsx           # הגדרות כלליות + ניהול משתמשים
    ├── notifications/     # הגדרות התראות
    └── tables/[entityType]/ # הגדרות עמודות לכל טבלה
```

### קומפוננטים (`src/components/`)

```
components/
├── layout/
│   ├── AppShell.tsx       # ⭐ מעטפת האפליקציה (AppBar + Sidebar + ניווט)
│   └── AccountSelector.tsx
├── properties/            # כל קומפוננטי הנכסים
│   ├── PropertyList.tsx   # DataGrid עם פגינציה + פילטרים
│   ├── PropertyDetails.tsx # פרטי נכס מלאים
│   ├── PropertyForm.tsx   # טופס יצירה/עריכה
│   ├── PropertyFilterPanel.tsx
│   ├── OwnershipPanel.tsx # בעלויות על הנכס
│   ├── FinancialDashboard.tsx
│   ├── PropertyMortgagesSection.tsx
│   ├── PropertyLeasesSection.tsx
│   └── ...
├── mortgages/             # טפסים ורשימות משכנתאות
├── leases/                # חוזי שכירות (LeaseForm, LeaseList)
├── persons/               # ניהול אנשים
├── ownerships/            # ניהול בעלויות
├── bank-accounts/         # חשבונות בנק
├── property-events/       # אירועי נכס
├── planning-process-states/ # (רזרבה — מצבי תכנון)
├── investment-companies/  # חברות השקעה
├── settings/              # דפי הגדרות
│   ├── UserManagementTab.tsx  # ניהול משתמשים + whitelist
│   ├── ProfileTab.tsx
│   ├── AccountTab.tsx
│   ├── PreferencesTab.tsx
│   └── SessionsTab.tsx
├── dashboard/             # גרפים ו-widgets ללוח הבקרה
├── charts/                # רכיבי Recharts
├── notifications/         # רשימת התראות
├── import/                # ייבוא CSV
├── export/                # ייצוא CSV
├── navigation/            # QuickNavigator
└── Providers.tsx          # React Query + Theme
```

### שכבת API (`src/lib/api/`)

```
lib/api/
├── api.ts                 # ⭐ Axios instance מרכזי (base URL, auth headers)
├── auth.ts                # login, logout, getMe
├── properties.ts          # CRUD נכסים
├── persons.ts             # CRUD אנשים
├── mortgages.ts           # CRUD משכנתאות
├── leases.ts              # CRUD חוזי שכירות
├── ownerships.ts          # CRUD בעלויות
├── bank-accounts.ts       # CRUD חשבונות בנק
├── property-events.ts     # CRUD אירועי נכס
├── planning-process-states.ts
├── utility-info.ts
├── users.ts               # ניהול משתמשים (admin)
├── accounts.ts
├── dashboard.ts           # נתוני סיכום לדשבורד
└── table-configurations.ts # שמירת הגדרות עמודות
```

### Hooks ו-Utilities

```
lib/hooks/
├── useConfiguredColumns.ts    # טעינת הגדרות עמודות מותאמות אישית
├── useShowDeleted.ts          # toggle הצגת רשומות מחוקות
└── useTableConfigurations.ts  # ניהול הגדרות טבלאות

hooks/
├── useDebounce.ts             # debounce לחיפוש
└── usePropertyFilters.ts      # state לפילטרי נכסים

lib/
├── auth.ts                    # פונקציות עזר לאותנטיקציה
├── accountStorage.ts          # localStorage לחשבון נוכחי
├── theme.ts                   # MUI Theme (RTL + Hebrew)
└── reports/
    └── propertyReportGenerator.ts  # יצירת דוחות PDF/Excel
```

### Middleware

```
src/middleware.ts    # Next.js middleware — הגנה על routes (בדיקת JWT token)
```

---

## Packages משותפים (`packages/shared/`)

```
packages/shared/src/
├── index.ts          # exports ראשי
└── types/index.ts    # TypeScript types משותפים בין Backend לFrontend
```

---

## תיעוד (`docs/`)

```
docs/
├── DEPLOYMENT_GUIDE.md        # מדריך deploy לפרודקשן
├── TECHNICAL_DEBT.md          # חובות טכניים + TODO עתידיים
├── api/                       # תיעוד API לכל endpoint
│   ├── README.md
│   ├── properties.md
│   ├── persons.md
│   ├── mortgages.md
│   └── ...
├── project_management/        # ניהול פרויקט
│   ├── REBUILD_EPICS_OVERVIEW.md   # סקירת כל ה-epics
│   ├── EPIC_00_DATABASE_RESET.md
│   ├── EPIC_01_CORE_ENTITIES.md
│   ├── EPIC_02_PROPERTY_1to1.md
│   └── ...
├── fixes/                     # תיעוד bug fixes משמעותיים
└── testing/                   # מדריכי בדיקות
    ├── PRODUCTION_TESTING_GUIDE.md
    └── E2E_PERFORMANCE_OPTIMIZATION.md
```

---

## CI/CD (`.github/workflows/`)

```
deploy-to-gcp.yml:
  trigger: push to main
  steps:
    1. Build + Test (TypeScript check)
    2. Deploy Backend → Google Cloud Run
    3. Run Prisma migrations on Cloud SQL
  Frontend deploys automatically via Vercel (Git integration)
```

---

## סקריפטים תפעוליים (`scripts/`)

| קובץ | מטרה |
|---|---|
| `reset-database.sh / .ts` | איפוס DB בסביבת dev |
| `setup-gcp.sh` | הגדרת GCP ראשונית (Cloud SQL, Cloud Run) |
| `verify-setup.sh` | בדיקת תקינות סביבה |
| `show-secrets.sh` | הצגת secrets מ-GCP Secret Manager |
| `reset-test-account.ts` | איפוס חשבון לבדיקות |

---

## נתונים (`data/`)

```
data/imports/
├── properties_from_excel.csv   # נכסי נטוביץ (ייובאו כבר)
├── leases_from_excel.csv       # חוזי שכירות (ייובאו כבר)
└── README.md
```

---

## Legacy (`legacy/`)

> קבצים ישנים ששימשו בשלבי פיתוח מוקדמים — **אין לשתמש בהם.**

```
legacy/
├── data/          # קבצי Excel ו-HTML של הנתונים המקוריים
├── prototype/     # פרוטוטייפ HTML ישן של ה-UI
├── prisma/        # סכמות חלופיות ישנות + seeds v1
├── docs/          # תיעוד היסטורי (completion reports, retros)
├── scripts/       # סקריפטי ייבוא/בדיקה ישנים
├── plans/         # תוכניות Cursor rebuild ישנות
└── logs/          # לוגים ישנים
```

---

## זרימת Auth

```
1. משתמש לוחץ "Login with Google"
2. Frontend → Backend /api/auth/google
3. Backend מאמת מול Google OAuth
4. Backend בודק email ב-users table (whitelist)
5. Backend מחזיר JWT token
6. Frontend שומר token ב-localStorage
7. כל request → Authorization: Bearer <token>
8. Backend middleware (JwtAuthGuard) מאמת token
```

---

## הוספת משתמש חדש

1. כנס ל-`/settings` → טאב "משתמשים"
2. לחץ "הוסף משתמש" → הכנס Gmail
3. המשתמש יוכל להתחבר עם חשבון Google שלו
4. ברירת מחדל: role=MEMBER (לא ADMIN)
