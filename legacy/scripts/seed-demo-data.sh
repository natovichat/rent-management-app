#!/bin/bash
# Seed demo data for all tables
# Usage: ./scripts/seed-demo-data.sh

BASE_URL="http://localhost:3000/api"

echo "🌱 Seeding demo data..."

# ─── Helper ────────────────────────────────────────────────────────────────────
post() {
  local endpoint="$1"
  local data="$2"
  local desc="$3"
  local result
  result=$(curl -s -X POST "$BASE_URL$endpoint" \
    -H "Content-Type: application/json" \
    -d "$data")
  local id
  id=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','ERROR'))" 2>/dev/null)
  if [ "$id" = "ERROR" ] || [ -z "$id" ]; then
    echo "  ❌ $desc: $result"
  else
    echo "  ✅ $desc (id: $id)"
  fi
  echo "$id"
}

get_id() {
  local result="$1"
  echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null
}

# ─── 1. Persons ────────────────────────────────────────────────────────────────
echo ""
echo "👤 Creating persons..."

P1=$(post "/persons" '{
  "name": "דוד כהן",
  "type": "INDIVIDUAL",
  "idNumber": "123456789",
  "email": "david.cohen@gmail.com",
  "phone": "050-1234567",
  "address": "רחוב הרצל 15, תל אביב",
  "notes": "בעלים ראשי של הנכסים"
}' "דוד כהן")

P2=$(post "/persons" '{
  "name": "רחל לוי",
  "type": "INDIVIDUAL",
  "idNumber": "987654321",
  "email": "rachel.levi@yahoo.com",
  "phone": "052-9876543",
  "address": "שדרות רוטשילד 8, תל אביב",
  "notes": "שותפה בנכס ברחובות"
}' "רחל לוי")

P3=$(post "/persons" '{
  "name": "נכסים ישראל בע\"מ",
  "type": "COMPANY",
  "idNumber": "515123456",
  "email": "info@nadlan-israel.co.il",
  "phone": "03-5551234",
  "address": "אבן גבירול 50, תל אביב",
  "notes": "חברת נדלן"
}' "נכסים ישראל בעמ")

P4=$(post "/persons" '{
  "name": "יוסף אברהם",
  "type": "INDIVIDUAL",
  "idNumber": "345678901",
  "email": "yosef.avraham@hotmail.com",
  "phone": "054-3456789",
  "address": "הנביאים 22, ירושלים",
  "notes": "שוכר"
}' "יוסף אברהם - שוכר")

P5=$(post "/persons" '{
  "name": "מרים שפירא",
  "type": "INDIVIDUAL",
  "idNumber": "567890123",
  "email": "miriam.shapira@gmail.com",
  "phone": "053-5678901",
  "address": "ביאליק 12, רמת גן"
}' "מרים שפירא - שוכרת")

P6=$(post "/persons" '{
  "name": "שותפות כהן-לוי",
  "type": "PARTNERSHIP",
  "idNumber": "580234567",
  "email": "partnership@cohenlevi.co.il",
  "phone": "03-6667890",
  "address": "המסגר 30, תל אביב",
  "notes": "שותפות לנכסים מסחריים"
}' "שותפות כהן-לוי")

# ─── 2. Bank Accounts ─────────────────────────────────────────────────────────
echo ""
echo "🏦 Creating bank accounts..."

BA1=$(post "/bank-accounts" '{
  "bankName": "בנק לאומי",
  "branchNumber": "800",
  "accountNumber": "12345678",
  "accountType": "PERSONAL_CHECKING",
  "accountHolder": "דוד כהן",
  "notes": "חשבון ראשי לדמי שכירות"
}' "בנק לאומי")

BA2=$(post "/bank-accounts" '{
  "bankName": "בנק הפועלים",
  "branchNumber": "512",
  "accountNumber": "87654321",
  "accountType": "PERSONAL_SAVINGS",
  "accountHolder": "דוד כהן",
  "notes": "חשבון חיסכון"
}' "בנק הפועלים")

