# Property Valuation Entity

**Entity Type:** Financial/Historical  
**Database Table:** `property_valuations`  
**Purpose:** Tracks property valuations over time

---

## Current Schema Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Primary key |
| `propertyId` | UUID | ✅ Yes | Property reference |
| `accountId` | UUID | ✅ Yes | Account reference |
| `valuationDate` | DateTime | ✅ Yes | Date of valuation |
| `estimatedValue` | Decimal(12,2) | ✅ Yes | Valuation amount |
| `valuationType` | Enum | ✅ Yes | MARKET, PURCHASE, TAX, APPRAISAL |
| `valuatedBy` | String | ❌ No | Who performed valuation |
| `notes` | Text | ❌ No | Valuation details |
| `createdAt` | DateTime | ✅ Yes | Record creation |

---

## Additional Fields from Unstructured Data

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `projectedValue` | Decimal(12,2) | ❌ No | Future projected value (צפי) |
| `projectedDate` | DateTime | ❌ No | Date for projection |
| `appreciationRate` | Decimal(5,2) | ❌ No | Expected annual appreciation |
| `developmentImpact` | Text | ❌ No | Value impact from development |

---

## Data from Unstructured Files

Most properties show:
- Current value (שווי)
- Some show projected value (צפי)
- Development properties show expected appreciation

Example valuations:
- לביא 6: Current 800,000 ₪, Projected after 6 years
- שאול חרנ"ם 10: 4,000,000 ₪
- טבנקין 22: 8,000,000 ₪

---

## Example Record

```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "valuationDate": "2021-12-14",
  "estimatedValue": 4000000.00,
  "projectedValue": 5500000.00,
  "projectedDate": "2026-12-14",
  "valuationType": "MARKET",
  "valuatedBy": "Self-assessed",
  "appreciationRate": 6.5,
  "notes": "Estimated 6.5% annual appreciation based on area development"
}
```
