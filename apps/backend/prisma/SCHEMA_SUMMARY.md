# Prisma Schema Summary

## Created Files

1. **`schema.prisma`** - Complete Prisma schema with all models and enums
2. **`seed.ts`** - Development seed data script
3. **`migrations/README.md`** - Migration instructions

## Schema Overview

### Models Created

1. **Account** - Multi-tenant account (no accountId - top level)
2. **User** - User accounts with Google OAuth (has accountId)
3. **Property** - Properties/real estate (has accountId)
4. **Unit** - Apartment units within properties (has accountId)
5. **Tenant** - Tenants/renters (has accountId)
6. **Lease** - Rental contracts (has accountId)
7. **Notification** - Lease expiration notifications (has accountId)

### Enums Created

1. **AccountStatus** - ACTIVE, SUSPENDED, INACTIVE
2. **UserRole** - OWNER, USER
3. **LeaseStatus** - FUTURE, ACTIVE, EXPIRED, TERMINATED
4. **NotificationType** - LEASE_EXPIRING, LEASE_EXPIRED
5. **NotificationStatus** - PENDING, SENT, FAILED

## Key Features

✅ **Multi-tenancy**: All models (except Account) have `accountId`  
✅ **UUID Primary Keys**: All models use UUID for IDs  
✅ **Timestamps**: All models have `createdAt` and `updatedAt`  
✅ **Snake_case Columns**: All database columns use snake_case with `@map`  
✅ **Proper Relations**: Foreign keys with appropriate `onDelete` behavior  
✅ **Indexes**: Indexes on `accountId` and frequently queried fields  
✅ **Unique Constraints**: Prevent duplicates (email, googleId, unit+apartment, etc.)  

## Cascade Delete Behavior

- **Account deletion**: Cascades to all related models (User, Property, Tenant, Lease, Notification)
- **Property deletion**: Cascades to Units
- **Unit deletion**: Restricted (cannot delete if leases exist)
- **Tenant deletion**: Restricted (cannot delete if leases exist)
- **Lease deletion**: Cascades to Notifications

## Next Steps

1. **Set up database connection**:
   ```bash
   # Create .env file in apps/backend/
   DATABASE_URL="postgresql://user:password@localhost:5432/rent_application?schema=public"
   ```

2. **Create initial migration**:
   ```bash
   cd apps/backend
   npx prisma migrate dev --name init
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Seed database** (optional):
   ```bash
   npx prisma db seed
   # or
   npx ts-node prisma/seed.ts
   ```

5. **View database** (optional):
   ```bash
   npx prisma studio
   ```

## Verification Checklist

- [x] All models have UUID primary keys
- [x] All models (except Account) have accountId
- [x] All models have createdAt/updatedAt timestamps
- [x] All foreign keys have proper onDelete behavior
- [x] All accountId fields are indexed
- [x] All enums are defined
- [x] Snake_case column names with @map
- [x] Unique constraints where needed
- [x] Seed file created with test data
