# Property Income Entity

**Entity Type:** Financial  
**Database Table:** `property_income`  
**Purpose:** Tracks income generated from properties

---

## Current Schema Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Primary key |
| `propertyId` | UUID | ✅ Yes | Property reference |
| `accountId` | UUID | ✅ Yes | Account reference |
| `incomeDate` | DateTime | ✅ Yes | Date of income |
| `amount` | Decimal(10,2) | ✅ Yes | Income amount |
| `type` | Enum | ✅ Yes | RENT, SALE, CAPITAL_GAIN, OTHER |
| `source` | String | ❌ No | Income source |
| `description` | Text | ❌ No | Income description |
| `createdAt` | DateTime | ✅ Yes | Record creation |

---

## Income Types

```typescript
enum IncomeType {
  RENT          // דמי שכירות - Monthly rental income
  SALE          // מכירה - Property sale proceeds
  CAPITAL_GAIN  // רווח הון - Profit from appreciation
  OTHER         // אחר - Other income
}
```

---

## Data from Unstructured Files

### Rental Income Examples
- מחסן אלנבי 85: 1,000 ₪/month
- דירה בפתח תקווה: 5,000 ₪/month (estimated)

### Sale Examples
- Property #13: Sold for 3,250,000 ₪ (pending completion)

---

## Additional Fields Recommended

| Field Name | Type | Description |
|------------|------|-------------|
| `paymentMethod` | String | Cash, transfer, check |
| `paidBy` | String | Who paid (tenant name) |
| `invoiceNumber` | String | Invoice reference |
| `leaseId` | UUID | Link to lease if rental income |
| `isRecurring` | Boolean | Expected recurring income |

---

## Example Records

### Monthly Rent Payment
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "incomeDate": "2024-01-01",
  "amount": 5500.00,
  "type": "RENT",
  "source": "Tenant: דוד כהן",
  "leaseId": "lease-uuid",
  "description": "January 2024 rent payment",
  "paymentMethod": "Bank Transfer",
  "isRecurring": true
}
```

### Property Sale
```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "incomeDate": "2024-06-15",
  "amount": 3250000.00,
  "type": "SALE",
  "description": "Sale of בר-כוכבא 34 property",
  "paymentMethod": "Bank Transfer"
}
```

---

## Notes

1. **Rental Income Tracking**
   - Create record for each rent payment
   - Link to Lease for tracking
   - Compare expected vs actual

2. **Sale Proceeds**
   - Record full sale amount
   - Track as one-time income
   - Important for capital gains calculation

3. **Other Income**
   - Parking fees
   - Storage rental
   - Laundry facilities
   - Vending machines