BA3=$(post "/bank-accounts" '{
  "bankName": "בנק מזרחי טפחות",
  "branchNumber": "232",
  "accountNumber": "11223344",
  "accountType": "BUSINESS",
  "accountHolder": "נכסים ישראל בעמ",
  "notes": "חשבון עסקי"
}' "מזרחי טפחות - עסקי")

# ─── 3. Properties ────────────────────────────────────────────────────────────
echo ""
echo "🏠 Creating properties..."

PROP1=$(post "/properties" '{
  "address": "שינקין 8, תל אביב",
  "fileNumber": "TLV-001",
  "type": "RESIDENTIAL",
  "status": "OWNED",
  "city": "תל אביב",
  "country": "Israel",
  "totalArea": 85,
  "estimatedValue": 3500000,
  "purchasePrice": 2800000,
  "purchaseDate": "2018-03-15",
  "constructionYear": 1965,
  "lastRenovationYear": 2020,
  "estimatedRent": 8500,
  "rentalIncome": 8200,
  "gush": "6931",
  "helka": "123",
  "isMortgaged": true,
  "floors": 4,
  "propertyCondition": "GOOD",
  "legalStatus": "REGISTERED",
  "notes": "דירה 3 חדרים בלב תל אביב"
}' "שינקין 8 תל אביב")

PROP2=$(post "/properties" '{
  "address": "הרצל 45, רחובות",
  "fileNumber": "RHV-002",
  "type": "RESIDENTIAL",
  "status": "OWNED",
  "city": "רחובות",
  "country": "Israel",
  "totalArea": 120,
  "estimatedValue": 2200000,
  "purchasePrice": 1600000,
  "purchaseDate": "2015-07-20",
  "constructionYear": 1980,
  "estimatedRent": 6500,
  "rentalIncome": 6500,
  "isMortgaged": true,
  "floors": 3,
  "propertyCondition": "FAIR",
  "legalStatus": "REGISTERED",
  "notes": "דירה 4 חדרים, שותפות עם רחל לוי"
}' "הרצל 45 רחובות")

PROP3=$(post "/properties" '{
  "address": "ויצמן 12, כפר סבא",
  "fileNumber": "KSV-003",
  "type": "RESIDENTIAL",
  "status": "OWNED",
  "city": "כפר סבא",
  "country": "Israel",
  "totalArea": 95,
  "estimatedValue": 1800000,
  "purchasePrice": 1200000,
  "purchaseDate": "2012-11-05",
  "constructionYear": 1990,
  "estimatedRent": 5500,
  "rentalIncome": 5500,
  "isMortgaged": false,
  "floors": 5,
  "propertyCondition": "GOOD",
  "legalStatus": "REGISTERED"
}' "ויצמן 12 כפר סבא")

PROP4=$(post "/properties" '{
  "address": "שד. ירושלים 100, תל אביב",
  "fileNumber": "TLV-004",
  "type": "COMMERCIAL",
  "status": "INVESTMENT",
  "city": "תל אביב",
  "country": "Israel",
  "totalArea": 200,
  "estimatedValue": 5000000,
  "purchasePrice": 3800000,
  "purchaseDate": "2020-01-10",
  "constructionYear": 2005,
  "estimatedRent": 18000,
  "rentalIncome": 17500,
  "isMortgaged": true,
  "floors": 2,
  "propertyCondition": "EXCELLENT",
  "legalStatus": "REGISTERED",
  "notes": "משרדים, קומה 2"
}' "שד ירושלים 100 - מסחרי")

PROP5=$(post "/properties" '{
  "address": "נחלת בנימין 5, תל אביב",
  "fileNumber": "TLV-005",
  "type": "RESIDENTIAL",
  "status": "IN_CONSTRUCTION",
  "city": "תל אביב",
  "country": "Israel",
  "totalArea": 110,
  "estimatedValue": 4200000,
  "purchasePrice": 3100000,
  "purchaseDate": "2023-06-01",
  "constructionYear": 2024,
  "isMortgaged": true,
  "propertyCondition": "EXCELLENT",
  "notes": "פרויקט בנייה חדש, צפי סיום 2025"
}' "נחלת בנימין 5 - בבנייה")

