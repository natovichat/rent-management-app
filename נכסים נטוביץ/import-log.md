# Netobitz Family Properties Import Log

**Date:** 2026-02-04  
**Source:** רשימת נכסים – יצחק נטוביץ 14.12.2021  
**Total Properties:** 32

## Import Summary

### Data Successfully Extracted
- ✅ 32 properties with addresses and descriptions
- ✅ Owner information (6 unique owners)
- ✅ Gush/Helka (plot) information for most properties
- ✅ Current values for all properties
- ✅ Mortgage information where available
- ✅ Unit details (apartments, floors, room counts) where specified
- ✅ **11 lease agreements with tenant and rental information** (added 2026-02-06)

### Placeholder Data Used

The following placeholder values were used for required fields that were missing from the source data:

#### Owner Contact Information
All owner emails and phone numbers are **placeholders** that need to be updated:

| Owner Name | Email (Placeholder) | Phone (Placeholder) |
|---|---|---|
| יצחק נטוביץ | yitzhak@temp-import.local | 050-000-0001 |
| אילנה נטוביץ | ilana@temp-import.local | 050-000-0002 |
| ליאת נטוביץ | liat@temp-import.local | 050-000-0003 |
| מיכל נטוביץ | michal@temp-import.local | 050-000-0004 |
| אביעד נטוביץ | aviad@temp-import.local | 050-000-0005 |
| י נטוביץ ושות | netobitz-partners@temp-import.local | 050-000-0006 |

**Action Required:** Update all owner contact information with real email addresses and phone numbers.

#### Account Information
- Account email: `netobitz-family@temp-import.local` (**placeholder**)
- **Action Required:** Set real account email address.

#### Property-Specific Missing Data

| Property # | Address | Missing/Incomplete Data |
|---|---|---|
| 10 | מגדל ב.ס.ר 3 | City not specified (used "לא צוין") |
| 17-20 | גרמניה | German properties - Gush/Helka not applicable |
| 23 | פטרסון 3, יד אליהו | Gush/Helka missing |
| 24 | הפלמח 9, פתח תקווה | Gush/Helka missing |
| 27 | מורדות הכרמל | City not specified, value needs verification |
| 28 | מניות בחברים נטו דיור | Not a physical property - stocks/shares |
| 30 | הרצל 57 | City not specified |
| 31-32 | גבעת שמואל | Small ownership percentages (1.128% and 3.478%) |

#### Data Quality Notes

**High-Quality Data:**
- Most properties have complete gush/helka information
- Current values are specified for all properties
- Mortgage information well-documented where applicable
- Ownership percentages specified for shared properties

**Data Requiring Verification:**
1. Property #13 (בר-כוכבא 34) - Listed as "sold but not finalized at 3,250,000"
2. Property #20 (גלפי, גרמניה) - Loan repayment starts 16.11.2025
3. Property #27 (מורדות הכרמל) - Value needs verification per source note
4. Property #28 (מניות בחברים נטו) - Stock holdings, not physical real estate

### Mortgage Summary

**Main Loan:** 6,000,000 ₪ from Bank Leumi (monthly payment: 57,000 ₪)  
**Properties secured by main loan:** #2, #8, #11

**Other Mortgages:**
| Property # | Address | Bank | Amount |
|---|---|---|---|
| 4 | שאול חרנ"ם 10 (דירה 45) | מרכנתיל | 1,400,000 |
| 7 | הרוא"ה 295 | לאומי | 400,000 |
| 10 | מגדל ב.ס.ר 3 | בלמ"ש | 700,000 |
| 12 | הפלמ"ח 50, ירושלים | בלמ"ש | 300,000 |
| 17 | לייפציג, גרמניה | בנק גרמני | 350,000 |
| 21 | מוצקין 22, רעננה | לא צוין | 1,500,000 |
| 22 | שלום עליכם 6 | לא צוין | 300,000 |
| 23 | פטרסון 3 | דיסקונט | 174,000 |
| 24 | הפלמח 9, פתח תקווה | לא צוין | 750,000 |
| 29 | שאול חרנם 6 | מרכנתיל דיסקונט | 2,000,000 |
| 31 | גבעת שמואל | לא צוין | 869,660 |
| 32 | גבעת שמואל | לא צוין | 1,355,787 |

**Total Mortgage Amount:** ~15,099,447 ₪ (excluding main 6M loan counted multiple times)

### Unit Information

Properties with multiple units (apartments):
- Property #8 (מנדלי 7): 2 apartments (#17, #16)
- Property #4 (שאול חרנ"ם 10): Building with multiple units (#45, #47, #6)

### Import Statistics

- **Total Property Value:** 75,681,000 ₪
- **Total Mortgages:** ~15,699,447 ₪
- **Net Value (after mortgages):** ~59,981,553 ₪
- **Properties by Owner:**
  - יצחק נטוביץ: 17 properties (primary owner)
  - אילנה נטוביץ: 6 properties
  - ליאת נטוביץ: 5 properties
  - אביעד נטוביץ: 5 properties
  - מיכל נטוביץ: 1 property
  - י נטוביץ ושות: 2 properties

### Post-Import Tasks

**Immediate Actions:**
1. ✅ Import account "משפחת נטוביץ"
2. ✅ Import all 6 owners with placeholder contacts
3. ✅ Import all 32 properties with gush/helka and values
4. ✅ Create property ownership relationships with percentages
5. ✅ Import mortgage information for relevant properties
6. ✅ Create unit records for multi-unit properties

