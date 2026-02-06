# מדריך Deployment ל-GCP Cloud Run

## סקירה כללית

המערכת מורכבת משני שירותים:
- **Backend** - NestJS API (פורט 3000)
- **Frontend** - Next.js Application (פורט 3001)

שני השירותים יתפרסמו ב-**Google Cloud Run** בפרויקט `calm-armor-616`.

---

## שלב 1: הכנת GCP

### 1.1 התחברות ל-GCP Console

```bash
# התחבר ל-GCP
gcloud auth login

# הגדר את הפרויקט
gcloud config set project calm-armor-616
```

### 1.2 הפעלת APIs נדרשים

```bash
# הפעל את ה-APIs הנדרשים
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  sqladmin.googleapis.com
```

### 1.3 יצירת Service Account ל-GitHub Actions

```bash
# צור Service Account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment"

# קבל את כתובת המייל של ה-Service Account
SA_EMAIL=$(gcloud iam service-accounts list \
  --filter="displayName:GitHub Actions Deployment" \
  --format='value(email)')

echo "Service Account Email: $SA_EMAIL"

# הענק הרשאות נדרשות
gcloud projects add-iam-policy-binding calm-armor-616 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding calm-armor-616 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding calm-armor-616 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"

# צור מפתח JSON
gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=$SA_EMAIL

# הצג את תוכן המפתח (תעתיק את זה ל-GitHub Secrets)
cat ~/gcp-key.json
```

**⚠️ חשוב:** שמור את תוכן הקובץ `~/gcp-key.json` - תצטרך אותו בשלב הבא.

---

## שלב 2: הגדרת Database (Cloud SQL)

### 2.1 יצירת PostgreSQL Instance

```bash
# צור Cloud SQL instance
gcloud sql instances create rent-app-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD \
  --storage-size=10GB \
  --storage-type=SSD

# צור את בסיס הנתונים
gcloud sql databases create rentapp \
  --instance=rent-app-db

# צור משתמש
gcloud sql users create rentapp_user \
  --instance=rent-app-db \
  --password=YOUR_SECURE_USER_PASSWORD
```

### 2.2 קבל את ה-Connection String

```bash
# קבל את כתובת ה-IP הפנימית
gcloud sql instances describe rent-app-db \
  --format='value(ipAddresses[0].ipAddress)'

# ה-Connection String יהיה:
# postgresql://rentapp_user:YOUR_SECURE_USER_PASSWORD@IP_ADDRESS:5432/rentapp
```

### 2.3 אפשר גישה מ-Cloud Run

```bash
# קבל את Connection Name
CONNECTION_NAME=$(gcloud sql instances describe rent-app-db \
  --format='value(connectionName)')

echo "Connection Name: $CONNECTION_NAME"
```

**לשימוש עם Cloud SQL Proxy:**
```
DATABASE_URL=postgresql://rentapp_user:password@localhost:5432/rentapp?host=/cloudsql/$CONNECTION_NAME
```

---

## שלב 3: הגדרת GitHub Secrets

עבור לreository ב-GitHub:
**https://github.com/natovichat/rent-management-app/settings/secrets/actions**

### 3.1 הוסף את ה-Secrets הבאים:

| Secret Name | Value | תיאור |
|-----------|-------|-------|
| `GCP_SA_KEY` | תוכן `~/gcp-key.json` | Service Account Key מלא (JSON) |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Connection string ל-PostgreSQL |
| `JWT_SECRET` | `your-secure-random-string` | Secret לJWT tokens |

### 3.2 כיצד ליצור JWT_SECRET

```bash
# צור JWT secret אקראי
openssl rand -base64 32
```

---

## שלב 4: בדיקת ה-Workflow

### 4.1 Commit והעלאת השינויים

```bash
# וודא שהקבצים נוספו
git status

# הוסף את הקבצים החדשים
git add .github/workflows/deploy-to-gcp.yml
git add docs/DEPLOYMENT_GUIDE.md

# צור commit
git commit -m "feat(ci/cd): add GCP Cloud Run deployment workflow

- Add GitHub Actions workflow for automatic deployment
- Deploy backend and frontend to Cloud Run
- Include database migration step
- Add comprehensive deployment guide"

# דחוף ל-GitHub
git push origin main
```

### 4.2 עקוב אחרי ה-Deployment

1. עבור ל-**https://github.com/natovichat/rent-management-app/actions**
2. צפה ב-workflow "Deploy to GCP Cloud Run"
3. בדוק את הלוגים של כל job

---

