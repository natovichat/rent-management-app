# Bank Account Entity

**Entity Type:** Financial  
**Database Table:** `bank_accounts`  
**Purpose:** Tracks bank accounts for mortgage payments and financial transactions

---

## Current Schema Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Primary key |
| `accountId` | UUID | ✅ Yes | Account reference |
| `bankName` | String | ✅ Yes | Bank name |
| `branchNumber` | String | ❌ No | Branch number |
| `accountNumber` | String | ✅ Yes | Account number |
| `accountType` | Enum | ✅ Yes | CHECKING, SAVINGS, BUSINESS |
| `accountHolder` | String | ❌ No | Account holder name |
| `notes` | Text | ❌ No | General notes |
| `isActive` | Boolean | ✅ Yes | Is account active |
| `createdAt` | DateTime | ✅ Yes | Creation timestamp |
| `updatedAt` | DateTime | ✅ Yes | Update timestamp |

---

## Additional Fields Recommended

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `currency` | String | ❌ No | Account currency (ILS, EUR, USD) |
| `swiftCode` | String | ❌ No | For international banks |
| `iban` | String | ❌ No | International bank account number |
| `country` | String | ❌ No | Bank country |

---

## Common Banks from Data

- **לאומי** (Bank Leumi)
- **מרכנתיל** (Mercantile Discount Bank)
- **דיסקונט** (Discount Bank)
- **בלמ"ש** (Bank Leumi le-Mortgage)
- **German Bank** (for foreign properties)

---

## Example Records

```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "bankName": "לאומי",
  "branchNumber": "850",
  "accountNumber": "12345678",
  "accountType": "CHECKING",
  "accountHolder": "יצחק נטוביץ",
  "currency": "ILS",
  "country": "Israel",
  "isActive": true
}
```
