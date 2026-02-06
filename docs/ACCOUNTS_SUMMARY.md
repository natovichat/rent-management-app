# Accounts Summary

## Current Accounts in Database

### Account 1: `456fb3ba-2c72-4525-b3df-78980d07d8db` ⭐ **CURRENTLY DISPLAYED IN UI**

- **Name**: Test Account
- **Status**: ACTIVE
- **User**: test@example.com
- **Data**:
  - **31 Properties** (from CSV import)
  - **7 Owners** (יצחק נטוביץ, אביעד, ליאת, איציק, רפאל, אייל, רחל)
  - **15 Mortgages**
  - **5 Bank Accounts**
  - **31 Property Ownerships**
  - **19 Plot Infos**

**This is the account that shows when you log in with `test@example.com`.**

---

### Account 2: `test-account-1`

- **Name**: Test Account
- **Status**: ACTIVE
- **User**: None (no associated users)
- **Data**:
  - **32 Properties**
  - **2 Owners**
  - **1 Mortgage**

**This account exists but has no users, so it cannot be accessed from the UI.**

---

## How to Switch Accounts

### Current Login Behavior

When you click "התחבר" (Login) on `http://localhost:3000/login`, it uses:
- **Email**: `test@example.com`
- **Account**: `456fb3ba-2c72-4525-b3df-78980d07d8db` (Account 1 with 31 properties)

### To Access Different Accounts

Since Account 2 has no users, you would need to:

1. **Option A: Create a user for Account 2**
   ```typescript
   // Run this in backend:
   await prisma.user.create({
     data: {
       accountId: 'test-account-1',
       email: 'user2@example.com',
       name: 'Test User 2',
       googleId: 'dev-user2@example.com',
       role: 'OWNER'
     }
   });
   ```

2. **Option B: Modify the login page** to allow selecting email (e.g., `user2@example.com`)

3. **Option C: Delete Account 2** if it's not needed:
   ```bash
   # Delete all data for test-account-1
   npx prisma studio
   # Then manually delete the account
   ```

---

## Data Distribution

| Account | Properties | Owners | Mortgages | Bank Accounts |
|---------|-----------|--------|-----------|---------------|
| **Account 1** (test@example.com) | 31 | 7 | 15 | 5 |
| Account 2 (no user) | 32 | 2 | 1 | 0 |

---

## Recommendation

**Keep Account 1** - This is the main account with all the CSV-imported data (31 properties, 7 owners, 15 mortgages, 5 bank accounts).

**Delete or ignore Account 2** - It has no users and seems to be leftover test data.

---

## Currently Displayed in UI

✅ **Account ID**: `456fb3ba-2c72-4525-b3df-78980d07d8db`  
✅ **User**: test@example.com  
✅ **Properties**: 31 (all from CSV import)  
✅ **Owners**: 7 (יצחק, אביעד, ליאת, איציק, רפאל, אייל, רחל)  
✅ **Mortgages**: 15  
✅ **Bank Accounts**: 5  

This is the account with all your real property data from the CSV file.

---

**Last Updated**: 2026-02-02
