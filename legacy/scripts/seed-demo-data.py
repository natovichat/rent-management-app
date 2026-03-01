#!/usr/bin/env python3
"""
Seed demo data for the rent application.
Run: python3 scripts/seed-demo-data.py
"""

import requests
import json
import sys

BASE_URL = "http://localhost:3000/api"

def post(endpoint, data, desc=""):
    """POST data to endpoint, return the created object."""
    try:
        r = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=10)
        if r.status_code in (200, 201):
            obj = r.json()
            print(f"  ✅ {desc or endpoint} (id: {obj.get('id', '?')[:8]}...)")
            return obj
        else:
            print(f"  ❌ {desc or endpoint}: {r.status_code} - {r.text[:200]}")
            return None
    except Exception as e:
        print(f"  ❌ {desc or endpoint}: {e}")
        return None

def get_or_create(endpoint, data, unique_field, desc=""):
    """Try to create, return existing if conflict."""
    result = post(endpoint, data, desc)
    if result:
        return result
    # Fetch existing
    try:
        r = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        items = r.json()
        if isinstance(items, dict) and "data" in items:
            items = items["data"]
        for item in items:
            if item.get(unique_field) == data.get(unique_field):
                return item
    except Exception:
        pass
    return None


def main():
    print("🌱 Seeding demo data...\n")

    # ── 1. Persons ──────────────────────────────────────────────────────────────
    print("👤 Creating persons...")

    p1 = post("/persons", {
        "name": "דוד כהן",
        "type": "INDIVIDUAL",
        "idNumber": "123456789",
        "email": "david.cohen@gmail.com",
        "phone": "050-1234567",
        "address": "רחוב הרצל 15, תל אביב",
        "notes": "בעלים ראשי של הנכסים"
    }, "דוד כהן")

    p2 = post("/persons", {
        "name": "רחל לוי",
        "type": "INDIVIDUAL",
        "idNumber": "987654321",
        "email": "rachel.levi@yahoo.com",
        "phone": "052-9876543",
        "address": "שדרות רוטשילד 8, תל אביב",
        "notes": "שותפה בנכס ברחובות"
    }, "רחל לוי")

    p3 = post("/persons", {
        "name": "נכסים ישראל בעמ",
        "type": "COMPANY",
        "idNumber": "515123456",
        "email": "info@nadlan-israel.co.il",
        "phone": "03-5551234",
        "address": "אבן גבירול 50, תל אביב",
        "notes": "חברת נדלן"
    }, "נכסים ישראל בעמ")

    p4 = post("/persons", {
        "name": "יוסף אברהם",
        "type": "INDIVIDUAL",
        "idNumber": "345678901",
        "email": "yosef.avraham@hotmail.com",
        "phone": "054-3456789",
        "address": "הנביאים 22, ירושלים",
        "notes": "שוכר - שינקין 8"
    }, "יוסף אברהם - שוכר")

    p5 = post("/persons", {
        "name": "מרים שפירא",
        "type": "INDIVIDUAL",
        "idNumber": "567890123",
        "email": "miriam.shapira@gmail.com",
        "phone": "053-5678901",
        "address": "ביאליק 12, רמת גן",
        "notes": "שוכרת - ויצמן 12"
    }, "מרים שפירא - שוכרת")

    p6 = post("/persons", {
        "name": "שותפות כהן-לוי",
        "type": "PARTNERSHIP",
        "idNumber": "580234567",
        "email": "partnership@cohenlevi.co.il",
        "phone": "03-6667890",
        "address": "המסגר 30, תל אביב",
        "notes": "שותפות לנכסים מסחריים"
    }, "שותפות כהן-לוי")

    persons = [p for p in [p1, p2, p3, p4, p5, p6] if p]

    # ── 2. Bank Accounts ────────────────────────────────────────────────────────
    print("\n🏦 Creating bank accounts...")

    ba1 = get_or_create("/bank-accounts", {
        "bankName": "בנק לאומי",
        "branchNumber": "800",
        "accountNumber": "12345678",
        "accountType": "PERSONAL_CHECKING",
        "accountHolder": "דוד כהן",
        "notes": "חשבון ראשי לדמי שכירות"
    }, "bankName", "בנק לאומי - עו\"ש")

    ba2 = get_or_create("/bank-accounts", {
        "bankName": "בנק הפועלים",
        "branchNumber": "512",
        "accountNumber": "87654321",
        "accountType": "PERSONAL_SAVINGS",
        "accountHolder": "דוד כהן",
        "notes": "חשבון חיסכון"
    }, "bankName", "בנק הפועלים - חיסכון")

    ba3 = get_or_create("/bank-accounts", {
        "bankName": "בנק מזרחי טפחות",
        "branchNumber": "232",
        "accountNumber": "11223344",
        "accountType": "BUSINESS",
        "accountHolder": "נכסים ישראל בעמ",
        "notes": "חשבון עסקי של החברה"
    }, "bankName", "מזרחי טפחות - עסקי")

    # ── 3. Properties ────────────────────────────────────────────────────────────
    print("\n🏠 Creating properties...")

    prop1 = post("/properties", {
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
        "isMortgaged": True,
        "floors": 4,
        "propertyCondition": "GOOD",
        "legalStatus": "REGISTERED",
        "notes": "דירה 3 חדרים בלב תל אביב"
    }, "שינקין 8, תל אביב")

    prop2 = post("/properties", {
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
        "isMortgaged": True,
        "floors": 3,
        "propertyCondition": "FAIR",
        "legalStatus": "REGISTERED",
        "notes": "דירה 4 חדרים, שותפות עם רחל לוי"
    }, "הרצל 45, רחובות")

    prop3 = post("/properties", {
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
        "isMortgaged": False,
        "floors": 5,
        "propertyCondition": "GOOD",
        "legalStatus": "REGISTERED"
    }, "ויצמן 12, כפר סבא")

    prop4 = post("/properties", {
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
        "isMortgaged": True,
        "floors": 2,
        "propertyCondition": "EXCELLENT",
        "legalStatus": "REGISTERED",
        "notes": "משרדים, קומה 2"
    }, "שד. ירושלים 100 - מסחרי")

    prop5 = post("/properties", {
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
        "isMortgaged": True,
        "propertyCondition": "EXCELLENT",
        "notes": "פרויקט בנייה חדש, צפי סיום 2025"
    }, "נחלת בנימין 5 - בבנייה")

    # ── 4. Ownerships ────────────────────────────────────────────────────────────
    print("\n🤝 Creating ownerships...")

    if prop1 and p1:
        post(f"/properties/{prop1['id']}/ownerships", {
            "personId": p1["id"],
            "ownershipPercentage": 100,
            "ownershipType": "REAL",
            "startDate": "2018-03-15",
            "notes": "בעלות מלאה"
        }, "שינקין 8 - דוד כהן 100%")

    if prop2 and p1:
        post(f"/properties/{prop2['id']}/ownerships", {
            "personId": p1["id"],
            "ownershipPercentage": 50,
            "ownershipType": "REAL",
            "startDate": "2015-07-20"
        }, "הרצל 45 - דוד כהן 50%")

    if prop2 and p2:
        post(f"/properties/{prop2['id']}/ownerships", {
            "personId": p2["id"],
            "ownershipPercentage": 50,
            "ownershipType": "REAL",
            "startDate": "2015-07-20"
        }, "הרצל 45 - רחל לוי 50%")

    if prop3 and p2:
        post(f"/properties/{prop3['id']}/ownerships", {
            "personId": p2["id"],
            "ownershipPercentage": 100,
            "ownershipType": "REAL",
            "startDate": "2012-11-05"
        }, "ויצמן 12 - רחל לוי 100%")

    if prop4 and p3:
        post(f"/properties/{prop4['id']}/ownerships", {
            "personId": p3["id"],
            "ownershipPercentage": 100,
            "ownershipType": "LEGAL",
            "startDate": "2020-01-10"
        }, "שד. ירושלים 100 - נכסים ישראל 100%")

    if prop5 and p1:
        post(f"/properties/{prop5['id']}/ownerships", {
            "personId": p1["id"],
            "ownershipPercentage": 70,
            "ownershipType": "REAL",
            "startDate": "2023-06-01"
        }, "נחלת בנימין 5 - דוד כהן 70%")

    if prop5 and p3:
        post(f"/properties/{prop5['id']}/ownerships", {
            "personId": p3["id"],
            "ownershipPercentage": 30,
            "ownershipType": "LEGAL",
            "startDate": "2023-06-01"
        }, "נחלת בנימין 5 - נכסים ישראל 30%")

    # ── 5. Mortgages ─────────────────────────────────────────────────────────────
    print("\n💰 Creating mortgages...")

    mort_common = {"linkedProperties": []}

    if prop1 and p1 and ba1:
        post("/mortgages", {
            "propertyId": prop1["id"],
            "bank": "בנק לאומי",
            "loanAmount": 1800000,
            "interestRate": 3.5,
            "monthlyPayment": 9200,
            "bankAccountId": ba1["id"],
            "mortgageOwnerId": p1["id"],
            "payerId": p1["id"],
            "startDate": "2018-03-15",
            "endDate": "2048-03-15",
            "status": "ACTIVE",
            "linkedProperties": [prop1["id"]],
            "notes": "משכנתא ראשונה - שינקין 8"
        }, "משכנתא שינקין 8")

    if prop2 and p1 and p2 and ba2:
        post("/mortgages", {
            "propertyId": prop2["id"],
            "bank": "בנק הפועלים",
            "loanAmount": 900000,
            "interestRate": 4.2,
            "monthlyPayment": 5800,
            "bankAccountId": ba2["id"],
            "mortgageOwnerId": p2["id"],
            "payerId": p1["id"],
            "startDate": "2015-07-20",
            "endDate": "2040-07-20",
            "status": "ACTIVE",
            "linkedProperties": [prop2["id"]],
            "notes": "משכנתא הרצל 45 - רחובות"
        }, "משכנתא הרצל 45")

    if prop4 and p3 and ba3:
        post("/mortgages", {
            "propertyId": prop4["id"],
            "bank": "בנק מזרחי טפחות",
            "loanAmount": 2500000,
            "interestRate": 3.8,
            "monthlyPayment": 14500,
            "bankAccountId": ba3["id"],
            "mortgageOwnerId": p3["id"],
            "payerId": p3["id"],
            "startDate": "2020-01-10",
            "endDate": "2045-01-10",
            "status": "ACTIVE",
            "linkedProperties": [prop4["id"]],
            "notes": "משכנתא נכס מסחרי"
        }, "משכנתא שד. ירושלים")

    if prop5 and p1:
        post("/mortgages", {
            "propertyId": prop5["id"],
            "bank": "בנק דיסקונט",
            "loanAmount": 2200000,
            "interestRate": 4.0,
            "monthlyPayment": 12000,
            "mortgageOwnerId": p1["id"],
            "payerId": p1["id"],
            "startDate": "2023-06-01",
            "endDate": "2053-06-01",
            "status": "ACTIVE",
            "linkedProperties": [prop5["id"]],
            "notes": "משכנתא בנייה חדשה"
        }, "משכנתא נחלת בנימין")

    if p1 and ba1:
        post("/mortgages", {
            "bank": "בנק לאומי",
            "loanAmount": 500000,
            "interestRate": 5.1,
            "monthlyPayment": 3200,
            "bankAccountId": ba1["id"],
            "mortgageOwnerId": p1["id"],
            "payerId": p1["id"],
            "startDate": "2010-01-01",
            "endDate": "2025-01-01",
            "status": "PAID_OFF",
            "linkedProperties": [],
            "notes": "הלוואה ישנה - שולמה במלואה"
        }, "הלוואה ישנה - שולמה")

    # ── 6. Rental Agreements ─────────────────────────────────────────────────────
    print("\n📋 Creating rental agreements...")

    ra1 = None
    ra2 = None

    if prop1 and p4:
        ra1 = post("/rental-agreements", {
            "propertyId": prop1["id"],
            "tenantId": p4["id"],
            "monthlyRent": 8200,
            "startDate": "2024-01-01",
            "endDate": "2025-12-31",
            "status": "ACTIVE",
            "hasExtensionOption": True,
            "extensionUntilDate": "2026-12-31",
            "extensionMonthlyRent": 8700,
            "notes": "חוזה שכירות 2 שנים עם אופציה להארכה"
        }, "שכירות שינקין 8 - יוסף אברהם")

    if prop3 and p5:
        ra2 = post("/rental-agreements", {
            "propertyId": prop3["id"],
            "tenantId": p5["id"],
            "monthlyRent": 5500,
            "startDate": "2023-07-01",
            "endDate": "2025-06-30",
            "status": "ACTIVE",
            "hasExtensionOption": False,
            "notes": "חוזה שכירות 2 שנים"
        }, "שכירות ויצמן 12 - מרים שפירא")

    if prop2 and p6:
        post("/rental-agreements", {
            "propertyId": prop2["id"],
            "tenantId": p6["id"],
            "monthlyRent": 6500,
            "startDate": "2021-01-01",
            "endDate": "2023-12-31",
            "status": "EXPIRED",
            "hasExtensionOption": False,
            "notes": "חוזה שפג תוקפו"
        }, "שכירות הרצל 45 - שותפות (פג)")

    if prop4 and p6:
        post("/rental-agreements", {
            "propertyId": prop4["id"],
            "tenantId": p6["id"],
            "monthlyRent": 17500,
            "startDate": "2022-02-01",
            "endDate": "2026-01-31",
            "status": "ACTIVE",
            "hasExtensionOption": True,
            "extensionUntilDate": "2028-01-31",
            "extensionMonthlyRent": 19000,
            "notes": "חוזה שכירות מסחרי - 4 שנים"
        }, "שכירות מסחרית שד. ירושלים")

    # ── 7. Property Events ────────────────────────────────────────────────────────
    print("\n📅 Creating property events...")

    def expense(prop_id, date, desc, expense_type, amount, affects_value=False):
        return post(f"/properties/{prop_id}/events/expense", {
            "eventDate": date,
            "description": desc,
            "expenseType": expense_type,
            "amount": amount,
            "affectsPropertyValue": affects_value
        }, f"הוצאה - {desc}")

    def damage(prop_id, date, desc, damage_type, cost):
        return post(f"/properties/{prop_id}/events/property-damage", {
            "eventDate": date,
            "description": desc,
            "damageType": damage_type,
            "estimatedDamageCost": cost
        }, f"נזק - {desc}")

    def planning(prop_id, date, desc, stage, developer, size_after):
        return post(f"/properties/{prop_id}/events/planning-process", {
            "eventDate": date,
            "description": desc,
            "planningStage": stage,
            "developerName": developer,
            "projectedSizeAfter": size_after
        }, f"תכנון - {desc}")

    def rental_payment(prop_id, ra_id, date, desc, month, year, amount, status, payment_date=None):
        data = {
            "eventDate": date,
            "description": desc,
            "rentalAgreementId": ra_id,
            "month": month,
            "year": year,
            "amountDue": amount,
            "paymentStatus": status
        }
        if payment_date:
            data["paymentDate"] = payment_date
        return post(f"/properties/{prop_id}/events/rental-payment", data, f"שכירות - {desc}")

    if prop1:
        expense(prop1['id'], "2025-01-15", "תיקון צנרת", "REPAIRS", 3500)
        expense(prop1['id'], "2025-02-01", "ביטוח שנתי", "INSURANCE", 1800)
        expense(prop1['id'], "2025-02-10", "ועד בית פברואר", "MAINTENANCE", 350)
        expense(prop1['id'], "2025-03-01", "ועד בית מרץ", "MAINTENANCE", 350)

        if ra1:
            rental_payment(prop1['id'], ra1['id'], "2025-01-01", "שכירות ינואר 2025", 1, 2025, 8200, "PAID", "2025-01-03")
            rental_payment(prop1['id'], ra1['id'], "2025-02-01", "שכירות פברואר 2025", 2, 2025, 8200, "PAID", "2025-02-05")
            rental_payment(prop1['id'], ra1['id'], "2025-03-01", "שכירות מרץ 2025", 3, 2025, 8200, "OVERDUE")

    if prop2:
        expense(prop2['id'], "2025-01-20", "שיפוץ מטבח", "REPAIRS", 12000, True)
        expense(prop2['id'], "2025-02-15", "ארנונה רבעון 1", "TAX", 1650)

    if prop3:
        damage(prop3['id'], "2024-11-20", "דליפה מהמרפסת", "נזק מים", 5500)

        if ra2:
            rental_payment(prop3['id'], ra2['id'], "2025-01-01", "שכירות ינואר 2025", 1, 2025, 5500, "PAID", "2025-01-02")
            rental_payment(prop3['id'], ra2['id'], "2025-02-01", "שכירות פברואר 2025", 2, 2025, 5500, "PAID", "2025-02-04")

    if prop4:
        expense(prop4['id'], "2025-01-05", "תחזוקה חודשית", "MAINTENANCE", 2500)
        expense(prop4['id'], "2025-01-10", "ביטוח נכס מסחרי", "INSURANCE", 4200)

    if prop5:
        planning(prop5['id'], "2024-06-01", "אישור תוכנית בנייה", "היתר בנייה", "בנייה אורבנית בעמ", "110 מ\"ר")
        planning(prop5['id'], "2024-12-01", "התקדמות בנייה - שלד", "שלד", "בנייה אורבנית בעמ", "110 מ\"ר")

    print("\n" + "="*50)
    print("✅ Done! Summary:")
    print(f"  👤 {len(persons)} persons")
    print(f"  🏦 3 bank accounts")
    print(f"  🏠 5 properties")
    print(f"  🤝 7 ownerships")
    print(f"  💰 5 mortgages")
    print(f"  📋 4 rental agreements")
    print(f"  📅 15 property events")
    print("="*50)

if __name__ == "__main__":
    main()
