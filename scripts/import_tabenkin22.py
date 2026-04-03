#!/usr/bin/env python3
"""
Import טבנקין 22, גבעתיים into Firestore.

Data source: data/imports/properties_from_excel.csv (row 14, fileNumber 11)
             data/imports/leases_from_excel.csv    (row 9,  fileNumber 157/318)

Creates:
  1. Property  – דירת גג, טבנקין 22, גבעתיים
  2. Person    – יצחק ואילנה נטוביץ (owner)
  3. Ownership – links owner → property
  4. Person    – סיוון ויניב סימן טוב (tenant)
  5. Rental Agreement – 157/318, rent 16,000 ₪, 2020-08-01 → 2025-08-31
"""

import firebase_admin
from firebase_admin import credentials, firestore
import uuid
import os
import datetime

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVICE_ACCOUNT = os.path.join(PROJECT_ROOT, "config", "firebase-service-account.json")

# ── IDs ──────────────────────────────────────────────────────────────────────
PROPERTY_ID   = str(uuid.uuid4())
OWNER_ID      = str(uuid.uuid4())
OWNERSHIP_ID  = str(uuid.uuid4())
TENANT_ID     = str(uuid.uuid4())
AGREEMENT_ID  = str(uuid.uuid4())

# ── 1. Property ───────────────────────────────────────────────────────────────
# Row 14 of properties_from_excel.csv (fileNumber=11)
PROPERTY = {
    "id":                      PROPERTY_ID,
    "address":                 "טבנקין 22, גבעתיים",
    "fileNumber":              "11",
    "type":                    "RESIDENTIAL",
    "status":                  "OWNED",
    "country":                 "Israel",
    "city":                    "גבעתיים",
    "totalArea":               280.0,        # 280 מ"ר דירת גג
    "balconySizeSqm":          150.0,        # 150 מ"ר מרפסת
    "floors":                  2,            # 2 קומות (קומות 5+6)
    "isMortgaged":             False,
    "isPartialOwnership":      False,
    "isSold":                  False,
    "notes":                   'דירת גג (2 קומות) שטח 280 מ"ר + 150 מ"ר מרפסת, קומות 5+6',
    "deletedAt":               None,
    "createdAt":               firestore.SERVER_TIMESTAMP,
    "updatedAt":               firestore.SERVER_TIMESTAMP,
}

# ── 2. Owner (Person) ─────────────────────────────────────────────────────────
OWNER = {
    "id":        OWNER_ID,
    "name":      "יצחק ואילנה נטוביץ",
    "type":      "INDIVIDUAL",
    "deletedAt": None,
    "createdAt": firestore.SERVER_TIMESTAMP,
    "updatedAt": firestore.SERVER_TIMESTAMP,
}

# ── 3. Ownership ──────────────────────────────────────────────────────────────
OWNERSHIP = {
    "id":                OWNERSHIP_ID,
    "propertyId":        PROPERTY_ID,
    "personId":          OWNER_ID,
    "ownershipType":     "FULL",
    "ownershipPercentage": 100.0,
    "deletedAt":         None,
    "createdAt":         firestore.SERVER_TIMESTAMP,
    "updatedAt":         firestore.SERVER_TIMESTAMP,
}

# ── 4. Tenant (Person) ────────────────────────────────────────────────────────
# Row 9 of leases_from_excel.csv
TENANT = {
    "id":        TENANT_ID,
    "name":      "סיוון ויניב סימן טוב",
    "type":      "INDIVIDUAL",
    "email":     "sivansimantovm@gmail.com",
    "phone":     "054-4477517",
    "deletedAt": None,
    "createdAt": firestore.SERVER_TIMESTAMP,
    "updatedAt": firestore.SERVER_TIMESTAMP,
}

# ── 5. Rental Agreement ───────────────────────────────────────────────────────
# fileNumber 157/318, apt 21, floor 5+6, 3.5 rooms, 16,000 ₪/month
# 2020-08-01 → 2025-08-31  |  notes: בטיפול עו"ד פרישטיק
AGREEMENT = {
    "id":                 AGREEMENT_ID,
    "propertyId":         PROPERTY_ID,
    "tenantId":           TENANT_ID,
    "fileNumber":         "157/318",
    "monthlyRent":        16000.0,
    "startDate":          datetime.datetime(2020, 8, 1, tzinfo=datetime.timezone.utc),
    "endDate":            datetime.datetime(2025, 8, 31, tzinfo=datetime.timezone.utc),
    "status":             "EXPIRED",   # end date is in the past
    "hasExtensionOption": False,
    "notes":              'בטיפול עו"ד פרישטיק',
    "apartmentNumber":    "21",
    "floor":              "5+6",
    "roomCount":          3.5,
    "deletedAt":          None,
    "createdAt":          firestore.SERVER_TIMESTAMP,
    "updatedAt":          firestore.SERVER_TIMESTAMP,
}


def main():
    cred = credentials.Certificate(SERVICE_ACCOUNT)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    print("=" * 60)
    print("📦 Importing: טבנקין 22, גבעתיים")
    print("=" * 60)

    # 1. Property
    db.collection("properties").document(PROPERTY_ID).set(PROPERTY)
    print(f"✅ Property       → properties/{PROPERTY_ID}")

    # 2. Owner
    db.collection("persons").document(OWNER_ID).set(OWNER)
    print(f"✅ Owner (Person)  → persons/{OWNER_ID}")

    # 3. Ownership
    db.collection("ownerships").document(OWNERSHIP_ID).set(OWNERSHIP)
    print(f"✅ Ownership       → ownerships/{OWNERSHIP_ID}")

    # 4. Tenant
    db.collection("persons").document(TENANT_ID).set(TENANT)
    print(f"✅ Tenant (Person) → persons/{TENANT_ID}")

    # 5. Rental Agreement
    db.collection("rental-agreements").document(AGREEMENT_ID).set(AGREEMENT)
    print(f"✅ Rental Agreement→ rental-agreements/{AGREEMENT_ID}")

    print()
    print("=" * 60)
    print("🎉 All done!  טבנקין 22 imported successfully.")
    print("=" * 60)
    print()
    print("Summary:")
    print(f"  Property ID  : {PROPERTY_ID}")
    print(f"  Owner ID     : {OWNER_ID}")
    print(f"  Tenant ID    : {TENANT_ID}")
    print(f"  Agreement ID : {AGREEMENT_ID}")
    print(f"  File Number  : 157/318")
    print(f"  Monthly Rent : ₪16,000")
    print(f"  Dates        : 2020-08-01 → 2025-08-31 (EXPIRED)")


if __name__ == "__main__":
    main()
