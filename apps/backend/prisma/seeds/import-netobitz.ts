#!/usr/bin/env ts-node

/**
 * Netobitz Family Property Portfolio Import Script
 * 
 * This script imports the complete Netobitz family property portfolio
 * including accounts, owners, properties, ownerships, mortgages, and units.
 * 
 * Source: רשימת נכסים – יצחק נטוביץ 14.12.2021
 * 
 * Usage:
 *   npx ts-node prisma/seeds/import-netobitz.ts
 */

import { PrismaClient, PropertyType, PropertyStatus, OwnerType, OwnershipType, MortgageStatus } from '@prisma/client';
import { netobitzData } from './netobitz-data';

const prisma = new PrismaClient();

// Map property descriptions to types
function inferPropertyType(description: string, address: string): PropertyType {
  const desc = description.toLowerCase() + ' ' + address.toLowerCase();
  
  if (desc.includes('קרקע') || desc.includes('מגרש')) {
    if (desc.includes('חקלאי')) {
      return PropertyType.LAND;
    }
    return PropertyType.LAND;
  }
  
  if (desc.includes('משרד')) {
    return PropertyType.COMMERCIAL;
  }
  
  if (desc.includes('מחסן')) {
    return PropertyType.COMMERCIAL;
  }
  
  if (desc.includes('מניות') || desc.includes('השקעה')) {
    return PropertyType.RESIDENTIAL; // Default for investments
  }
  
  return PropertyType.RESIDENTIAL;
}

// Map descriptions to property status
function inferPropertyStatus(notes?: string, description?: string): PropertyStatus {
  const text = (notes || '') + ' ' + (description || '');
  
  if (text.includes('נמכר')) {
    return PropertyStatus.SOLD;
  }
  
  if (text.includes('בבניה') || text.includes('בהליכי')) {
    return PropertyStatus.IN_CONSTRUCTION;
  }
  
  if (text.includes('השקעה')) {
    return PropertyStatus.INVESTMENT;
  }
  
  return PropertyStatus.OWNED;
}

// Extract city from address if not specified
function extractCity(address: string, specifiedCity?: string): string {
  if (specifiedCity && specifiedCity !== 'לא צוין') {
    return specifiedCity;
  }
  
  const cityPatterns = [
    'רמת גן',
    'גני תקווה',
    'פתח תקווה',
    'תל אביב',
    'ירושלים',
    'גבעתיים',
    'חדרה',
    'ראשון לציון',
    'רחובות',
    'רעננה',
    'גבעת שמואל',
    'לייפציג',
    'גרמניה',
  ];
  
  for (const city of cityPatterns) {
    if (address.includes(city)) {
      return city;
    }
  }
  
  return 'לא צוין';
}