## שלב 5: תצורות נוספות (אופציונלי)

### 5.1 הגדרת Custom Domain

```bash
# מפה domain ל-Cloud Run service
gcloud run domain-mappings create \
  --service rent-app-frontend \
  --domain your-domain.com \
  --region us-central1
```

### 5.2 הגדרת Environment Variables נוספים

ערוך את `.github/workflows/deploy-to-gcp.yml` והוסף:

```yaml
--set-env-vars="VARIABLE_NAME=${{ secrets.VARIABLE_NAME }}"
```

### 5.3 הגדרת Auto-scaling

```yaml
--min-instances 1 \
--max-instances 100 \
--cpu-throttling \
--concurrency 80
```

---

## בעיות נפוצות ופתרונות

### ❌ שגיאה: "Permission denied"

**פתרון:** וודא שה-Service Account קיבל את כל ההרשאות:
```bash
gcloud projects get-iam-policy calm-armor-616 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SA_EMAIL"
```

### ❌ שגיאה: "Database connection failed"

**פתרון:** 
1. וודא שה-`DATABASE_URL` ב-GitHub Secrets נכון
2. בדוק שCloud SQL instance פעיל
3. וודא שCloud Run יכול להתחבר ל-Cloud SQL

### ❌ שגיאה: "Frontend can't connect to Backend"

**פתרון:**
- וודא שה-Backend URL הועבר ל-Frontend
- בדוק CORS settings ב-Backend
- וודא שה-Backend service הוא `--allow-unauthenticated`

---

## מבנה הפרויקט אחרי Deployment

```
GCP Project: calm-armor-616
├── Cloud Run Services
│   ├── rent-app-backend
│   │   └── URL: https://rent-app-backend-xxx.run.app
│   └── rent-app-frontend
│       └── URL: https://rent-app-frontend-xxx.run.app
├── Container Registry
│   ├── gcr.io/calm-armor-616/rent-app-backend:latest
│   └── gcr.io/calm-armor-616/rent-app-frontend:latest
└── Cloud SQL
    └── rent-app-db (PostgreSQL 15)
```

---

## פקודות שימושיות

### צפייה בלוגים

```bash
# Backend logs
gcloud run logs read rent-app-backend --region us-central1 --limit 50

# Frontend logs
gcloud run logs read rent-app-frontend --region us-central1 --limit 50
```

### עדכון Service ידני

```bash
# Backend
gcloud run deploy rent-app-backend \
  --image gcr.io/calm-armor-616/rent-app-backend:latest \
  --region us-central1

# Frontend
gcloud run deploy rent-app-frontend \
  --image gcr.io/calm-armor-616/rent-app-frontend:latest \
  --region us-central1
```

### מחיקת Services

```bash
# מחק Backend
gcloud run services delete rent-app-backend --region us-central1

# מחק Frontend
gcloud run services delete rent-app-frontend --region us-central1
```

---

## עלויות משוערות

### Cloud Run (Pay-per-use)

- **Free tier:** 2 מיליון בקשות/חודש
- **Beyond free tier:** ~$0.40 לכל מיליון בקשות
- **CPU:** $0.00002400 לשנייה
- **Memory:** $0.00000250 לGB-שנייה

### Cloud SQL (db-f1-micro)

- **Instance:** ~$7-10/חודש
- **Storage (10GB):** ~$1.70/חודש
- **סה"כ:** ~$8-12/חודש

### סה"כ משוער

- **עם שימוש נמוך:** ~$10-15/חודש
- **עם שימוש בינוני:** ~$30-50/חודש

---

## תמיכה ועזרה

- **GCP Documentation:** https://cloud.google.com/run/docs
- **GitHub Actions Docs:** https://docs.github.com/actions
- **Cloud SQL Docs:** https://cloud.google.com/sql/docs

---

## Checklist להשלמת Setup

- [ ] הפעלת APIs ב-GCP
- [ ] יצירת Service Account
- [ ] הורדת JSON key
- [ ] יצירת Cloud SQL instance
- [ ] יצירת database ו-user
- [ ] הגדרת GitHub Secrets (3):
  - [ ] GCP_SA_KEY
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
- [ ] Push הקוד ל-GitHub
- [ ] בדיקת GitHub Actions workflow
- [ ] אימות ש-Backend פועל
- [ ] אימות ש-Frontend פועל
- [ ] הרצת migrations
- [ ] בדיקת חיבור בין Frontend ל-Backend

---

**✅ אחרי שתשלים את כל השלבים, המערכת תהיה פעילה ב-Cloud Run!**