# ─── 4. Ownerships ────────────────────────────────────────────────────────────
echo ""
echo "🤝 Creating ownerships..."

# Prop1: דוד כהן 100%
post "/properties/$PROP1/ownerships" "{
  \"personId\": \"$P1\",
  \"ownershipPercentage\": 100,
  \"ownershipType\": \"REAL\",
  \"startDate\": \"2018-03-15\",
  \"notes\": \"בעלות מלאה\"
}" "בעלות שינקין 8 - דוד כהן"

# Prop2: דוד כהן 50% + רחל לוי 50%
post "/properties/$PROP2/ownerships" "{
  \"personId\": \"$P1\",
  \"ownershipPercentage\": 50,
  \"ownershipType\": \"REAL\",
  \"startDate\": \"2015-07-20\"
}" "בעלות הרצל 45 - דוד כהן 50%"

post "/properties/$PROP2/ownerships" "{
  \"personId\": \"$P2\",
  \"ownershipPercentage\": 50,
  \"ownershipType\": \"REAL\",
  \"startDate\": \"2015-07-20\"
}" "בעלות הרצל 45 - רחל לוי 50%"

# Prop3: רחל לוי 100%
post "/properties/$PROP3/ownerships" "{
  \"personId\": \"$P2\",
  \"ownershipPercentage\": 100,
  \"ownershipType\": \"REAL\",
  \"startDate\": \"2012-11-05\"
}" "בעלות ויצמן 12 - רחל לוי"

# Prop4: נכסים ישראל בעמ 100%
post "/properties/$PROP4/ownerships" "{
  \"personId\": \"$P3\",
  \"ownershipPercentage\": 100,
  \"ownershipType\": \"LEGAL\",
  \"startDate\": \"2020-01-10\"
}" "בעלות שד ירושלים - נכסים ישראל"

# Prop5: דוד כהן 70% + נכסים ישראל 30%
post "/properties/$PROP5/ownerships" "{
  \"personId\": \"$P1\",
  \"ownershipPercentage\": 70,
  \"ownershipType\": \"REAL\",
  \"startDate\": \"2023-06-01\"
}" "בעלות נחלת בנימין - דוד 70%"

post "/properties/$PROP5/ownerships" "{
  \"personId\": \"$P3\",
  \"ownershipPercentage\": 30,
  \"ownershipType\": \"LEGAL\",
  \"startDate\": \"2023-06-01\"
}" "בעלות נחלת בנימין - חברה 30%"

# ─── 5. Mortgages ─────────────────────────────────────────────────────────────
echo ""
echo "🏦 Creating mortgages..."

post "/mortgages" "{
  \"propertyId\": \"$PROP1\",
  \"bank\": \"בנק לאומי\",
  \"loanAmount\": 1800000,
  \"interestRate\": 3.5,
  \"monthlyPayment\": 9200,
  \"bankAccountId\": \"$BA1\",
  \"mortgageOwnerId\": \"$P1\",
  \"payerId\": \"$P1\",
  \"startDate\": \"2018-03-15\",
  \"endDate\": \"2048-03-15\",
  \"status\": \"ACTIVE\",
  \"linkedProperties\": [\"$PROP1\"],
  \"notes\": \"משכנתא ראשונה - שינקין\"
}" "משכנתא שינקין 8"

post "/mortgages" "{
  \"propertyId\": \"$PROP2\",
  \"bank\": \"בנק הפועלים\",
  \"loanAmount\": 900000,
  \"interestRate\": 4.2,
  \"monthlyPayment\": 5800,
  \"bankAccountId\": \"$BA2\",
  \"mortgageOwnerId\": \"$P2\",
  \"payerId\": \"$P1\",
  \"startDate\": \"2015-07-20\",
  \"endDate\": \"2040-07-20\",
  \"status\": \"ACTIVE\",
  \"linkedProperties\": [\"$PROP2\"],
  \"notes\": \"משכנתא רחובות\"
}" "משכנתא הרצל 45"

