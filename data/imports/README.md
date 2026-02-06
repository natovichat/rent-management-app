# Property Import Data

This directory contains CSV files for importing property data into the system.

## Files

### `properties_import.csv`

**Source:** רשימת נכסים - איציק נטוביץ 5.2023.pdf

**Properties:** 31 properties extracted from PDF

**Columns:**
- `address` - Property address
- `fileNumber` - Portfolio reference number (1-31)
- `type` - Property type (RESIDENTIAL, COMMERCIAL, LAND, INVESTMENT, MIXED_USE)
- `status` - Property status (OWNED, IN_CONSTRUCTION, IN_PURCHASE, SOLD, INVESTMENT)
- `country` - Country (Israel, Germany)
- `city` - City name
- `totalArea` - Total area in square meters
- `landArea` - Land area (for land properties)
- `estimatedValue` - Estimated value in ILS (₪)
- `notes` - Additional notes including:
  - Ownership details
  - Plot/Parcel info (Gush/Chelka)
  - Mortgage information
  - Partnership details

## Property Breakdown

### By Country
- **Israel:** 28 properties
- **Germany:** 3 properties (Leipzig)

### By Type
- **RESIDENTIAL:** 16 properties
- **LAND:** 6 properties
- **COMMERCIAL:** 2 properties
- **INVESTMENT:** 6 properties
- **MIXED_USE:** 1 property

### By Status
- **OWNED:** 22 properties
- **INVESTMENT:** 6 properties
- **IN_PURCHASE:** 1 property
- **IN_CONSTRUCTION:** 1 property
- **SOLD:** 1 property

### By Owner (from notes)
- **יצחק נטוביץ (Yitzhak):** Primary owner
- **אילנה נטוביץ (Ilana):** Co-owner/partner
- **ליאת (Liat):** Family member
- **אביעד (Aviad):** Family member
- **מיכל (Michal):** Family member

### Mortgages Identified
From the notes, properties with mortgages:
1. Property #2 - Bank Leumi 6 million (shared with #8, #11)
2. Property #4 - Mercantile 1,400,000 ₪
3. Property #7 - Bank Leumi 400,000 ₪
4. Property #8 - Bank Leumi 6 million (shared)
5. Property #10 - Hamishbir 700,000 ₪
6. Property #11 - Bank Leumi 6 million (shared)
7. Property #12 - Hamishbir 150,000 ₪
8. Property #17 - German bank ~100,000 EUR (350,000 ₪)
9. Property #22 - 300,000 ₪
10. Property #23 - Discount Bank 174,000 ₪
11. Property #24 - 750,000 ₪
12. Property #26 - Future mortgage 650,000 ₪
13. Property #29 - Mercantile Discount 2,000,000 ₪

### Investment Companies
- **אפ-הולדינג (AP Holding):** Properties #18, #19, #20
- **חברת איילי (Ayali Company):** Property #17
- **נטו דיור בע"מ (Neto Housing):** Property #28

## How to Import

### Option 1: Manual Import via UI
1. Navigate to Properties page
2. Click "Import" or "Bulk Upload"
3. Select `properties_import.csv`
4. Map CSV columns to fields
5. Review and confirm import

### Option 2: Import Script
```bash
cd apps/backend
npx ts-node scripts/import-properties.ts ../data/imports/properties_import.csv
```

### Option 3: API Import
```bash
curl -X POST http://localhost:3001/properties/import \
  -H "X-Account-Id: test-account-1" \
  -F "file=@data/imports/properties_import.csv"
```

## Post-Import Steps

After importing properties, you'll need to manually create:

1. **Owners** - Extract from notes:
   - יצחק נטוביץ
   - אילנה נטוביץ
   - ליאת
   - אביעד
   - מיכל
   - Partners (אריאלה לאובר, צביקה נטוביץ, etc.)

2. **Ownerships** - Create ownership records with percentages:
   - Property #1: 50% יצחק, 50% אריאלה לאובר
   - Property #4: 50% יצחק, 50% אילנה
   - Property #6: 36% ליאת, 64% others
   - Property #12: 25% (1/4) ליאת
   - Property #24: 50% אביעד, 50% משה בורשטיין
   - Property #26: 66.67% (2/3) אביעד, 33.33% מיקי שלומוביץ

3. **Mortgages** - Create mortgage records from notes:
   - Extract bank names
   - Extract loan amounts
   - Extract interest rates (if available)
   - Link shared mortgages (e.g., 6 million Leumi for properties #2, #8, #11)

4. **Plot Info** - Create Gush/Chelka records:
   - Extract from notes field
   - Create PlotInfo for Israeli properties

## Notes

- Estimated values are approximate from PDF
- Some fields may need manual verification
- Mortgage details need to be extracted and created separately
- Ownership percentages need to be calculated and validated (100% total)
- German properties use estimated EUR to ILS conversion rate (1 EUR = 3.5 ILS)

## Data Quality

**Complete Fields:**
- ✅ Address (all properties)
- ✅ File number (all properties)
- ✅ Type (all properties)
- ✅ Status (all properties)
- ✅ Country (all properties)

**Partial Fields:**
- ⚠️ City (most properties)
- ⚠️ Total area (some properties)
- ⚠️ Land area (land properties only)
- ⚠️ Estimated value (most properties)

**Needs Manual Processing:**
- ⚠️ Owner creation
- ⚠️ Ownership percentages
- ⚠️ Mortgage details
- ⚠️ Plot/Parcel (Gush/Chelka) data

---

**Source:** PDF document received May 2023  
**Created:** February 2, 2026  
**Total Properties:** 31  
**Status:** Ready for import
