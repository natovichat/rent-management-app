#!/usr/bin/env python3
"""
Insert 1 property from properties_import.csv into Firestore.
Uses Firebase Admin SDK directly (bypasses the REST API auth layer).
"""

import firebase_admin
from firebase_admin import credentials, firestore
import uuid
import datetime
import json
import os

# ── Config ──────────────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVICE_ACCOUNT = os.path.join(PROJECT_ROOT, "config", "firebase-service-account.json")

# ── Property data (Row 1 from properties_import.csv) ────────────────────────
# Address: "רח' לביא 6 רמת גן"
# Cross-referenced with properties_from_excel.csv row 2:
#   50% מזכויות בדירה ברח' לביא 6 רמת גן (דירה 60 מטר שתוגדל ל100 מטר) – יצחק נטוביץ

PROPERTY_DATA = {
    "id": str(uuid.uuid4()),  # UUID like the backend uses
    "address": "רח' לביא 6, רמת גן",
    "fileNumber": "1",
    "type": "RESIDENTIAL",
    "status": "IN_CONSTRUCTION",
    "country": "Israel",
    "city": "רמת גן",
    "totalArea": 100.0,
    "estimatedValue": 800000.0,
    "gush": "6158",
    "helka": "371-376",
    "isMortgaged": False,
    "isPartialOwnership": True,
    "sharedOwnershipPercentage": 50.0,
    "notes": (
        "50% יצחק נטוביץ, 50% אריאלה לאובר. "
        "גוש 6158 חלקות 371-376. "
        "פינוי בינוי חברת קרסו. לא משועבדת. "
        "גודל נוכחי 60 מ\"ר, ישתגדל ל-100 מ\"ר לאחר הבנייה."
    ),
    "isSold": False,
    "deletedAt": None,   # Required: backend query filters where('deletedAt', '==', null)
    "createdAt": firestore.SERVER_TIMESTAMP,
    "updatedAt": firestore.SERVER_TIMESTAMP,
}


def main():
    # Init Firebase Admin SDK
    cred = credentials.Certificate(SERVICE_ACCOUNT)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    prop_id = PROPERTY_DATA["id"]

    print(f"🏠 Inserting property: {PROPERTY_DATA['address']}")
    print(f"   ID     : {prop_id}")
    print(f"   Type   : {PROPERTY_DATA['type']}")
    print(f"   Status : {PROPERTY_DATA['status']}")
    print(f"   City   : {PROPERTY_DATA['city']}")
    print(f"   Area   : {PROPERTY_DATA['totalArea']} m²")
    print(f"   Value  : ₪{PROPERTY_DATA['estimatedValue']:,.0f}")
    print()

    doc_ref = db.collection("properties").document(prop_id)
    doc_ref.set(PROPERTY_DATA)

    print(f"✅ Property saved to Firestore → properties/{prop_id}")

    # Verify read-back
    saved = doc_ref.get()
    if saved.exists:
        data = saved.to_dict()
        print(f"✅ Verified: address='{data.get('address')}', status='{data.get('status')}'")
    else:
        print("⚠️  Could not read back the document")


if __name__ == "__main__":
    main()
