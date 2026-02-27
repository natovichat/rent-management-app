-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'PARTNERSHIP');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('TRUST_ACCOUNT', 'PERSONAL_CHECKING', 'PERSONAL_SAVINGS', 'BUSINESS');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('OWNED', 'IN_CONSTRUCTION', 'IN_PURCHASE', 'SOLD', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('REGULAR', 'CONSECUTIVE');

-- CreateEnum
CREATE TYPE "AcquisitionMethod" AS ENUM ('PURCHASE', 'INHERITANCE', 'GIFT', 'EXCHANGE', 'OTHER');

-- CreateEnum
CREATE TYPE "LegalStatus" AS ENUM ('REGISTERED', 'IN_REGISTRATION', 'DISPUTED', 'CLEAR');

-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_RENOVATION');

-- CreateEnum
CREATE TYPE "LandType" AS ENUM ('URBAN', 'AGRICULTURAL', 'INDUSTRIAL', 'MIXED');

-- CreateEnum
CREATE TYPE "ManagementFeeFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "TaxFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "EstimationSource" AS ENUM ('PROFESSIONAL_APPRAISAL', 'MARKET_ESTIMATE', 'TAX_ASSESSMENT', 'OWNER_ESTIMATE');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('REAL', 'LEGAL');

-- CreateEnum
CREATE TYPE "MortgageStatus" AS ENUM ('ACTIVE', 'PAID_OFF', 'REFINANCED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "RentalAgreementStatus" AS ENUM ('FUTURE', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PropertyEventType" AS ENUM ('PlanningProcessEvent', 'PropertyDamageEvent', 'ExpenseEvent', 'RentalPaymentRequestEvent');

-- CreateEnum
CREATE TYPE "ExpenseEventType" AS ENUM ('MANAGEMENT_FEE', 'REPAIRS', 'MAINTENANCE', 'TAX', 'INSURANCE', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "RentalPaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PersonType" NOT NULL DEFAULT 'INDIVIDUAL',
    "id_number" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "branch_number" TEXT,
    "account_number" TEXT NOT NULL,
    "account_type" "BankAccountType" NOT NULL DEFAULT 'PERSONAL_CHECKING',
    "account_holder" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "file_number" TEXT,
    "type" "PropertyType",
    "status" "PropertyStatus" DEFAULT 'OWNED',
    "country" TEXT NOT NULL DEFAULT 'Israel',
    "city" TEXT,
    "total_area" DECIMAL(10,2),
    "land_area" DECIMAL(10,2),
    "estimated_value" DECIMAL(12,2),
    "last_valuation_date" TIMESTAMP(3),
    "gush" TEXT,
    "helka" TEXT,
    "is_mortgaged" BOOLEAN NOT NULL DEFAULT false,
    "floors" INTEGER,
    "total_units" INTEGER,
    "parking_spaces" INTEGER,
    "balcony_size_sqm" DECIMAL(6,2),
    "storage_size_sqm" DECIMAL(6,2),
    "parking_type" "ParkingType",
    "purchase_price" DECIMAL(12,2),
    "purchase_date" TIMESTAMP(3),
    "acquisition_method" "AcquisitionMethod",
    "estimated_rent" DECIMAL(10,2),
    "rental_income" DECIMAL(10,2),
    "projected_value" DECIMAL(12,2),
    "sale_projected_tax" DECIMAL(12,2),
    "cadastral_number" TEXT,
    "tax_id" TEXT,
    "registration_date" TIMESTAMP(3),
    "legal_status" "LegalStatus",
    "construction_year" INTEGER,
    "last_renovation_year" INTEGER,
    "building_permit_number" TEXT,
    "property_condition" "PropertyCondition",
    "land_type" "LandType",
    "land_designation" TEXT,
    "is_partial_ownership" BOOLEAN NOT NULL DEFAULT false,
    "shared_ownership_percentage" DECIMAL(5,2),
    "is_sold" BOOLEAN NOT NULL DEFAULT false,
    "sale_date" TIMESTAMP(3),
    "sale_price" DECIMAL(12,2),
    "property_manager" TEXT,
    "management_company" TEXT,
    "management_fees" DECIMAL(10,2),
    "management_fee_frequency" "ManagementFeeFrequency",
    "tax_amount" DECIMAL(10,2),
    "tax_frequency" "TaxFrequency",
    "last_tax_payment" TIMESTAMP(3),
    "insurance_details" TEXT,
    "insurance_expiry" TIMESTAMP(3),
    "zoning" TEXT,
    "utilities" TEXT,
    "restrictions" TEXT,
    "estimation_source" "EstimationSource",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_process_states" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "state_type" TEXT NOT NULL,
    "developer_name" TEXT,
    "projected_size_after" TEXT,
    "last_update_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planning_process_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_info" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "arnona_account_number" TEXT,
    "electricity_account_number" TEXT,
    "water_account_number" TEXT,
    "vaad_bayit_name" TEXT,
    "water_meter_number" TEXT,
    "electricity_meter_number" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ownerships" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "ownership_percentage" DECIMAL(5,2) NOT NULL,
    "ownership_type" "OwnershipType" NOT NULL,
    "management_fee" DECIMAL(10,2),
    "family_division" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mortgages" (
    "id" TEXT NOT NULL,
    "property_id" TEXT,
    "bank" TEXT NOT NULL,
    "loan_amount" DECIMAL(12,2) NOT NULL,
    "interest_rate" DECIMAL(5,2),
    "monthly_payment" DECIMAL(10,2),
    "early_repayment_penalty" DECIMAL(10,2),
    "bank_account_id" TEXT,
    "mortgage_owner_id" TEXT,
    "payer_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "MortgageStatus" NOT NULL,
    "linked_properties" TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mortgages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_agreements" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "monthly_rent" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "RentalAgreementStatus" NOT NULL,
    "has_extension_option" BOOLEAN NOT NULL DEFAULT false,
    "extension_until_date" TIMESTAMP(3),
    "extension_monthly_rent" DECIMAL(10,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_events" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "event_type" "PropertyEventType" NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "estimated_value" DECIMAL(12,2),
    "estimated_rent" DECIMAL(10,2),
    "planning_stage" TEXT,
    "developer_name" TEXT,
    "projected_size_after" TEXT,
    "damage_type" TEXT,
    "estimated_damage_cost" DECIMAL(10,2),
    "expense_id" TEXT,
    "expense_type" "ExpenseEventType",
    "amount" DECIMAL(10,2),
    "paid_to_account_id" TEXT,
    "affects_property_value" BOOLEAN,
    "rental_agreement_id" TEXT,
    "month" INTEGER,
    "year" INTEGER,
    "amount_due" DECIMAL(10,2),
    "payment_date" TIMESTAMP(3),
    "payment_status" "RentalPaymentStatus",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "persons_name_idx" ON "persons"("name");

-- CreateIndex
CREATE INDEX "persons_type_idx" ON "persons"("type");

-- CreateIndex
CREATE INDEX "bank_accounts_bank_name_idx" ON "bank_accounts"("bank_name");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_bank_name_account_number_key" ON "bank_accounts"("bank_name", "account_number");

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "properties"("type");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_country_idx" ON "properties"("country");

-- CreateIndex
CREATE INDEX "properties_city_idx" ON "properties"("city");

-- CreateIndex
CREATE INDEX "properties_is_mortgaged_idx" ON "properties"("is_mortgaged");

-- CreateIndex
CREATE INDEX "properties_is_partial_ownership_idx" ON "properties"("is_partial_ownership");

-- CreateIndex
CREATE INDEX "properties_is_sold_idx" ON "properties"("is_sold");

-- CreateIndex
CREATE UNIQUE INDEX "planning_process_states_property_id_key" ON "planning_process_states"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "utility_info_property_id_key" ON "utility_info"("property_id");

-- CreateIndex
CREATE INDEX "ownerships_property_id_idx" ON "ownerships"("property_id");

-- CreateIndex
CREATE INDEX "ownerships_person_id_idx" ON "ownerships"("person_id");

-- CreateIndex
CREATE INDEX "mortgages_property_id_idx" ON "mortgages"("property_id");

-- CreateIndex
CREATE INDEX "mortgages_status_idx" ON "mortgages"("status");

-- CreateIndex
CREATE INDEX "mortgages_bank_idx" ON "mortgages"("bank");

-- CreateIndex
CREATE INDEX "mortgages_bank_account_id_idx" ON "mortgages"("bank_account_id");

-- CreateIndex
CREATE INDEX "mortgages_mortgage_owner_id_idx" ON "mortgages"("mortgage_owner_id");

-- CreateIndex
CREATE INDEX "mortgages_payer_id_idx" ON "mortgages"("payer_id");

-- CreateIndex
CREATE INDEX "rental_agreements_property_id_idx" ON "rental_agreements"("property_id");

-- CreateIndex
CREATE INDEX "rental_agreements_tenant_id_idx" ON "rental_agreements"("tenant_id");

-- CreateIndex
CREATE INDEX "rental_agreements_status_idx" ON "rental_agreements"("status");

-- CreateIndex
CREATE INDEX "rental_agreements_end_date_idx" ON "rental_agreements"("end_date");

-- CreateIndex
CREATE INDEX "property_events_property_id_idx" ON "property_events"("property_id");

-- CreateIndex
CREATE INDEX "property_events_event_type_idx" ON "property_events"("event_type");

-- CreateIndex
CREATE INDEX "property_events_event_date_idx" ON "property_events"("event_date");

-- CreateIndex
CREATE UNIQUE INDEX "property_events_rental_agreement_id_month_year_key" ON "property_events"("rental_agreement_id", "month", "year");

-- AddForeignKey
ALTER TABLE "planning_process_states" ADD CONSTRAINT "planning_process_states_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_info" ADD CONSTRAINT "utility_info_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownerships" ADD CONSTRAINT "ownerships_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownerships" ADD CONSTRAINT "ownerships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mortgages" ADD CONSTRAINT "mortgages_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mortgages" ADD CONSTRAINT "mortgages_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mortgages" ADD CONSTRAINT "mortgages_mortgage_owner_id_fkey" FOREIGN KEY ("mortgage_owner_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mortgages" ADD CONSTRAINT "mortgages_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_events" ADD CONSTRAINT "property_events_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_events" ADD CONSTRAINT "property_events_rental_agreement_id_fkey" FOREIGN KEY ("rental_agreement_id") REFERENCES "rental_agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_events" ADD CONSTRAINT "property_events_paid_to_account_id_fkey" FOREIGN KEY ("paid_to_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_events" ADD CONSTRAINT "property_events_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "property_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