// Main import function
async function main() {
  console.log('🏢 Starting Netobitz Family Property Import');
  console.log('=' .repeat(80));
  console.log('');
  
  try {
    // Step 1: Create or get account
    console.log('📋 Step 1: Creating account...');
    
    let account = await prisma.account.findFirst({
      where: { name: netobitzData.account.name },
    });
    
    if (account) {
      console.log(`   ✅ Account already exists: ${account.name} (${account.id})`);
    } else {
      account = await prisma.account.create({
        data: {
          name: netobitzData.account.name,
          status: 'ACTIVE',
        },
      });
      console.log(`   ✅ Created account: ${account.name} (${account.id})`);
    }
    
    console.log('');
    
    // Step 2: Create or get owners
    console.log('👥 Step 2: Creating owners...');
    
    const ownerMap = new Map<string, string>(); // name -> id
    
    for (const ownerData of netobitzData.owners) {
      let owner = await prisma.owner.findFirst({
        where: {
          accountId: account.id,
          name: ownerData.name,
        },
      });
      
      if (owner) {
        console.log(`   ↪️  Owner already exists: ${owner.name}`);
      } else {
        owner = await prisma.owner.create({
          data: {
            accountId: account.id,
            name: ownerData.name,
            email: ownerData.email,
            phone: ownerData.phone,
            type: ownerData.name.includes('ושות') ? OwnerType.PARTNERSHIP : OwnerType.INDIVIDUAL,
          },
        });
        console.log(`   ✅ Created owner: ${owner.name} (${owner.id})`);
      }
      
      ownerMap.set(ownerData.name, owner.id);
    }
    
    console.log(`   📊 Total owners: ${ownerMap.size}`);
    console.log('');
    
    // Step 3: Create properties
    console.log('🏘️  Step 3: Creating properties...');
    
    const propertyMap = new Map<string, string>(); // fileNumber -> id
    let propertiesCreated = 0;
    let propertiesSkipped = 0;
    
    for (const propData of netobitzData.properties) {
      // Check if property already exists (by address and fileNumber)
      let property = await prisma.property.findFirst({
        where: {
          accountId: account.id,
          OR: [
            { fileNumber: propData.fileNumber },
            { 
              AND: [
                { address: propData.address },
                { gush: propData.gush || undefined }
              ]
            }
          ],
        },
      });
      
      if (property) {
        console.log(`   ↪️  Property #${propData.fileNumber} already exists: ${propData.address}`);
        propertiesSkipped++;
      } else {
        const city = extractCity(propData.address, propData.city);
        const country = city.includes('גרמניה') || city.includes('לייפציג') ? 'Germany' : 'Israel';
        
        property = await prisma.property.create({
          data: {
            accountId: account.id,
            address: propData.address,
            fileNumber: propData.fileNumber,
            type: inferPropertyType(propData.description, propData.address),
            status: inferPropertyStatus(propData.notes, propData.description),
            city,
            country,
            gush: propData.gush,
            helka: propData.helka,
            estimatedValue: propData.currentValue || undefined,
            isMortgaged: !!propData.mortgage,
            notes: propData.notes,
          },
        });
        
        console.log(`   ✅ Created property #${propData.fileNumber}: ${propData.address} (${property.id.substring(0, 8)}...)`);
        propertiesCreated++;
      }
      
      propertyMap.set(propData.fileNumber, property.id);
    }
    
    console.log(`   📊 Properties created: ${propertiesCreated}, skipped: ${propertiesSkipped}`);
    console.log('');
    
    // Step 4: Create property ownerships
    console.log('🤝 Step 4: Creating property ownerships...');
    
    let ownershipsCreated = 0;
    let ownershipsSkipped = 0;
    
    for (const propData of netobitzData.properties) {
      const propertyId = propertyMap.get(propData.fileNumber);
      
      if (!propertyId) {
        console.log(`   ⚠️  Property #${propData.fileNumber} not found, skipping ownerships`);
        continue;
      }
      
      for (const ownerData of propData.owners) {
        const ownerId = ownerMap.get(ownerData.name);
        
        if (!ownerId) {
          console.log(`   ⚠️  Owner ${ownerData.name} not found, skipping`);
          continue;
        }
        
        // Check if ownership already exists
        const existing = await prisma.propertyOwnership.findFirst({
          where: {
            propertyId,
            ownerId,
          },
        });
        
        if (existing) {
          ownershipsSkipped++;
          continue;
        }
        
        await prisma.propertyOwnership.create({
          data: {
            propertyId,
            ownerId,
            accountId: account.id,
            ownershipPercentage: ownerData.percentage || 100,
            ownershipType: OwnershipType.FULL,
            startDate: new Date('2021-12-14'), // Date from source document
          },
        });
        
        ownershipsCreated++;
      }
    }
    
    console.log(`   📊 Ownerships created: ${ownershipsCreated}, skipped: ${ownershipsSkipped}`);
    console.log('');
    
    // Step 5: Create mortgages
    console.log('🏦 Step 5: Creating mortgages...');
    
    let mortgagesCreated = 0;
    let mortgagesSkipped = 0;
    
    for (const propData of netobitzData.properties) {
      if (!propData.mortgage) {
        continue;
      }
      
      const propertyId = propertyMap.get(propData.fileNumber);
      
      if (!propertyId) {
        console.log(`   ⚠️  Property #${propData.fileNumber} not found, skipping mortgage`);
        continue;
      }
      
      // Check if mortgage already exists
      const existing = await prisma.mortgage.findFirst({
        where: {
          propertyId,
          bank: propData.mortgage.bank,
          loanAmount: propData.mortgage.amount,
        },
      });
      
      if (existing) {
        mortgagesSkipped++;
        continue;
      }
      
      await prisma.mortgage.create({
        data: {
          propertyId,
          accountId: account.id,
          bank: propData.mortgage.bank,
          loanAmount: propData.mortgage.amount,
          monthlyPayment: propData.mortgage.monthlyPayment || undefined,
          startDate: new Date('2021-12-14'), // Default date from source
          status: MortgageStatus.ACTIVE,
          linkedProperties: [], // Can be updated later for linked mortgages
        },
      });
      
      mortgagesCreated++;
      console.log(`   ✅ Created mortgage for property #${propData.fileNumber}: ${propData.mortgage.bank} - ${propData.mortgage.amount.toLocaleString()} ₪`);
    }
    
    console.log(`   📊 Mortgages created: ${mortgagesCreated}, skipped: ${mortgagesSkipped}`);
    console.log('');
    
    // Step 6: Create units
    console.log('🏢 Step 6: Creating units...');
    
    let unitsCreated = 0;
    let unitsSkipped = 0;
    
    for (const propData of netobitzData.properties) {
      if (!propData.units || propData.units.length === 0) {
        continue;
      }
      
      const propertyId = propertyMap.get(propData.fileNumber);
      
      if (!propertyId) {
        console.log(`   ⚠️  Property #${propData.fileNumber} not found, skipping units`);
        continue;
      }
      
      for (const unitData of propData.units) {
        const apartmentNumber = unitData.apartmentNumber || 'יחידה ראשית';
        
        // Check if unit already exists
        const existing = await prisma.unit.findFirst({
          where: {
            propertyId,
            apartmentNumber,
          },
        });
        
        if (existing) {
          unitsSkipped++;
          continue;
        }
        
        await prisma.unit.create({
          data: {
            propertyId,
            accountId: account.id,
            apartmentNumber,
            floor: unitData.floor,
            roomCount: unitData.roomCount ? Math.floor(unitData.roomCount) : undefined,
            area: unitData.area || undefined,
          },
        });
        
        unitsCreated++;
      }
    }
    
    console.log(`   📊 Units created: ${unitsCreated}, skipped: ${unitsSkipped}`);
    console.log('');
    
    // Step 7: Verification
    console.log('✅ Step 7: Verification');
    console.log('=' .repeat(80));
    
    const accountCount = await prisma.account.count({ where: { id: account.id } });
    const ownerCount = await prisma.owner.count({ where: { accountId: account.id } });
    const propertyCount = await prisma.property.count({ where: { accountId: account.id } });
    const ownershipCount = await prisma.propertyOwnership.count({ where: { accountId: account.id } });
    const mortgageCount = await prisma.mortgage.count({ where: { accountId: account.id } });
    const unitCount = await prisma.unit.count({ where: { accountId: account.id } });
    
    console.log(`Account:            ${accountCount}`);
    console.log(`Owners:             ${ownerCount}`);
    console.log(`Properties:         ${propertyCount}`);
    console.log(`Ownerships:         ${ownershipCount}`);
    console.log(`Mortgages:          ${mortgageCount}`);
    console.log(`Units:              ${unitCount}`);
    console.log('');
    
    // Calculate totals
    const properties = await prisma.property.findMany({
      where: { accountId: account.id },
      include: {
        mortgages: true,
      },
    });
    
    const totalValue = properties.reduce((sum, p) => {
      return sum + (p.estimatedValue ? Number(p.estimatedValue) : 0);
    }, 0);
    
    const totalMortgages = properties.reduce((sum, p) => {
      return sum + p.mortgages.reduce((mSum, m) => {
        return mSum + Number(m.loanAmount);
      }, 0);
    }, 0);
    
    const netValue = totalValue - totalMortgages;
    
    console.log('💰 Financial Summary:');
    console.log(`   Total Value:      ${totalValue.toLocaleString()} ₪`);
    console.log(`   Total Mortgages:  ${totalMortgages.toLocaleString()} ₪`);
    console.log(`   Net Value:        ${netValue.toLocaleString()} ₪`);
    console.log('');
    
    // List properties by owner
    console.log('📊 Properties by Owner:');
    
    for (const [ownerName, ownerId] of ownerMap.entries()) {
      const ownershipCount = await prisma.propertyOwnership.count({
        where: { ownerId },
      });
      console.log(`   ${ownerName}: ${ownershipCount} properties`);
    }
    
    console.log('');
    console.log('=' .repeat(80));
    console.log('✅ IMPORT COMPLETED SUCCESSFULLY');
    console.log('=' .repeat(80));
    console.log('');
    console.log('⚠️  IMPORTANT: The following data uses placeholder values:');
    console.log('   - All owner email addresses (@temp-import.local)');
    console.log('   - All owner phone numbers (050-000-00XX)');
    console.log('   - Account email address');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Review imported data in the application');
    console.log('   2. Update owner contact information (emails and phones)');
    console.log('   3. Update account email address');
    console.log('   4. Verify property values and mortgage details');
    console.log('   5. Add missing cadastral data (gush/helka) where needed');
    console.log('');
    console.log('📄 See import-log.md for detailed information about placeholders');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error during import:');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
