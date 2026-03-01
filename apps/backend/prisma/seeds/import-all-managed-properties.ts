#!/usr/bin/env ts-node

/**
 * Import All Managed Properties - Rental Data Import
 *
 * Imports all 4 ownership groups from the parsed JSON:
 *   1. Netobitz family   (existing properties in DB + "various" sub-properties)
 *   2. Sharon Estate     (new properties - עוזי חיטמן 2/4/6/16/18, רעננה)
 *   3. Harmon family     (new properties - אריה בראון 12, פתח תקווה + others)
 *   4. Greenspan         (new properties - הקונגרס 3, משה סנה 9)
 *
 * Source data: legacy/data/all-rental-data.json
 *
 * Usage:
 *   cd apps/backend && npx tsx prisma/seeds/import-all-managed-properties.ts
 */

import { PrismaClient, PropertyType, PropertyStatus, PersonType, OwnershipType, RentalAgreementStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface LeaseData {
  tenant_name: string | null;
  email: string | null;
  phone: string | null;
  start_date: string | null;
  end_date: string | null;
  monthly_rent: number | null;
  status: 'ACTIVE' | 'EXPIRED';
  apartment_number: string | null;
  floor: string | null;
  rooms: string | null;
  notes: string | null;
  landlord?: string;
}

interface PropertyData {
  address: string;
  city: string;
  file_number: string;
  is_existing_in_db: boolean;
  subsection?: string;
  leases: LeaseData[];
}

interface GroupData {
  group: string;
  source_tag: string;
  owners: Array<{ name: string; phone: string | null; email: string | null }>;
  properties: PropertyData[];
}

interface ImportData {
  generated_at: string;
  groups: GroupData[];
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function log(msg: string) {
  console.log(msg);
}

function parseDate(dateStr: string | null, fallback: Date): Date {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return d;
  } catch {
    return fallback;
  }
}

function normalizeAddress(addr: string): string {
  return addr.trim().replace(/\s+/g, ' ');
}

// ─────────────────────────────────────────────
// MAIN IMPORT FUNCTIONS
// ─────────────────────────────────────────────

async function findOrCreatePerson(name: string, email: string | null, phone: string | null, type = PersonType.INDIVIDUAL): Promise<string> {
  const trimmedName = name.trim();
  const existing = await prisma.person.findFirst({
    where: { name: trimmedName, deletedAt: null },
  });
  if (existing) return existing.id;

  const person = await prisma.person.create({
    data: {
      name: trimmedName,
      email: email || null,
      phone: phone || null,
      type,
    },
  });
  return person.id;
}

async function findPropertyByAddress(address: string): Promise<string | null> {
  const normalized = normalizeAddress(address);
  const prop = await prisma.property.findFirst({
    where: {
      address: { contains: normalized.substring(0, 15), mode: 'insensitive' },
      deletedAt: null,
    },
  });
  return prop?.id ?? null;
}

async function createProperty(propData: PropertyData, sourceTag: string): Promise<string> {
  const property = await prisma.property.create({
    data: {
      address: propData.address,
      city: propData.city,
      country: 'Israel',
      type: PropertyType.RESIDENTIAL,
      status: PropertyStatus.OWNED,
      fileNumber: propData.file_number,
      notes: sourceTag,
    },
  });
  return property.id;
}

async function ensureOwnership(propertyId: string, personId: string, percentage: number) {
  const existing = await prisma.ownership.findFirst({
    where: { propertyId, personId },
  });
  if (existing) return;

  await prisma.ownership.create({
    data: {
      propertyId,
      personId,
      ownershipPercentage: percentage,
      ownershipType: OwnershipType.REAL,
      startDate: new Date('2020-01-01'),
    },
  });
}

async function importLease(
  propertyId: string,
  lease: LeaseData,
  groupStats: { created: number; skipped: number; noRent: number },
) {
  if (!lease.tenant_name) return;
  if (!lease.monthly_rent || lease.monthly_rent <= 0) {
    log(`   ⚠️  Skipping ${lease.tenant_name} - no rent amount`);
    groupStats.noRent++;
    return;
  }

  // Determine dates
  const defaultStart = new Date('2020-01-01');
  const defaultEnd = new Date('2026-12-31');
  const startDate = parseDate(lease.start_date, defaultStart);
  const endDate = parseDate(lease.end_date, defaultEnd);

  const status: RentalAgreementStatus =
    lease.status === 'ACTIVE'
      ? RentalAgreementStatus.ACTIVE
      : RentalAgreementStatus.EXPIRED;

  // Find or create tenant
  const tenantId = await findOrCreatePerson(
    lease.tenant_name,
    lease.email,
    lease.phone,
  );

  // Check if lease already exists (match by propertyId + tenantId)
  const existing = await prisma.rentalAgreement.findFirst({
    where: { propertyId, tenantId, deletedAt: null },
  });

  if (existing) {
    log(`   ↪️  Lease exists: ${lease.tenant_name}`);
    groupStats.skipped++;
    return;
  }

  // Build notes
  const noteParts: string[] = [];
  if (lease.apartment_number) noteParts.push(`דירה ${lease.apartment_number}`);
  if (lease.floor) noteParts.push(`קומה ${lease.floor}`);
  if (lease.rooms) noteParts.push(`${lease.rooms} חד'`);
  if (lease.notes) noteParts.push(lease.notes);

  await prisma.rentalAgreement.create({
    data: {
      propertyId,
      tenantId,
      monthlyRent: lease.monthly_rent,
      startDate,
      endDate,
      status,
      notes: noteParts.length > 0 ? noteParts.join(' | ') : null,
    },
  });

  log(`   ✅ Lease: ${lease.tenant_name} → ${lease.monthly_rent.toLocaleString()} ₪/mo [${status}]`);
  groupStats.created++;
}

// ─────────────────────────────────────────────
// PROCESS NETOBITZ GROUP
// ─────────────────────────────────────────────

async function processNetobitz(group: GroupData) {
  log('\n' + '═'.repeat(60));
  log('🏠 NETOBITZ GROUP');
  log('═'.repeat(60));

  const stats = { propertiesMatched: 0, propertiesCreated: 0, leasesCreated: 0, leasesSkipped: 0, leasesNoRent: 0 };

  for (const propData of group.properties) {
    log(`\n  📍 ${propData.address}`);

    let propertyId: string | null = null;

    if (propData.is_existing_in_db) {
      // Find existing property in DB
      propertyId = await findPropertyByAddress(propData.address);
      if (propertyId) {
        log(`     ✅ Found in DB`);
        stats.propertiesMatched++;

        // Update notes to add source tag if not already there
        const prop = await prisma.property.findUnique({ where: { id: propertyId } });
        if (prop && !prop.notes?.includes('מקור:')) {
          const newNotes = prop.notes
            ? `${prop.notes}\n${group.source_tag}`
            : group.source_tag;
          await prisma.property.update({
            where: { id: propertyId },
            data: { notes: newNotes },
          });
          log(`     📝 Updated notes with source tag`);
        }
      } else {
        log(`     ⚠️  NOT FOUND in DB - creating new property`);
        propertyId = await createProperty(propData, group.source_tag);
        stats.propertiesCreated++;
      }
    } else {
      // "Various" sub-section - create new property
      const existing = await prisma.property.findFirst({
        where: { fileNumber: propData.file_number, deletedAt: null },
      });
      if (existing) {
        propertyId = existing.id;
        log(`     ↪️  Already exists (file ${propData.file_number})`);
        stats.propertiesMatched++;
      } else {
        propertyId = await createProperty(propData, group.source_tag);
        log(`     🆕 Created new property`);
        stats.propertiesCreated++;
      }
    }

    if (!propertyId) continue;

    // Import leases
    for (const lease of propData.leases) {
      const leaseStats = { created: 0, skipped: 0, noRent: 0 };
      await importLease(propertyId, lease, leaseStats);
      stats.leasesCreated += leaseStats.created;
      stats.leasesSkipped += leaseStats.skipped;
      stats.leasesNoRent += leaseStats.noRent;
    }
  }

  log(`\n  📊 Netobitz: properties matched=${stats.propertiesMatched} created=${stats.propertiesCreated}, leases created=${stats.leasesCreated} skipped=${stats.leasesSkipped}`);
}

// ─────────────────────────────────────────────
// PROCESS NEW GROUP (Sharon / Harmon / Greenspan)
// ─────────────────────────────────────────────

async function processNewGroup(group: GroupData) {
  log('\n' + '═'.repeat(60));
  log(`🏠 ${group.group.toUpperCase()} GROUP (${group.source_tag})`);
  log('═'.repeat(60));

  const stats = { propertiesCreated: 0, propertiesSkipped: 0, leasesCreated: 0, leasesSkipped: 0, leasesNoRent: 0 };

  // Create owner persons
  const ownerIds: string[] = [];
  log('\n  👤 Creating owners...');
  for (const owner of group.owners) {
    const id = await findOrCreatePerson(owner.name, owner.email, owner.phone);
    ownerIds.push(id);
    log(`     👤 ${owner.name} (${id.substring(0, 8)}...)`);
  }

  for (const propData of group.properties) {
    log(`\n  📍 ${propData.address}`);

    // Check if property already exists (by address only to avoid cross-property collisions)
    let propertyId: string | null = null;

    const byAddr = await prisma.property.findFirst({
      where: {
        address: { equals: propData.address, mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (byAddr) {
      propertyId = byAddr.id;
      log(`     ↪️  Already exists (address match)`);
      stats.propertiesSkipped++;
    } else {
      propertyId = await createProperty(propData, group.source_tag);
      log(`     🆕 Created: ${propData.address}`);
      stats.propertiesCreated++;

      // Create ownerships for new property
      const pctPerOwner = Math.round(100 / ownerIds.length);
      for (const ownerId of ownerIds) {
        await ensureOwnership(propertyId, ownerId, pctPerOwner);
      }
    }

    if (!propertyId) continue;

    // Import leases
    for (const lease of propData.leases) {
      const leaseStats = { created: 0, skipped: 0, noRent: 0 };
      await importLease(propertyId, lease, leaseStats);
      stats.leasesCreated += leaseStats.created;
      stats.leasesSkipped += leaseStats.skipped;
      stats.leasesNoRent += leaseStats.noRent;
    }
  }

  log(`\n  📊 ${group.group}: properties created=${stats.propertiesCreated} skipped=${stats.propertiesSkipped}, leases created=${stats.leasesCreated} skipped=${stats.leasesSkipped} no-rent=${stats.leasesNoRent}`);
}

// ─────────────────────────────────────────────
// UPDATE ALL NETOBITZ PROPERTIES NOTES
// ─────────────────────────────────────────────

async function tagAllNetobitzProperties(sourceTag: string) {
  log('\n📝 Tagging all existing Netobitz properties (file numbers 1-28)...');
  const netobitzProps = await prisma.property.findMany({
    where: {
      fileNumber: { in: Array.from({ length: 28 }, (_, i) => String(i + 1)) },
      deletedAt: null,
    },
  });

  let updated = 0;
  for (const prop of netobitzProps) {
    if (!prop.notes?.includes('מקור:')) {
      const newNotes = prop.notes ? `${prop.notes}\n${sourceTag}` : sourceTag;
      await prisma.property.update({
        where: { id: prop.id },
        data: { notes: newNotes },
      });
      updated++;
    }
  }
  log(`   ✅ Tagged ${updated} properties with "${sourceTag}"`);
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  log('='.repeat(60));
  log('🚀 IMPORT ALL MANAGED PROPERTIES');
  log('='.repeat(60));

  // Load JSON
  const jsonPath = path.resolve(__dirname, '../../../../legacy/data/all-rental-data.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`JSON file not found: ${jsonPath}`);
  }
  const data: ImportData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  log(`\n📂 Loaded data from: ${jsonPath}`);
  log(`   Generated at: ${data.generated_at}`);
  log(`   Groups: ${data.groups.length}`);

  try {
    const [netobitz, sharon, harmon, greenspan] = data.groups;

    // Step 1: Tag all existing Netobitz properties (file numbers 1-28)
    await tagAllNetobitzProperties(netobitz.source_tag);

    // Step 2: Process Netobitz (existing properties + "various" new ones)
    await processNetobitz(netobitz);

    // Step 3: Process Sharon Estate
    await processNewGroup(sharon);

    // Step 4: Process Harmon family
    await processNewGroup(harmon);

    // Step 5: Process Greenspan
    await processNewGroup(greenspan);

    // Final Summary
    log('\n' + '='.repeat(60));
    log('📊 FINAL DATABASE COUNTS');
    log('='.repeat(60));

    const personCount = await prisma.person.count({ where: { deletedAt: null } });
    const propertyCount = await prisma.property.count({ where: { deletedAt: null } });
    const ownershipCount = await prisma.ownership.count({ where: { deletedAt: null } });
    const leaseCount = await prisma.rentalAgreement.count({ where: { deletedAt: null } });

    log(`  Persons:            ${personCount}`);
    log(`  Properties:         ${propertyCount}`);
    log(`  Ownerships:         ${ownershipCount}`);
    log(`  Rental Agreements:  ${leaseCount}`);

    const activeLeases = await prisma.rentalAgreement.count({
      where: { status: 'ACTIVE', deletedAt: null },
    });
    const expiredLeases = await prisma.rentalAgreement.count({
      where: { status: 'EXPIRED', deletedAt: null },
    });
    log(`\n  Active leases:  ${activeLeases}`);
    log(`  Expired leases: ${expiredLeases}`);

    log('\n✅ IMPORT COMPLETED SUCCESSFULLY');

  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
