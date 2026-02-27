# Property Expense Entity

**Entity Type:** Financial  
**Database Table:** `property_expenses`  
**Purpose:** Tracks all property-related expenses

---

## Current Schema Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Primary key |
| `propertyId` | UUID | ✅ Yes | Property reference |
| `accountId` | UUID | ✅ Yes | Account reference |
| `expenseDate` | DateTime | ✅ Yes | Date of expense |
| `amount` | Decimal(10,2) | ✅ Yes | Expense amount |
| `type` | Enum | ✅ Yes | Expense category |
| `category` | String | ✅ Yes | Specific category |
| `description` | Text | ❌ No | Expense description |
| `paymentMethod` | String | ❌ No | How expense was paid |
| `createdAt` | DateTime | ✅ Yes | Record creation |

---

## Expense Types (Enum)

```typescript
enum ExpenseType {
  MAINTENANCE    // תחזוקה - Repairs, upkeep
  TAX           // מס - Property tax, municipal tax
  INSURANCE     // ביטוח - Property insurance
  UTILITIES     // חשמל/מים/גז - If landlord pays
  RENOVATION    // שיפוץ - Improvements, upgrades
  LEGAL         // משפטי - Legal fees, registration
  OTHER         // אחר - Other expenses
}
```

---

## Additional Fields Recommended

| Field Name | Type | Description |
|------------|------|-------------|
| `vendor` | String | Service provider/company |
| `invoiceNumber` | String | Invoice reference |
| `receiptAttachment` | String | Link to receipt/invoice scan |
| `isRecurring` | Boolean | Recurring expense |
| `recurringFrequency` | String | Monthly, quarterly, annual |

---

## Example Record

```json
{
  "id": "uuid",
  "propertyId": "property-uuid",
  "accountId": "account-uuid",
  "expenseDate": "2024-01-15",
  "amount": 1500.00,
  "type": "MAINTENANCE",
  "category": "Plumbing Repair",
  "description": "Fixed leaking pipe in apartment 3",
  "vendor": "שרברב מומחה בע\"מ",
  "invoiceNumber": "INV-2024-001",
  "paymentMethod": "Bank Transfer"
}
```
