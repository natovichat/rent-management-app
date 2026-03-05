-- CreateEnum
CREATE TYPE "RenewalStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RENEWED', 'NOT_RENEWING');

-- AlterTable
ALTER TABLE "rental_agreements" ADD COLUMN "renewal_status" "RenewalStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "rental_agreements_renewal_status_idx" ON "rental_agreements"("renewal_status");