post "/mortgages" "{
  \"propertyId\": \"$PROP4\",
  \"bank\": \"בנק מזרחי טפחות\",
  \"loanAmount\": 2500000,
  \"interestRate\": 3.8,
  \"monthlyPayment\": 14500,
  \"bankAccountId\": \"$BA3\",
  \"mortgageOwnerId\": \"$P3\",
  \"payerId\": \"$P3\",
  \"startDate\": \"2020-01-10\",
  \"endDate\": \"2045-01-10\",
  \"status\": \"ACTIVE\",
  \"linkedProperties\": [\"$PROP4\"],
  \"notes\": \"משכנתא מסחרי\"
}" "משכנתא שד ירושלים"

post "/mortgages" "{
  \"propertyId\": \"$PROP5\",
  \"bank\": \"בנק דיסקונט\",
  \"loanAmount\": 2200000,
  \"interestRate\": 4.0,
  \"monthlyPayment\": 12000,
  \"mortgageOwnerId\": \"$P1\",
  \"payerId\": \"$P1\",
  \"startDate\": \"2023-06-01\",
  \"endDate\": \"2053-06-01\",
  \"status\": \"ACTIVE\",
  \"linkedProperties\": [\"$PROP5\"],
  \"notes\": \"משכנתא בנייה\"
}" "משכנתא נחלת בנימין"

post "/mortgages" "{
  \"bank\": \"בנק לאומי\",
  \"loanAmount\": 500000,
  \"interestRate\": 5.1,
  \"monthlyPayment\": 3200,
  \"bankAccountId\": \"$BA1\",
  \"mortgageOwnerId\": \"$P1\",
  \"payerId\": \"$P1\",
  \"startDate\": \"2010-01-01\",
  \"endDate\": \"2025-01-01\",
  \"status\": \"PAID_OFF\",
  \"linkedProperties\": [],
  \"notes\": \"הלוואה שכבר שולמה\"
}" "הלוואה ישנה - שולמה"

# ─── 6. Rental Agreements ─────────────────────────────────────────────────────
echo ""
echo "📋 Creating rental agreements..."

RA1=$(post "/leases" "{
  \"propertyId\": \"$PROP1\",
  \"tenantId\": \"$P4\",
  \"monthlyRent\": 8200,
  \"startDate\": \"2024-01-01\",
  \"endDate\": \"2025-12-31\",
  \"status\": \"ACTIVE\",
  \"hasExtensionOption\": true,
  \"extensionUntilDate\": \"2026-12-31\",
  \"extensionMonthlyRent\": 8700,
  \"notes\": \"חוזה שכירות 2 שנים עם אופציה\"
}" "שכירות שינקין - יוסף")

RA2=$(post "/leases" "{
  \"propertyId\": \"$PROP3\",
  \"tenantId\": \"$P5\",
  \"monthlyRent\": 5500,
  \"startDate\": \"2023-07-01\",
  \"endDate\": \"2025-06-30\",
  \"status\": \"ACTIVE\",
  \"hasExtensionOption\": false,
  \"notes\": \"חוזה שכירות 2 שנים\"
}" "שכירות ויצמן - מרים")

post "/leases" "{
  \"propertyId\": \"$PROP2\",
  \"tenantId\": \"$P6\",
  \"monthlyRent\": 6500,
  \"startDate\": \"2021-01-01\",
  \"endDate\": \"2023-12-31\",
  \"status\": \"EXPIRED\",
  \"hasExtensionOption\": false,
  \"notes\": \"חוזה שפג תוקפו\"
}" "שכירות הרצל - שותפות (פג)"

# ─── 7. Property Events ───────────────────────────────────────────────────────
echo ""
echo "📅 Creating property events..."

# Expenses for Prop1
post "/properties/$PROP1/events" '{
  "eventType": "ExpenseEvent",
  "eventDate": "2025-01-15",
  "description": "תיקון צנרת - אינסטלציה",
  "expenseType": "REPAIRS",
  "amount": 3500,
  "affectsPropertyValue": false
}' "הוצאה - תיקון צנרת"

