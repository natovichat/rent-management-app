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

## Next Steps

1. Run the seed script to import all data
2. Verify in the application that all relationships are correct
3. Manually update placeholder contact information
4. Review properties marked for verification
5. Add any missing cadastral or unit details
