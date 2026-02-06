# Quick Deploy Guide - 5 דקות להשקה! ⚡

## 🚀 התחלה מהירה

### שלב 1: הרץ סקריפט Setup (פעם אחת)

```bash
# הרץ את סקריפט ההגדרה
./scripts/setup-gcp.sh
```

הסקריפט יבצע אוטומטית:
- ✅ הפעלת APIs נדרשים
- ✅ יצירת Service Account
- ✅ הענקת הרשאות
- ✅ יצירת JSON key
- ✅ הקמת Cloud SQL database

### שלב 2: העתק את המפתח ל-GitHub

```bash
# הצג את תוכן המפתח
cat ~/gcp-github-actions-key.json

# העתק את כל התוכן (כולל { } )
```

### שלב 3: הוסף Secrets ב-GitHub

עבור ל: **https://github.com/natovichat/rent-management-app/settings/secrets/actions**

הוסף 3 secrets:

#### 1. GCP_SA_KEY
```
# הדבק את כל תוכן הקובץ מהשלב הקודם
```

#### 2. DATABASE_URL
```bash
# הסקריפט הציג את זה - העתק מהפלט
postgresql://rentapp_user:PASSWORD@IP:5432/rentapp
```

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

- [ ] הרצתי `./scripts/setup-gcp.sh`
- [ ] שמרתי את הפלט (passwords, IPs)
- [ ] העתקתי את `~/gcp-github-actions-key.json`
- [ ] הוספתי את 3 הsecrets ב-GitHub:
  - [ ] GCP_SA_KEY
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
- [ ] Push לGitHub
- [ ] ה-workflow עובר בהצלחה
- [ ] Backend פעיל
- [ ] Frontend פעיל

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
- **Cloud SQL:** ~$10-12/חודש (db-f1-micro)
- **סה"כ:** ~$10-15/חודש לשימוש רגיל

---

## 🎊 מזל טוב! האפליקציה שלך ב-Production!
