# ג. זיהוי דרישת תשלום — לאיזה נכס שייך?

**עדיפות:** בינונית  
**מורכבות:** נמוכה  
**מטרה:** כשמגיעה דרישת תשלום — לזהות מהר לאיזה נכס היא שייכת

---

## Backend

- [ ] **C-BE-1** — הוסף מודל `PropertyUtilityProvider` בסכמת Prisma  
  שדות: `id`, `propertyId`, `providerName` (חשמל / עיריה / ועד בית / גז / אחר), `customerNumber`, `notes`

- [ ] **C-BE-2** — כתוב migration ב-Prisma

- [ ] **C-BE-3** — הוסף CRUD endpoints עבור ספקים לנכס:
  - `GET /properties/:id/utility-providers`
  - `POST /properties/:id/utility-providers`
  - `PUT /utility-providers/:id`
  - `DELETE /utility-providers/:id`

- [ ] **C-BE-4** — הוסף endpoint חיפוש: `GET /utility-providers/search?customerNumber=XXX`  
  מחזיר: שם נכס, כתובת, שם ספק, מספר לקוח

---

## Frontend

- [ ] **C-FE-1** — בדף הנכס — הוסף סקשן "ספקים ומספרי לקוח"  
  טבלה: שם ספק, מספר לקוח, הערות + כפתורי עריכה / מחיקה

- [ ] **C-FE-2** — כפתור "הוסף ספק" — פותח Dialog עם שדות: שם ספק (dropdown + חופשי), מספר לקוח, הערות

- [ ] **C-FE-3** — צור דף / חיפוש גלובלי: "חפש לפי מספר לקוח"  
  שורת חיפוש → מציג את הנכס הרלוונטי עם שם הספק

- [ ] **C-FE-4** — הוסף אפשרות לצרף קובץ/תמונה של דרישת תשלום לנכס (File upload)

---

## בדיקות

- [ ] **C-QA-1** — ווידוא שחיפוש לפי מספר לקוח מחזיר את הנכס הנכון
- [ ] **C-QA-2** — ווידוא ש-CRUD של ספקים עובד תקין (הוסף, ערוך, מחק)
- [ ] **C-QA-3** — ווידוא שניתן לצרף קובץ ולראות אותו בדף הנכס
