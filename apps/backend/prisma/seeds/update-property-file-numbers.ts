/**
 * Update Property File Numbers from Lease Data
 * 
 * This script updates property file numbers from sequential numbers (1, 2, 3...)
 * to the original file numbers from the lease data (2642/7, 1672/41, etc.)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load lease-property mapping
const mappingPath = path.join(__dirname, '../../../../נכסים נטוביץ/lease-property-mapping.json');
const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

const ACCOUNT_NAME = 'משפחת נטוביץ';

async function main() {
  console.log('🔄 Updating Property File Numbers...\n');
  
  // Get account
  const account = await prisma.account.findFirst({
    where: { name: ACCOUNT_NAME },
  });
  
  if (!account) {
    throw new Error(`Account "${ACCOUNT_NAME}" not found`);
  }
  
  console.log(`✅ Found account: ${account.name} (${account.id})\n`);
  
  // Build mapping: sequential file number -> original file number
  const fileNumberUpdates = new Map<string, string>();
  
  for (const match of mappingData) {
    const sequentialFileNumber = match.property.fileNumber; // "12", "8", etc.
    const originalFileNumber = match.lease.file_number; // "2642/7", "1672/41", etc.
    
    // For properties with multiple leases (like מנדלי 7), keep the first one
    if (!fileNumberUpdates.has(sequentialFileNumber)) {
      fileNumberUpdates.set(sequentialFileNumber, originalFileNumber);
    }
  }
  
  console.log(`📋 Found ${fileNumberUpdates.size} properties to update:\n`);
  
  // Display mapping
  for (const [seq, orig] of fileNumberUpdates.entries()) {
    console.log(`   ${seq} → ${orig}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  // Update each property
  for (const [sequentialFileNumber, originalFileNumber] of fileNumberUpdates.entries()) {
    // Find property by current file number
    const property = await prisma.property.findFirst({
      where: {
        accountId: account.id,
        fileNumber: sequentialFileNumber,
      },
    });
    
    if (!property) {
      console.log(`\n⚠️  Property with file number ${sequentialFileNumber} not found`);
      skippedCount++;
      continue;
    }
    
    console.log(`\n📝 Updating: ${property.address}`);
    console.log(`   Current file number: ${property.fileNumber}`);
    console.log(`   New file number: ${originalFileNumber}`);
    
    // Check if new file number already exists
    const existingWithNewNumber = await prisma.property.findFirst({
      where: {
        accountId: account.id,
        fileNumber: originalFileNumber,
        NOT: {
          id: property.id,
        },
      },
    });
    
    if (existingWithNewNumber) {
      console.log(`   ⚠️  File number ${originalFileNumber} already exists for: ${existingWithNewNumber.address}`);
      console.log(`   Skipping to avoid duplicate...`);
      skippedCount++;
      continue;
    }
    
    // Update file number
    await prisma.property.update({
      where: { id: property.id },
      data: { fileNumber: originalFileNumber },
    });
    
    console.log(`   ✅ Updated successfully`);
    updatedCount++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('UPDATE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Properties updated: ${updatedCount}`);
  console.log(`Properties skipped: ${skippedCount}`);
  
  // Verification
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION');
  console.log('='.repeat(60));
  
  const updatedProperties = await prisma.property.findMany({
    where: { 
      accountId: account.id,
      fileNumber: {
        in: Array.from(fileNumberUpdates.values()),
      },
    },
    select: {
      fileNumber: true,
      address: true,
    },
    orderBy: {
      fileNumber: 'asc',
    },
  });
  
  console.log(`\nProperties with updated file numbers (${updatedProperties.length}):\n`);
  updatedProperties.forEach((prop, i) => {
    console.log(`${i + 1}. File: ${prop.fileNumber} - ${prop.address}`);
  });
  
  console.log('\n✅ File number update completed!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