post "/properties/$PROP1/events" '{
  "eventType": "ExpenseEvent",
  "eventDate": "2025-02-01",
  "description": "ביטוח שנתי",
  "expenseType": "INSURANCE",
  "amount": 1800,
  "affectsPropertyValue": false
}' "הוצאה - ביטוח"

post "/properties/$PROP1/events" '{
  "eventType": "ExpenseEvent",
  "eventDate": "2025-02-10",
  "description": "ועד בית - פברואר",
  "expenseType": "MAINTENANCE",
  "amount": 350,
  "affectsPropertyValue": false
}' "הוצאה - ועד בית"

# Expense for Prop2
post "/properties/$PROP2/events" '{
  "eventType": "ExpenseEvent",
  "eventDate": "2025-01-20",
  "description": "שיפוץ מטבח",
  "expenseType": "REPAIRS",
  "amount": 12000,
  "affectsPropertyValue": true
}' "הוצאה - שיפוץ מטבח"

# Expense for Prop4 (commercial)
post "/properties/$PROP4/events" '{
  "eventType": "ExpenseEvent",
  "eventDate": "2025-01-05",
  "description": "ניקיון ותחזוקה חודשית",
  "expenseType": "MAINTENANCE",
  "amount": 2500,
  "affectsPropertyValue": false
}' "הוצאה - תחזוקה מסחרי"

# Planning event for Prop5
post "/properties/$PROP5/events" '{
  "eventType": "PlanningProcessEvent",
  "eventDate": "2024-06-01",
  "description": "אישור תוכנית בנייה",
  "planningStage": "היתר בנייה",
  "developerName": "בנייה אורבנית בעמ",
  "projectedSizeAfter": "110 מ\"ר"
}' "אירוע תכנון - אישור היתר"

# Damage event for Prop3
post "/properties/$PROP3/events" '{
  "eventType": "PropertyDamageEvent",
  "eventDate": "2024-11-20",
  "description": "נזק ממים - דליפה מהמרפסת",
  "damageType": "נזק מים",
  "estimatedDamageCost": 5500
}' "נזק - דליפת מים"

# Rental payment events for RA1
post "/properties/$PROP1/events" "{
  \"eventType\": \"RentalPaymentRequestEvent\",
  \"eventDate\": \"2025-01-01\",
  \"description\": \"דמי שכירות ינואר 2025\",
  \"rentalAgreementId\": \"$RA1\",
  \"month\": 1,
  \"year\": 2025,
  \"amountDue\": 8200,
  \"paymentDate\": \"2025-01-03\",
  \"paymentStatus\": \"PAID\"
}" "תשלום שכירות ינואר 2025"

post "/properties/$PROP1/events" "{
  \"eventType\": \"RentalPaymentRequestEvent\",
  \"eventDate\": \"2025-02-01\",
  \"description\": \"דמי שכירות פברואר 2025\",
  \"rentalAgreementId\": \"$RA1\",
  \"month\": 2,
  \"year\": 2025,
  \"amountDue\": 8200,
  \"paymentDate\": \"2025-02-05\",
  \"paymentStatus\": \"PAID\"
}" "תשלום שכירות פברואר 2025"

post "/properties/$PROP1/events" "{
  \"eventType\": \"RentalPaymentRequestEvent\",
  \"eventDate\": \"2025-03-01\",
  \"description\": \"דמי שכירות מרץ 2025\",
  \"rentalAgreementId\": \"$RA1\",
  \"month\": 3,
  \"year\": 2025,
  \"amountDue\": 8200,
  \"paymentStatus\": \"OVERDUE\"
}" "תשלום שכירות מרץ 2025 - באיחור"

echo ""
echo "✅ Done! Seed data inserted successfully."
echo ""
echo "Summary:"
echo "  👤 6 persons"
echo "  🏦 3 bank accounts"
echo "  🏠 5 properties"
echo "  🤝 7 ownerships"
echo "  💰 5 mortgages"
echo "  📋 3 rental agreements"
echo "  📅 10 property events"
