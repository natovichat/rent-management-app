/**
 * Import Netobitz Family Leases
 * 
 * This script imports lease data from the Excel file and links them to existing properties.
 * Leases without matching properties are skipped and logged to a separate file.
 */

import { PrismaClient, LeaseStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load leases mapping data (already matched to properties)
const mappingDataPath = path.join(__dirname, '../../../../נכסים נטוביץ/lease-property-mapping.json');
const mappingData = JSON.parse(fs.readFileSync(mappingDataPath, 'utf-8'));

// Get account name
const ACCOUNT_NAME = 'משפחת נטוביץ';

// Track unmatched leases
const unmatchedLeases: any[] = [];
const matchedLeases: any[] = [];

interface LeaseData {
  row: number;
  sequential: string;
  file_number: string;
  address: string;
  apartment_number: string;
  floor: string;
  room_count: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  monthly_rent_total: number;
  our_share: number;
  start_date: string | null;
  end_date: string | null;
  notes: string;
  insurance: string;
  arnona_number: string;
  electric_meter: string;
  handled_by: string;
}

function parseRoomCount(roomCountStr: string): number | undefined {
  if (!roomCountStr || roomCountStr === '') return undefined;
  
  // Handle decimal with comma
  const cleaned = roomCountStr.replace(',', '.');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? undefined : parsed;
}

function determineLeaseStatus(startDate: Date | null, endDate: Date | null): LeaseStatus {
  const now = new Date();
  
  if (!startDate || !endDate) {
    return LeaseStatus.ACTIVE; // Default for leases without full dates
  }
  
  if (now < startDate) {
    return LeaseStatus.FUTURE;
  } else if (now > endDate) {
    return LeaseStatus.ENDED;
  } else {
    return LeaseStatus.ACTIVE;
  }
}

async function main() {
  console.log('🏠 Starting Netobitz Leases Import...\n');
  
  // Get account
  const account = await prisma.account.findFirst({
    where: { name: ACCOUNT_NAME },
  });
  
  if (!account) {
    throw new Error(`Account "${ACCOUNT_NAME}" not found`);
  }
  
  console.log(`✅ Found account: ${account.name} (${account.id})\n`);
  
  // Get all properties for this account
  const properties = await prisma.property.findMany({
    where: { accountId: account.id },
    include: {
      units: true,
    },
  });
  
  console.log(`✅ Found ${properties.length} existing properties\n`);
  
  // Create property lookup by fileNumber (sequential number from import)
  const propertyByFileNumber = new Map();
  properties.forEach(prop => {
    if (prop.fileNumber) {
      propertyByFileNumber.set(prop.fileNumber, prop);
    }
  });
  
  // Stats
  let tenantsCreated = 0;
  let unitsCreated = 0;
  let leasesCreated = 0;
  let leasesSkipped = 0;
  
  // Process each matched lease (from mapping file)
  for (const match of mappingData) {
    const leaseData = match.lease as LeaseData;
    const propertyFileNumber = match.property.fileNumber;
    
    console.log(`\n📋 Processing Lease #${leaseData.sequential}: ${leaseData.address}`);
    console.log(`   Matched to: ${match.property.address} (File: ${propertyFileNumber})`);
    console.log(`   Tenant: ${leaseData.tenant_name}`);
    
    // Find property by our internal file number
    const property = propertyByFileNumber.get(propertyFileNumber);
    
    if (!property) {
      console.log(`   ⚠️  Property not found in DB (File: ${propertyFileNumber})`);
      unmatchedLeases.push({
        ...leaseData,
        matchedPropertyFile: propertyFileNumber,
        reason: 'Property not found in database',
      });
      leasesSkipped++;
      continue;
    }
    
    console.log(`   ✅ Found property in DB: ${property.address} (${property.id})`);
    
    try {
      // 1. Create or get tenant
      let tenant = await prisma.tenant.findFirst({
        where: {
          accountId: account.id,
          name: leaseData.tenant_name,
        },
      });
      
      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            accountId: account.id,
            name: leaseData.tenant_name,
            email: leaseData.tenant_email || undefined,
            phone: leaseData.tenant_phone || undefined,
            notes: leaseData.handled_by ? `בטיפול: ${leaseData.handled_by}` : undefined,
          },
        });
        console.log(`   ✅ Created tenant: ${tenant.name}`);
        tenantsCreated++;
      } else {
        console.log(`   ✓  Found existing tenant: ${tenant.name}`);
      }
      
      // 2. Create or get unit
      let unit = await prisma.unit.findFirst({
        where: {
          propertyId: property.id,
          apartmentNumber: leaseData.apartment_number || 'N/A',
        },
      });
      
      if (!unit) {
        // Parse room count
        const roomCount = parseRoomCount(leaseData.room_count);
        
        // Parse floor (handle special cases like "5+6", "קרקע")
        let floor: number | undefined = undefined;
        if (leaseData.floor && leaseData.floor !== '' && leaseData.floor !== 'קרקע') {
          // Extract first number from floor string (e.g., "5+6" -> 5)
          const floorMatch = leaseData.floor.match(/\d+/);
          if (floorMatch) {
            floor = parseInt(floorMatch[0]);
          }
        }
        
        unit = await prisma.unit.create({
          data: {
            propertyId: property.id,
            accountId: account.id,
            apartmentNumber: leaseData.apartment_number || 'N/A',
            floor: floor,
            roomCount: roomCount,
            notes: leaseData.floor === 'קרקע' ? 'קומת קרקע' : undefined,
          },
        });
        console.log(`   ✅ Created unit: ${unit.apartmentNumber} (Floor: ${leaseData.floor})`);
        unitsCreated++;
      } else {
        console.log(`   ✓  Found existing unit: ${unit.apartmentNumber}`);
      }
      
      // 3. Create lease
      // Parse dates
      const startDate = leaseData.start_date ? new Date(leaseData.start_date) : null;
      const endDate = leaseData.end_date ? new Date(leaseData.end_date) : null;
      
      // Determine status
      const status = determineLeaseStatus(startDate, endDate);
      
      // Build notes
      const noteParts = [];
      if (leaseData.notes) noteParts.push(leaseData.notes);
      if (leaseData.insurance) noteParts.push(`ביטוח: ${leaseData.insurance}`);
      if (leaseData.arnona_number) noteParts.push(`ארנונה: ${leaseData.arnona_number}`);
      if (leaseData.electric_meter) noteParts.push(`חשמל: ${leaseData.electric_meter}`);
      if (leaseData.our_share !== leaseData.monthly_rent_total) {
        noteParts.push(`חלק שלנו: ₪${leaseData.our_share} מתוך ₪${leaseData.monthly_rent_total}`);
      }
      const notes = noteParts.join(' | ');
      
      // Check if lease already exists
      const existingLease = await prisma.lease.findFirst({
        where: {
          unitId: unit.id,
          tenantId: tenant.id,
          startDate: startDate || undefined,
        },
      });
      
      if (existingLease) {
        console.log(`   ⚠️  Lease already exists, skipping`);
        continue;
      }
      
      // Use our_share as monthly rent (since that's what we actually receive)
      const monthlyRent = leaseData.our_share || leaseData.monthly_rent_total;
      
      const lease = await prisma.lease.create({
        data: {
          accountId: account.id,
          unitId: unit.id,
          tenantId: tenant.id,
          startDate: startDate || new Date(), // Default to now if no start date
          endDate: endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to 1 year
          monthlyRent: monthlyRent,
          paymentTo: 'Owner', // Default - can be updated later
          status: status,
          notes: notes || undefined,
        },
      });
      
      console.log(`   ✅ Created lease: ₪${monthlyRent}/month (Status: ${status})`);
      leasesCreated++;
      
      matchedLeases.push({
        ...leaseData,
        propertyId: property.id,
        unitId: unit.id,
        tenantId: tenant.id,
        leaseId: lease.id,
      });
      
    } catch (error) {
      console.error(`   ❌ Error creating lease:`, error);
      unmatchedLeases.push({
        ...leaseData,
        reason: `Error: ${error instanceof Error ? error.message : error}`,
      });
      leasesSkipped++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total leases processed: ${mappingData.length}`);
  console.log(`Tenants created: ${tenantsCreated}`);
  console.log(`Units created: ${unitsCreated}`);
  console.log(`Leases created: ${leasesCreated}`);
  console.log(`Leases skipped: ${leasesSkipped}`);
  
  // Write unmatched leases to file
  if (unmatchedLeases.length > 0) {
    const unmatchedPath = path.join(__dirname, '../../../../נכסים נטוביץ/שכירויות-לבדיקה.json');
    fs.writeFileSync(unmatchedPath, JSON.stringify(unmatchedLeases, null, 2), 'utf-8');
    console.log(`\n⚠️  ${unmatchedLeases.length} unmatched leases written to: שכירויות-לבדיקה.json`);
    
    console.log('\nUnmatched leases:');
    unmatchedLeases.forEach(lease => {
      console.log(`  - ${lease.address} (File: ${lease.file_number}): ${lease.reason}`);
    });
  }
  
  // Verification
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION');
  console.log('='.repeat(60));
  
  const totalLeases = await prisma.lease.count({
    where: { accountId: account.id },
  });
  
  const totalTenants = await prisma.tenant.count({
    where: { accountId: account.id },
  });
  
  const totalUnits = await prisma.unit.count({
    where: { accountId: account.id },
  });
  
  console.log(`Total leases in DB: ${totalLeases}`);
  console.log(`Total tenants in DB: ${totalTenants}`);
  console.log(`Total units in DB: ${totalUnits}`);
  
  console.log('\n✅ Import completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