**Follow-Up Actions (Manual):**
1. ⚠️ Update all owner email addresses (remove @temp-import.local)
2. ⚠️ Update all owner phone numbers (replace 050-000-00XX)
3. ⚠️ Update account email address
4. ⚠️ Verify property #27 value (marked for verification)
5. ⚠️ Review property #13 status (listed as sold but not finalized)
6. ⚠️ Add missing gush/helka for properties #10, #23, #24, #30
7. ⚠️ Specify banks for mortgages listed as "לא צוין"
8. ⚠️ Add complete unit details where missing (floor numbers, exact areas)

### Data Integrity Notes

**Strengths:**
- Complete financial information (values and mortgages)
- Clear ownership structure with percentages
- Detailed property descriptions
- Well-documented mortgage obligations

**Limitations:**
- Contact information not available in source
- Some properties missing cadastral data (gush/helka)
- Bank names missing for some mortgages
- Unit details incomplete for some multi-unit properties

---

## Lease Agreements Import (Added: 2026-02-06)

### Source
**File:** רשימת נכסים - איציק נטוביץ 5.2023 2.xlsx  
**Tab:** שכירות (Leases tab)

### Import Results

**Total Leases Processed:** 12  
**Successfully Imported:** 11  
**Manual Entry Required:** 1

#### Imported Leases

| # | Property | Tenant | Unit | Monthly Rent (Our Share) | Status |
|---|----------|--------|------|--------------------------|--------|
| 1 | הפלמ"ח 50, ירושלים | מלכין בלה ואיתם טובול | דירה 1, קומה 1 | ₪2,850 (50%) | ENDED |
| 2 | הרוא"ה 295, רמת גן | עדי ויהודה בן שמואל | דירה 2, קומה 3 | ₪5,950 (100%) | ENDED |
| 3 | מנדלי 7, תל אביב | אולטי יהונתן אליהו | דירה 16, קומה 2 | ₪3,400 (100%) | ENDED |
| 4 | מנדלי 7, תל אביב | אלכסיי פינרוב | דירה 17, קומה 1 | ₪3,600 (100%) | ENDED |
| 5 | לביא 6, רמת גן | לויכטר ענבל | דירה 4, קומה 2 | ₪2,200 (50%) | ENDED |
| 6 | שלום עליכם 6, רמת גן | זדה רינה | דירה 3, קומה 6 | ₪5,000 (100%) | ENDED |
| 7 | פטרסון 3, יד אליהו, תל אביב | יבגני ליבוביץ' | אין, קומה 2 | ₪4,400 (100%) | ENDED |
| 8 | טבנקין 22, גבעתיים | סיון ויניב סימן טוב | דירה 21, קומה 5 | ₪15,300 (100%) | ENDED |
| 9 | דרך המלך 11, גני תקווה | רחל דראש / יונתן דניאל | דירה 15, קומה 5 | ₪6,600 (100%) | ENDED |
| 10 | אלנבי 85, תל אביב - מחסן | רדפורד הלוחש לסייחים | N/A | ₪1,000 (100%) | ACTIVE |
| 11 | הרברט סמואל, חדרה | יבולים דרום, עמוס שמור, יצחק נטוביץ | דירה/מחסן, קרקע | ₪1,000 (100%) | ACTIVE |

**Total Monthly Income (Our Share):** ₪51,300

**Note:** Most leases have ended (9 out of 11). Only 2 are currently active.

#### Lease Requiring Manual Entry

**Property:** בר-כוכבא 34, רמת גן  
**Tenant:** אורי ויינשטיין בר אנקונינה  
**Unit:** דירה 16, קומה 8  
**Monthly Rent:** ₪6,900  
**Dates:** 23.12.2019 → 31.01.2024  
**Reason:** Address matching algorithm didn't find sufficient match  
**Action Required:** Create lease manually in the system

See detailed instructions in: `שכירויות-לבדיקה.md`

### What Was Created

- **11 Tenants:** New tenant records with contact information
- **9 Units:** New unit records (2 units already existed for מנדלי 7)
- **11 Lease Agreements:** Complete rental contracts linked to properties, units, and tenants

### Lease Data Notes

- **Partial Ownership:** Two properties have 50% ownership split
- **Missing Start Dates:** Two leases had no start date (used default)
- **Unit Numbers:** Some units had unclear numbering ("אין", "N/A") - need review
- **Ended Leases:** Most leases have ended - consider updating or removing

### Related Files

- **leases-data.json** - Raw lease data extracted from Excel
- **lease-property-mapping.json** - Address matching results
- **import-netobitz-leases.ts** - TypeScript seed script for lease import
- **LEASES_IMPORT_SUMMARY.md** - Detailed import summary with all lease details
- **שכירויות-לבדיקה.md** - Instructions for manual lease entry

---

## Next Steps

1. ✅ Run the property seed script to import all data (COMPLETED: 2026-02-04)
2. ✅ Run the lease seed script to import lease agreements (COMPLETED: 2026-02-06)
3. Verify in the application that all relationships are correct
4. Manually update placeholder contact information
5. Review properties marked for verification
6. Add any missing cadastral or unit details
7. **NEW:** Manually create the missing lease for בר-כוכבא 34
8. **NEW:** Update lease statuses (renew ended leases or mark as inactive)
9. **NEW:** Review unit numbers for leases with "אין" or "N/A"
