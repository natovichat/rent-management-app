# Quick Deploy Guide - 5 דקות להשקה! ⚡

## 🚀 התחלה מהירה

### שלב 1: הגדר GCP (Cloud Run)

```bash
# התחבר לGCP
gcloud auth login

# בחר את החשבון האישי: natovichat@gmail.com
gcloud config set account natovichat@gmail.com

# הגדר את הפרויקט
gcloud config set project calm-armor-616

# הפעל APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com

# צור Service Account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# הענק הרשאות
SA_EMAIL=$(gcloud iam service-accounts list \
  --filter="displayName:GitHub Actions" \
  --format='value(email)')

gcloud projects add-iam-policy-binding calm-armor-616 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding calm-armor-616 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding calm-armor-616 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"

# צור JSON key
gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=$SA_EMAIL
```

### שלב 2: הגדר Supabase (Database) - חינמי! 🎉

1. **עבור ל:** https://supabase.com
2. **התחבר עם:** GitHub (natovichat@gmail.com)
3. **צור פרויקט:**
   - Name: `rent-management-app`
   - Password: בחר password חזק
   - Region: `us-east-1`
   - Plan: **Free** ($0)
4. **קבל Connection String:**
   - Settings → Database → Connection string
   - העתק את ה-URI

📖 **מדריך מפורט:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### שלב 3: הוסף Secrets ב-GitHub

עבור ל: **https://github.com/natovichat/rent-management-app/settings/secrets/actions**

הוסף 3 secrets:

#### 1. GCP_SA_KEY
```bash
# הצג את תוכן המפתח
cat ~/gcp-key.json

# העתק את כל התוכן (כולל { } )
```

#### 2. DATABASE_URL (Supabase!)
```
postgresql://postgres:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres
```
החלף `YOUR_PASSWORD` בpassword שבחרת ב-Supabase

#### 3. JWT_SECRET
```bash
# צור secret חדש
openssl rand -base64 32

# העתק את הפלט
```

### שלב 4: Deploy!

```bash
# הוסף את הקבצים החדשים
git add .

# צור commit
git commit -m "feat(ci/cd): add GCP deployment configuration"

# דחוף ל-GitHub (יתחיל deployment אוטומטי!)
git push origin main
```

### שלב 5: עקוב אחרי ה-Deployment

עבור ל: **https://github.com/natovichat/rent-management-app/actions**

תראה את ה-workflow רץ:
- 🔵 Building Backend → Deploy Backend
- 🔵 Building Frontend → Deploy Frontend
- 🔵 Running Database Migrations

אחרי ~5-7 דקות:
- ✅ Backend: `https://rent-app-backend-xxx.run.app`
- ✅ Frontend: `https://rent-app-frontend-xxx.run.app`

---

## 🎯 זהו! המערכת שלך פועלת ב-Production!

---

## 📋 Checklist

- [ ] הגדרתי GCP (Service Account + APIs)
- [ ] יצרתי `~/gcp-key.json`
- [ ] נרשמתי ל-Supabase (חינמי!)
- [ ] יצרתי פרויקט ב-Supabase
- [ ] שמרתי את Database Password
- [ ] העתקתי את Supabase Connection String
- [ ] הוספתי את 3 הsecrets ב-GitHub:
  - [ ] GCP_SA_KEY (מ-`~/gcp-key.json`)
  - [ ] DATABASE_URL (מSupabase)
  - [ ] JWT_SECRET (מ-`openssl rand`)
- [ ] Push לGitHub
- [ ] ה-workflow עובר בהצלחה
- [ ] Backend פעיל ב-Cloud Run
- [ ] Frontend פעיל ב-Cloud Run
- [ ] Migrations רצו בהצלחה

---

## 🆘 בעיות?

### Workflow נכשל?

1. בדוק את הלוגים ב-Actions
2. וודא שכל 3 הsecrets קיימים
3. וודא שה-JSON key תקין (JSON format)

### Database connection error?

1. בדוק את ה-`DATABASE_URL` ב-secrets
2. וודא שה-IP נכון
3. וודא שהpassword נכון

### צריך עזרה?

ראה את המדריך המלא: [docs/DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🔄 Deployment הבא

**כל push ל-`main` יעשה deployment אוטומטי!**

```bash
# עשה שינויים בקוד
git add .
git commit -m "feat: add new feature"
git push origin main

# 🎉 Automatic deployment starts!
```

---

## 💰 עלויות

- **Cloud Run:** כמעט חינם (Free tier מכסה רוב השימוש)
- **Supabase Database:** **חינמי!** (Free tier: 500MB storage)
- **סה"כ:** **$0/חודש** לשימוש רגיל! 🎉

---

## 🎊 מזל טוב! האפליקציה שלך ב-Production!
