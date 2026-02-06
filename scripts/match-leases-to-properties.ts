/**
 * Match leases to properties by address similarity
 */
import * as fs from 'fs';
import * as path from 'path';

const leasesDataPath = path.resolve(__dirname, '../נכסים נטוביץ/leases-data.json');
const leasesData = JSON.parse(fs.readFileSync(leasesDataPath, 'utf-8'));

// Properties from database (from previous output)
const properties = [
  { fileNumber: "1", address: "לביא 6, רמת גן" },
  { fileNumber: "2", address: "דרך המלך 11, גני תקווה" },
  { fileNumber: "3", address: "הרברט סמואל, חדרה" },
  { fileNumber: "4", address: "שאול חרנ\"ם 10, פתח תקווה" },
  { fileNumber: "7", address: "הרוא\"ה 295, רמת גן" },
  { fileNumber: "8", address: "מנדלי 7, תל אביב" },
  { fileNumber: "10", address: "מגדל ב.ס.ר 3 קומה 26" },
  { fileNumber: "11", address: "טבנקין 22, גבעתיים" },
  { fileNumber: "12", address: "הפלמ\"ח 50, ירושלים" },
  { fileNumber: "13", address: "בר-כוכבא 34, רמת גן" },
  { fileNumber: "14", address: "ראשון לציון - קרקע חקלאית" },
  { fileNumber: "15", address: "רחובות - קרקע חקלאית" },
  { fileNumber: "16", address: "חדרה - קרקע לבניה" },
  { fileNumber: "17", address: "לייפציג, גרמניה" },
  { fileNumber: "18", address: "דימפל, לייפציג, גרמניה" },
  { fileNumber: "19", address: "לימבורגר, לייפציג, גרמניה" },
  { fileNumber: "20", address: "גלפי, גרמניה" },
  { fileNumber: "21", address: "מוצקין 22, רעננה" },
  { fileNumber: "22", address: "שלום עליכם 6, רמת גן" },
  { fileNumber: "23", address: "פטרסון 3, יד אליהו, תל אביב" },
  { fileNumber: "25", address: "אלנבי 85, תל אביב - מחסן" },
  { fileNumber: "26", address: "אלנבי 85, תל אביב" },
  { fileNumber: "27", address: "מורדות הכרמל - קרקע" },
  { fileNumber: "28", address: "מניות בחברים נטו דיור בע\"מ" },
  { fileNumber: "29", address: "שאול חרנם 6, פתח תקווה" },
  { fileNumber: "30", address: "הרצל 57" },
  { fileNumber: "31", address: "גבעת שמואל - מגרשים 51 ו56" },
  { fileNumber: "24", address: "הפלמח 9, פתח תקווה" },
];

function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/["'״׳,]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/רא"ה/g, 'ראה')
    .replace(/פלמ"ח/g, 'פלמח')
    .replace(/ת"א/g, 'תל אביב')
    .trim();
}

function matchAddress(leaseAddr: string, propertyAddr: string): number {
  const norm1 = normalizeAddress(leaseAddr);
  const norm2 = normalizeAddress(propertyAddr);
  
  // Extract street name and number from both
  const street1Match = norm1.match(/^([א-ת\s]+)\s*(\d+)/);
  const street2Match = norm2.match(/^([א-ת\s]+)\s*(\d+)/);
  
  if (street1Match && street2Match) {
    const [, street1, num1] = street1Match;
    const [, street2, num2] = street2Match;
    
    // Check if street name and number match
    if (street1.trim() === street2.trim() && num1 === num2) {
      return 100; // Perfect match
    }
    
    // Check if street name contains or similar
    if (street1.includes(street2) || street2.includes(street1)) {
      if (num1 === num2) {
        return 90; // Good match
      }
    }
  }
  
  // Fuzzy match - check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 70;
  }
  
  // Check for common words
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  const commonWords = words1.filter(w => words2.includes(w) && w.length > 2);
  
  if (commonWords.length >= 2) {
    return 50;
  }
  
  return 0;
}

console.log('🔍 Matching leases to properties by address...\n');
console.log('='.repeat(80));

const matches: any[] = [];

for (const lease of leasesData) {
  if (lease.sequential === 'סידורי' || !lease.tenant_name) {
    continue;
  }
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const property of properties) {
    const score = matchAddress(lease.address, property.address);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = property;
    }
  }
  
  console.log(`\nLease #${lease.sequential}: ${lease.address}`);
  if (bestMatch && bestScore >= 50) {
    console.log(`  ✅ Match (score: ${bestScore}): ${bestMatch.address} (File: ${bestMatch.fileNumber})`);
    matches.push({
      lease,
      property: bestMatch,
      score: bestScore,
    });
  } else {
    console.log(`  ❌ No good match found (best score: ${bestScore})`);
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n✅ Matched ${matches.length} out of ${leasesData.length - 1} leases\n`);

// Save matches mapping
const mappingPath = path.resolve(__dirname, '../נכסים נטוביץ/lease-property-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(matches, null, 2), 'utf-8');
console.log(`📄 Mapping saved to: lease-property-mapping.json`);
