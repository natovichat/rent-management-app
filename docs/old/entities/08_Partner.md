# Partner Entity (NEW)

**Entity Type:** Relationship  
**Database Table:** `partners` (TO BE CREATED)  
**Purpose:** Tracks informal co-owners, business partners, and co-investors not in Owner table

---

## Proposed Schema Fields

| Field Name | Type | Required | Description | Source |
|------------|------|----------|-------------|---------|
| `id` | UUID | ✅ Yes | Primary key | New |
| `accountId` | UUID | ✅ Yes | Account reference | New |
| `name` | String | ✅ Yes | Partner full name | Unstructured |
| `email` | String | ❌ No | Contact email | Unstructured |
| `phone` | String | ❌ No | Contact phone | Unstructured |
| `partnerType` | Enum | ✅ Yes | Type of partner | Unstructured |
| `notes` | Text | ❌ No | General notes | Unstructured |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp | New |
| `updatedAt` | DateTime | ✅ Yes | Last update timestamp | New |

---

## Relationship Entity: Property-Partner Link

**Table:** `property_partners` (TO BE CREATED)

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | UUID | ✅ Yes | Primary key |
| `propertyId` | UUID | ✅ Yes | Property reference |
| `partnerId` | UUID | ✅ Yes | Partner reference |
| `accountId` | UUID | ✅ Yes | Account reference |
| `sharePercentage` | Decimal(5,2) | ❌ No | Partner's share percentage |
| `role` | String | ❌ No | Partner's role (investor, developer, co-owner) |
| `notes` | Text | ❌ No | Partnership details |
| `createdAt` | DateTime | ✅ Yes | Record creation timestamp |

---

## Relationships

### Many-to-Many
- **properties** ↔ **partners** via `property_partners` table

### Many-to-One
- **account** → `Account` - Account owner

---

## Proposed Enums

### PartnerType
```typescript
enum PartnerType {
  CO_OWNER      // שותף בבעלות - Joint owner
  INVESTOR      // משקיע - Co-investor
  DEVELOPER     // קבלן/יזם - Developer/contractor
  CONSULTANT    // יועץ - Consultant/advisor
  OTHER         // אחר - Other relationship
}
```

---

## Why This Entity is Needed

### Problem: Informal Partnerships Not Captured

From unstructured data, many co-owners/partners mentioned but not tracked:

1. **Co-Owner in Same Property**
   ```
   "50% מזכויות בדירה - 50% אחרים זה אריאלה לאובר"
   ```
   - Partner: אריאלה לאובר (50%)
   - Not tracked as formal Owner (no contact info, no other properties)

2. **Business Partners in Ventures**
   ```
   "שותפים יבולים - שוקי שרון + זיו שמור (0509733355)"
   ```
   - Partnership name: יבולים
   - Partners: שוקי שרון, זיו שמור
   - Need to track for coordination

3. **Co-Investor with Contact Info**
   ```
   "יחד עם צביקה נטוביץ"
   "שותפות עם משה בורשטיין"
   ```
   - Partners without full owner records
   - Important for decisions, but not main portfolio owners

4. **Developer/Contractor Partners**
   ```
   "קומבינציה עם קבלן"
   ```
   - Partnership with developer
   - Different from property owner
   - Important for development tracking

### Solution: Partner Entity

**Partner** is lighter than **Owner**:
- **Owner**: Full entity with properties, ownerships, financial tracking
- **Partner**: Contact reference for coordination and co-investment tracking

---

## Indexes

- `accountId` - Account's partners
- `name` - Partner name searches
- `partnerType` - Filter by type
- `phone`, `email` - Contact lookup

---

## Validation Rules

- `name` - Must be at least 2 characters
- `phone` - If provided, valid phone format
- `email` - If provided, valid email format
- `sharePercentage` - Between 0.01 and 100.00 in property_partners

---

## Business Rules

1. **When to Use Partner vs Owner**
   - Use **Owner** if:
     - Person owns multiple properties in portfolio
     - Need full financial tracking
     - Legal ownership tracked
   
   - Use **Partner** if:
     - Mentioned as co-owner but minimal info
     - External business partner
     - Developer/contractor relationship
     - One-time co-investment

