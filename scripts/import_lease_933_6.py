"""
Import lease row 933/6 (לביא 6 גבעתיים, יעל שייה גטניו) into Firestore.
Creates the tenant as a Person, then creates the RentalAgreement.
"""

import json
import uuid
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore

SERVICE_ACCOUNT = "/Users/aviad.natovich/personal/rentApplication/config/firebase-service-account.json"

# ── Data from CSV row 6 ────────────────────────────────────────────────────────
CSV_ROW = {
    "fileNumber":       "933/6",
    "propertyAddress":  "לביא 6 גבעתיים",
    "apartmentNumber":  "4",
    "floor":            "2",
    "roomCount":        "2",
    "tenantName":       "יעל שייה גטניו",
    "tenantEmail":      "",
    "tenantPhone":      "",
    # startDate is empty in CSV; endDate column contains "שיק עד 4/26" (payment note)
    "startDate":        None,
    "endDate":          "2026-04-30",   # interpreting "שיק עד 4/26" as April 2026
    "monthlyRent":      5000.0,
    "paymentNote":      "שיק עד 4/26",
    "notes":            "שיק עד 4/26 | בטיפול יעקב לאובר שיק אחת לחודשיים",
}


def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT)
        firebase_admin.initialize_app(cred)
    return firestore.client()


def find_property(db, file_number: str):
    docs = db.collection("properties") \
             .where("fileNumber", "==", file_number) \
             .where("deletedAt", "==", None) \
             .stream()
    results = list(docs)
    if not results:
        return None
    doc = results[0]
    return {"id": doc.id, **doc.to_dict()}


def find_or_create_person(db, name: str, email: str, phone: str):
    # Search existing persons by name
    docs = db.collection("persons") \
             .where("deletedAt", "==", None) \
             .stream()
    for doc in docs:
        d = doc.to_dict()
        if d.get("name", "").strip() == name.strip():
            print(f"  ✅ Person already exists: {name} (id={doc.id})")
            return {"id": doc.id, **d}

    # Create new person
    person_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    person_data = {
        "name":      name,
        "type":      "INDIVIDUAL",
        "email":     email or None,
        "phone":     phone or None,
        "address":   None,
        "idNumber":  None,
        "notes":     None,
        "deletedAt": None,
        "createdAt": now,
        "updatedAt": now,
    }
    db.collection("persons").document(person_id).set(person_data)
    print(f"  ✅ Created person: {name} (id={person_id})")
    return {"id": person_id, **person_data}


def lease_exists(db, property_id: str, tenant_id: str):
    docs = db.collection("rentalAgreements") \
             .where("propertyId", "==", property_id) \
             .where("tenantId",   "==", tenant_id) \
             .where("deletedAt",  "==", None) \
             .stream()
    results = list(docs)
    return len(results) > 0, results[0].id if results else None


def create_lease(db, property_id: str, tenant_id: str, row: dict):
    lease_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    # endDate is "2026-04-30"; startDate unknown → use 2020-01-01 as placeholder
    start = datetime(2020, 1, 1, tzinfo=timezone.utc)   # unknown, best guess
    end   = datetime(2026, 4, 30, tzinfo=timezone.utc)

    lease_data = {
        "propertyId":          property_id,
        "tenantId":            tenant_id,
        "monthlyRent":         row["monthlyRent"],
        "startDate":           start,
        "endDate":             end,
        "status":              "ACTIVE",
        "hasExtensionOption":  False,
        "extensionUntilDate":  None,
        "extensionMonthlyRent": None,
        "notes":               row["notes"],
        "deletedAt":           None,
        "createdAt":           now,
        "updatedAt":           now,
    }
    db.collection("rentalAgreements").document(lease_id).set(lease_data)
    print(f"  ✅ Created rental agreement (id={lease_id})")
    return {"id": lease_id, **lease_data}


def main():
    print("🔥 Connecting to Firebase...")
    db = init_firebase()

    print(f"\n🔍 Looking for property: {CSV_ROW['fileNumber']} — {CSV_ROW['propertyAddress']}")
    prop = find_property(db, CSV_ROW["fileNumber"])
    if not prop:
        print(f"  ❌ Property {CSV_ROW['fileNumber']} not found in Firestore!")
        print("     Make sure the property is imported first.")
        return
    print(f"  ✅ Found property: {prop.get('address','')} (id={prop['id']})")

    print(f"\n👤 Finding or creating tenant: {CSV_ROW['tenantName']}")
    tenant = find_or_create_person(
        db,
        name=CSV_ROW["tenantName"],
        email=CSV_ROW["tenantEmail"],
        phone=CSV_ROW["tenantPhone"],
    )

    print(f"\n📋 Checking if lease already exists...")
    exists, existing_id = lease_exists(db, prop["id"], tenant["id"])
    if exists:
        print(f"  ⚠️  Lease already exists (id={existing_id}), skipping creation.")
        return

    print(f"\n📝 Creating rental agreement...")
    print(f"   Property:    {CSV_ROW['propertyAddress']} (דירה {CSV_ROW['apartmentNumber']})")
    print(f"   Tenant:      {CSV_ROW['tenantName']}")
    print(f"   Rent:        ₪{CSV_ROW['monthlyRent']:,.0f}/month")
    print(f"   End date:    {CSV_ROW['endDate']} (from '{CSV_ROW['paymentNote']}')")
    print(f"   Start date:  unknown → set to 2020-01-01 (update manually if needed)")
    print(f"   Notes:       {CSV_ROW['notes']}")

    lease = create_lease(db, prop["id"], tenant["id"], CSV_ROW)

    print("\n" + "="*60)
    print("✅ Import complete!")
    print(f"   Person ID:        {tenant['id']}")
    print(f"   Rental Agmt ID:   {lease['id']}")
    print("="*60)
    print("\n⚠️  Note: startDate was set to 2020-01-01 (unknown in source data).")
    print("   Please update it manually in the app if the actual start date is known.")


if __name__ == "__main__":
    main()
