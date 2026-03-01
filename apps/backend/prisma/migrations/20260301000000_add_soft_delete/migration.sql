-- Add soft delete support: deleted_at column + index to all major entities

-- Properties
ALTER TABLE "properties" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "properties_deleted_at_idx" ON "properties"("deleted_at");

-- Persons
ALTER TABLE "persons" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "persons_deleted_at_idx" ON "persons"("deleted_at");

-- Bank Accounts
ALTER TABLE "bank_accounts" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "bank_accounts_deleted_at_idx" ON "bank_accounts"("deleted_at");

-- Ownerships
ALTER TABLE "ownerships" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "ownerships_deleted_at_idx" ON "ownerships"("deleted_at");

-- Mortgages
ALTER TABLE "mortgages" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "mortgages_deleted_at_idx" ON "mortgages"("deleted_at");

-- Rental Agreements
ALTER TABLE "rental_agreements" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "rental_agreements_deleted_at_idx" ON "rental_agreements"("deleted_at");

-- Property Events
ALTER TABLE "property_events" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "property_events_deleted_at_idx" ON "property_events"("deleted_at");