2. **Promotion Path**
   - Partner can be "promoted" to Owner if relationship deepens
   - Migrate data when creating Owner from Partner

3. **Contact Tracking**
   - Store available contact information
   - Important for coordination on shared properties
   - May need partner approval for property decisions

---

## Migration Notes

### Extraction from Unstructured Data

1. **Mentioned Co-Owners**
   ```
   "50% אחרים זה אריאלה לאובר"
   ```
   Create Partner:
   - name: "אריאלה לאובר"
   - partnerType: CO_OWNER
   
   Create property_partners link:
   - sharePercentage: 50.00

2. **Business Partners with Contact**
   ```
   "שותפים יבולים - שוקי שרון + זיו שמור (0509733355)"
   ```
   Create Partners:
   - Partner 1: שוקי שרון
   - Partner 2: זיו שמור (phone: 0509733355)
   - Both: partnerType: CO_OWNER

3. **Investment Partner**
   ```
   "שותפות עם משה בורשטיין"
   ```
   Create Partner:
   - name: "משה בורשטיין"
   - partnerType: INVESTOR

4. **Developer Partner**
   ```
   "קומבינציה עם קבלן"
   ```
   Create Partner:
   - name: [Extract if found]
   - partnerType: DEVELOPER
   - notes: "Development partnership"

---

## Example Records

### Example 1: Co-Owner Partner
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "אריאלה לאובר",
  "partnerType": "CO_OWNER",
  "notes": "50% co-owner of Lavi 6, Ramat Gan property"
}
```

### Example 2: Business Partner with Contact
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "שוקי שרון",
  "phone": "+972-50-9733355",
  "partnerType": "CO_OWNER",
  "notes": "Partner in Yevulim partnership, Hadera plot"
}
```

### Example 3: Investment Partner
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "משה בורשטיין",
  "email": "moshe@example.com",
  "partnerType": "INVESTOR",
  "notes": "50% partner in Hapalma 9, Petach Tikva properties"
}
```

### Example 4: Developer Partner
```json
{
  "id": "uuid",
  "accountId": "account-uuid",
  "name": "חברת קרסו",
  "phone": "+972-3-1234567",
  "partnerType": "DEVELOPER",
  "notes": "Developer for Lavi 6 evacuation-construction project"
}
```

### Property-Partner Link Example
```json
{
  "id": "uuid",
  "propertyId": "property-lavi-6-uuid",
  "partnerId": "ariela-uuid",
  "accountId": "account-uuid",
  "sharePercentage": 50.00,
  "role": "co-owner",
  "notes": "Joint 50/50 ownership"
}
```

---

## API Endpoints

### Core Operations
- `POST /api/partners` - Create partner
- `GET /api/partners` - List partners
- `GET /api/partners/:id` - Get partner details
- `PUT /api/partners/:id` - Update partner
- `DELETE /api/partners/:id` - Delete partner (if no property links)

### Property Links
- `POST /api/properties/:propertyId/partners` - Link partner to property
- `GET /api/properties/:propertyId/partners` - List property partners
- `DELETE /api/properties/:propertyId/partners/:partnerId` - Unlink

---

## UI Components

### Partner List View
- Name (primary)
- Type badge
- Phone/email
- Number of properties linked
- Actions

### Property Partners Section (in Property Details)
- List of partners with share percentages
- Add partner button
- Contact information
- Remove/edit partnership

---

## Notes

1. **Difference from Owner**
   - Owner: Full entity, formal tracking
   - Partner: Lightweight, informal tracking
   - Partner can become Owner if needed

2. **Contact Information Critical**
   - Decisions may require partner consultation
   - Important for shared property management
   - Sales require partner approval

3. **Share Percentage Optional**
   - Some partnerships don't specify exact shares
   - Document in notes if unclear
   - Important for property sales/decisions

4. **Developer Relationships**
   - Track developer/contractor partnerships
   - Important for construction projects
   - May affect ownership or profit sharing

5. **Future Enhancement**
   - Promote Partner → Owner (data migration)
   - Track partner interactions/decisions
   - Document agreements
