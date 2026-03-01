#!/usr/bin/env ts-node

/**
 * Netobitz Family Property Portfolio Import Script - v2
 * Matches the current Prisma schema with Person/Ownership/Mortgage models
 *
 * Source: רשימת נכסים – יצחק נטוביץ 14.12.2021
 *
 * Usage:
 *   cd apps/backend && npx ts-node prisma/seeds/import-netobitz-v2.ts
 */

import {
  PrismaClient,
  PropertyType,
  PropertyStatus,
  PersonType,
  OwnershipType,
  MortgageStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// DATA DEFINITIONS
// ============================================================

const owners = [
  { name: 'יצחק נטוביץ', email: 'yitzhak.netobitz@family.local', phone: '050-000-0001', type: PersonType.INDIVIDUAL },
  { name: 'אילנה נטוביץ', email: 'ilana.netobitz@family.local', phone: '050-000-0002', type: PersonType.INDIVIDUAL },
  { name: 'ליאת נטוביץ', email: 'liat.netobitz@family.local', phone: '050-000-0003', type: PersonType.INDIVIDUAL },
  { name: 'מיכל נטוביץ', email: 'michal.netobitz@family.local', phone: '050-000-0004', type: PersonType.INDIVIDUAL },
  { name: 'אביעד נטוביץ', email: 'aviad.netobitz@family.local', phone: '050-000-0005', type: PersonType.INDIVIDUAL },
  { name: 'י. נטוביץ ושות', email: 'netobitz-partners@family.local', phone: '050-000-0006', type: PersonType.PARTNERSHIP },
];

interface PropertyData {
  fileNumber: string;
  owners: Array<{ name: string; percentage: number }>;
  address: string;
  city: string;
  country?: string;
  gush?: string;
  helka?: string;
  type: PropertyType;
  status: PropertyStatus;
  estimatedValue?: number;
  totalArea?: number;
  landArea?: number;
  balconySizeSqm?: number;
  mortgage?: {
    bank: string;
    amount: number;
    monthlyPayment?: number;
    payerName: string;
  };
  notes?: string;
}

const properties: PropertyData[] = [
  // Property 1 - לביא 6, רמת גן
  {
    fileNumber: '1',
    owners: [{ name: 'יצחק נטוביץ', percentage: 50 }],
    address: 'לביא 6, רמת גן',
    city: 'רמת גן',
    gush: '6158',
    helka: '371-376',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 800000,
    totalArea: 60,
    notes: 'בהליכי פינוי בינוי מתקדמים חברת קרסו. לא משועבדת. צפי 6 שנים. 50% בבעלות יצחק נטוביץ, 50% אריאלה לאובר',
  },

  // Property 2 - דרך המלך 11, גני תקווה
  {
    fileNumber: '2',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'דרך המלך 11, גני תקווה',
    city: 'גני תקווה',
    gush: '6717',
    helka: '225',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 2700000,
    totalArea: 90,
    mortgage: {
      bank: 'בנק לאומי',
      amount: 6000000,
      monthlyPayment: 57000,
      payerName: 'יצחק נטוביץ',
    },
    notes: 'דירה חדשה קומה 2. גוש 6717 חלקה 225 תת חלקה 15. משועבדת ביחד עם נכס מספר 8 ו11 לטובת הלוואה הגדולה של 6 מליון - לבנק לאומי',
  },

  // Property 3 - חדרה, קרקע
  {
    fileNumber: '3',
    owners: [{ name: 'יצחק נטוביץ', percentage: 16.67 }],
    address: 'הרברט סמואל, חדרה',
    city: 'חדרה',
    gush: '1036',
    helka: '181, 60',
    type: PropertyType.LAND,
    status: PropertyStatus.OWNED,
    estimatedValue: 1200000,
    notes: '1/6 ממגרש בחדרה. חלקה 60: 1/6 מדירה/מחסן בקומת קרקע. חלקה 181: 1/6 מגרש. לא משועבד. שותפים: שוקי שרון + זיו שמור (0509733355)',
  },

  // Property 4 - שאול חרנ"ם 10, פ"ת - דירה 45
  {
    fileNumber: '4',
    owners: [
      { name: 'יצחק נטוביץ', percentage: 50 },
      { name: 'אילנה נטוביץ', percentage: 50 },
    ],
    address: 'שאול חרנ"ם 10, פתח תקווה',
    city: 'פתח תקווה',
    gush: '6393',
    helka: '314/45',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 4000000,
    totalArea: 140,
    balconySizeSqm: 50,
    mortgage: {
      bank: 'בנק מרכנתיל',
      amount: 1400000,
      payerName: 'יצחק נטוביץ',
    },
    notes: 'דירה מס\' 45, דירת פנטהאוס 140 מ"ר + מרפסת 50 מ"ר. משועבדת 1,400,000 ₪ בבנק מרכנתיל',
  },

  // Property 5 - שאול חרנ"ם 10, פ"ת - דירה 47
  {
    fileNumber: '5',
    owners: [{ name: 'ליאת נטוביץ', percentage: 100 }],
    address: 'שאול חרנ"ם 10, פתח תקווה - דירה 47',
    city: 'פתח תקווה',
    gush: '6393',
    helka: '314/47',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 3000000,
    totalArea: 90,
    balconySizeSqm: 50,
    notes: 'דירה מס\' 47, דירת פנטהאוס חדרים 90 מ"ר + מרפסת 50 מ"ר. לא משועבד',
  },

  // Property 6 - שאול חרנ"ם 10, פ"ת - דירה 6 (36%)
  {
    fileNumber: '6',
    owners: [{ name: 'ליאת נטוביץ', percentage: 36 }],
    address: 'שאול חרנ"ם 10, פתח תקווה - דירה 6',
    city: 'פתח תקווה',
    gush: '6393',
    helka: '314/6',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 1000000,
    notes: '36% מדירה מס\' 6 שווי דירה 3 מליון חלקי 972,000. יחד עם צביקה נטוביץ. לא משועבד',
  },

  // Property 7 - הרוא"ה 295, ר"ג
  {
    fileNumber: '7',
    owners: [{ name: 'אילנה נטוביץ', percentage: 100 }],
    address: 'הרוא"ה 295, רמת גן',
    city: 'רמת גן',
    gush: '6144',
    helka: '409/2',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 2700000,
    mortgage: {
      bank: 'בנק לאומי',
      amount: 400000,
      payerName: 'אילנה נטוביץ',
    },
    notes: 'דירה 4 חדרים - דירת קרקע. משועבד 400,000 ₪ - בנק לאומי',
  },

  // Property 8 - מנדלי 7, ת"א (2 דירות)
  {
    fileNumber: '8',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'מנדלי 7, תל אביב',
    city: 'תל אביב',
    gush: '6905',
    helka: '39/17, 39/16',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 3000000,
    mortgage: {
      bank: 'בנק לאומי',
      amount: 6000000,
      monthlyPayment: 57000,
      payerName: 'יצחק נטוביץ',
    },
    notes: '2 דירות בנות 1 חדר. יחידות 17 ו-16. משועבד ללאומי כחלק מ6 מליון',
  },

  // Property 10 - ב.ס.ר 3
  {
    fileNumber: '10',
    owners: [{ name: 'י. נטוביץ ושות', percentage: 50 }],
    address: 'מגדל ב.ס.ר 3, קומה 26',
    city: 'בני ברק',
    type: PropertyType.COMMERCIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 3000000,
    totalArea: 210,
    balconySizeSqm: 40,
    mortgage: {
      bank: 'בלמ"ש',
      amount: 700000,
      payerName: 'יצחק נטוביץ',
    },
    notes: 'חצי משרד - 210 מ"ר מתוך 420 (+ מרפסת בשטח 40 מ"ר). יחידות 103 + 105. משועבד הלוואה בבלמ"ש 700,000 ₪. שותף: יוסי גבילי',
  },

  // Property 11 - טבנקין 22, גבעתיים
  {
    fileNumber: '11',
    owners: [
      { name: 'יצחק נטוביץ', percentage: 50 },
      { name: 'אילנה נטוביץ', percentage: 50 },
    ],
    address: 'טבנקין 22, גבעתיים',
    city: 'גבעתיים',
    gush: '6156',
    helka: '559/21',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 8000000,
    totalArea: 280,
    balconySizeSqm: 150,
    mortgage: {
      bank: 'בנק לאומי',
      amount: 6000000,
      monthlyPayment: 57000,
      payerName: 'יצחק נטוביץ',
    },
    notes: 'דירת גג (2 קומות) שטח 280 מ"ר + 150 מ"ר מרפסת. משועבדת כחלק מהלוואת ה6 מליון',
  },

  // Property 12 - הפלמ"ח 50, ירושלים
  {
    fileNumber: '12',
    owners: [{ name: 'יצחק נטוביץ', percentage: 25 }],
    address: 'הפלמ"ח 50, ירושלים',
    city: 'ירושלים',
    gush: '63732',
    helka: '330',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 700000,
    mortgage: {
      bank: 'בלמ"ש',
      amount: 300000,
      payerName: 'יצחק נטוביץ',
    },
    notes: '1/4 דירה (המגרש 730 מ"ר ועליו בנויות 4 דירות). 1/4 של ליאת בפועל + 1/2 אילן אשר. משועבדת בלמ"ש 150,000 ₪',
  },

  // Property 13 - בר-כוכבא 34, ר"ג (נמכר)
  {
    fileNumber: '13',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'בר-כוכבא 34, רמת גן',
    city: 'רמת גן',
    gush: '1650, 1652',
    helka: '34',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.SOLD,
    estimatedValue: 2800000,
    notes: 'דירה חדשה בת 4 חדרים. נמכר אך לא הסתיים ב3,250,000. לא משועבדת',
  },

  // Property 14 - ראשון לציון - קרקע חקלאית
  {
    fileNumber: '14',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'קרקע חקלאית, ראשון לציון',
    city: 'ראשון לציון',
    gush: '3943',
    helka: '10',
    type: PropertyType.LAND,
    status: PropertyStatus.OWNED,
    estimatedValue: 2700000,
    landArea: 30000,
    notes: 'קרקע חקלאית 3 דונם. לא משועבדת. ליוסי וצביקה יש חלקים נוספים',
  },

  // Property 15 - רחובות - קרקע חקלאית
  {
    fileNumber: '15',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'קרקע חקלאית, רחובות',
    city: 'רחובות',
    gush: '3689',
    helka: '24',
    type: PropertyType.LAND,
    status: PropertyStatus.OWNED,
    estimatedValue: 5000000,
    landArea: 100000,
    notes: 'קרקע חקלאית 10 דונם. לא משועבדת',
  },

  // Property 16 - חדרה - קרקע לבניה
  {
    fileNumber: '16',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'קרקע לבניה, חדרה',
    city: 'חדרה',
    gush: '10026',
    helka: '46',
    type: PropertyType.LAND,
    status: PropertyStatus.IN_CONSTRUCTION,
    estimatedValue: 2800000,
    notes: 'קרקע ל-7 יח"ד. שנתיים-שלוש עד להתחלת בניה. שותפות עם עוזיאל ויבולים',
  },

  // Property 17 - לייפציג, גרמניה - בניין
  {
    fileNumber: '17',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'לייפציג, גרמניה - בניין',
    city: 'לייפציג',
    country: 'Germany',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.INVESTMENT,
    estimatedValue: 1800000,
    mortgage: {
      bank: 'בנק גרמני',
      amount: 350000,
      payerName: 'יצחק נטוביץ',
    },
    notes: '4 דירות בבעלות חברת איילי שאני מחזיק במניותיה. הלוואה של כ-100,000 אירו (350,000 ₪). משועבד מבנק גרמני. שווי 450,000 יורו',
  },

  // Property 18 - דימפל לייפציג
  {
    fileNumber: '18',
    owners: [{ name: 'יצחק נטוביץ', percentage: 12.5 }],
    address: 'דימפל, לייפציג, גרמניה',
    city: 'לייפציג',
    country: 'Germany',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.INVESTMENT,
    estimatedValue: 600000,
    notes: 'השקעה בבניין דירות ברחוב דימפל לייפציג באמצעות אפ-הולדינג. 1/8 נכס. 33% מהרווחים של הניהול. יניב שפיץ 054-3120178',
  },

  // Property 19 - לימבורגר לייפציג
  {
    fileNumber: '19',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'לימבורגר, לייפציג, גרמניה',
    city: 'לייפציג',
    country: 'Germany',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.INVESTMENT,
    estimatedValue: 600000,
    notes: 'השקעה בבניין דירות ברחוב לימבורגר לייפציג באמצעות אפ-הולדינג. חלק מהנכס',
  },

  // Property 20 - גלפי
  {
    fileNumber: '20',
    owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
    address: 'גלפי, גרמניה',
    city: 'גרמניה',
    country: 'Germany',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.INVESTMENT,
    estimatedValue: 1500000,
    notes: 'השקעה בבניין דירות גלפי באמצעות אפ-הולדינג. שתי דירות (מיכל הולכת לגור שם). מספר תיק 226/206. הסכם הלוואה 1.5 מליון לאפ-הולדינג עם ריבית 7% לשנה. תחילת החזר 16.11.2025. 38% מהרווחים',
  },

  // Property 21 - מוצקין 22, רעננה
  {
    fileNumber: '21',
    owners: [{ name: 'אילנה נטוביץ', percentage: 20 }],
    address: 'מוצקין 22, רעננה',
    city: 'רעננה',
    gush: '6580',
    helka: '329',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.IN_CONSTRUCTION,
    estimatedValue: 5000000,
    mortgage: {
      bank: 'לא צוין',
      amount: 800000,
      payerName: 'אילנה נטוביץ',
    },
    notes: '20% מהחלקה. שותפים: אברהם הנדלר, איציק וייס, צביקה. קומבינציה עם קבלן. היתר בנייה תוך חודשיים. 2 דירות. צריך לקחת הלוואה 800,000 למיסים',
  },

  // Property 22 - שלום עליכם 6, ר"ג
  {
    fileNumber: '22',
    owners: [{ name: 'ליאת נטוביץ', percentage: 100 }],
    address: 'שלום עליכם 6, רמת גן',
    city: 'רמת גן',
    gush: '6142',
    helka: '228/6',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 1800000,
    mortgage: {
      bank: 'לא צוין',
      amount: 300000,
      payerName: 'ליאת נטוביץ',
    },
    notes: 'דירת 3.5 חדרים. משכנתא 300,000',
  },

  // Property 23 - פטרסון 3, יד אליהו
  {
    fileNumber: '23',
    owners: [{ name: 'מיכל נטוביץ', percentage: 100 }],
    address: 'פטרסון 3, יד אליהו, תל אביב',
    city: 'תל אביב',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 1500000,
    mortgage: {
      bank: 'בנק דיסקונט',
      amount: 174000,
      payerName: 'מיכל נטוביץ',
    },
    notes: 'דירת 2 חדרים. משכנתא מדיסקונט 174,000',
  },

  // Property 24 - הפלמח 9, פ"ת
  {
    fileNumber: '24',
    owners: [{ name: 'אביעד נטוביץ', percentage: 50 }],
    address: 'הפלמח 9, פתח תקווה',
    city: 'פתח תקווה',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 3000000,
    mortgage: {
      bank: 'לא צוין',
      amount: 750000,
      payerName: 'אביעד נטוביץ',
    },
    notes: '50% משתי דירות (דופלקס ו3 חדרים). שותפות עם משה בורשטיין. 800 אבא, 280 אביעד. משכנתא 750,000',
  },

  // Property 25 - אלנבי 85 - מחסן
  {
    fileNumber: '25',
    owners: [{ name: 'אביעד נטוביץ', percentage: 100 }],
    address: 'אלנבי 85, תל אביב - מחסן',
    city: 'תל אביב',
    gush: '6937',
    helka: '14',
    type: PropertyType.COMMERCIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 300000,
    totalArea: 7,
    notes: 'מחסן 7 מטר. גוש 6937 חלקה 14 תת חלקה 3',
  },

  // Property 26 - אלנבי 85 - דירה 2/3
  {
    fileNumber: '26',
    owners: [{ name: 'אביעד נטוביץ', percentage: 27.4 }],
    address: 'אלנבי 85, תל אביב',
    city: 'תל אביב',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 2600000,
    totalArea: 85,
    notes: '2/3 מדירה (1/3 למיקי שלומוביץ) - 85 מטר. אחרי קנייה יהיה תמא 38. עלות הדירה 3,130,000. חלקו של אביעד 650,000 ₪ (27.40%)',
  },

  // Property 27 - מורדות הכרמל - קרקע
  {
    fileNumber: '27',
    owners: [{ name: 'ליאת נטוביץ', percentage: 100 }],
    address: 'מורדות הכרמל - קרקע',
    city: 'חיפה',
    gush: '10879',
    helka: '63',
    type: PropertyType.LAND,
    status: PropertyStatus.OWNED,
    estimatedValue: 800000,
    notes: 'חלק מהקרקע. יש לבדוק שווי',
  },

  // Property 28 - מניות חברת נטו דיור
  {
    fileNumber: '28',
    owners: [{ name: 'יצחק נטוביץ', percentage: 7.32 }],
    address: 'מניות בחברת נטו דיור בע"מ',
    city: 'ישראל',
    type: PropertyType.MIXED_USE,
    status: PropertyStatus.INVESTMENT,
    estimatedValue: 147200,
    notes: 'מניות בחברים נטו דיור בע"מ. 7.32%. מספר תיק 6459. דירה בלוד 1.6 מליון + פבריגט',
  },

  // Property 29 - שאול חרנם 6
  {
    fileNumber: '29',
    owners: [{ name: 'אביעד נטוביץ', percentage: 100 }],
    address: 'שאול חרנ"ם 6, פתח תקווה',
    city: 'פתח תקווה',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 7000000,
    mortgage: {
      bank: 'מרכנתיל דיסקונט',
      amount: 2000000,
      payerName: 'אביעד נטוביץ',
    },
    notes: 'שאול חרנם 6. משכנתא 2 מליון - מרכנתיל דיסקונט',
  },

  // Property 30 - הרצל 57
  {
    fileNumber: '30',
    owners: [{ name: 'אילנה נטוביץ', percentage: 50 }],
    address: 'הרצל 57',
    city: 'לא צוין',
    type: PropertyType.RESIDENTIAL,
    status: PropertyStatus.OWNED,
    estimatedValue: 1000000,
    notes: 'הרצל 57 - 50 אחוז מדירת 3 חדרים',
  },

  // Property 31 - גבעת שמואל מגרשים 51 ו56 (יצחק)
  {
    fileNumber: '31',
    owners: [{ name: 'י. נטוביץ ושות', percentage: 1.128 }],
    address: 'גבעת שמואל - מגרשים 51 ו56',
    city: 'גבעת שמואל',
    type: PropertyType.LAND,
    status: PropertyStatus.OWNED,
    estimatedValue: 1408000,
    mortgage: {
      bank: 'לא צוין',
      amount: 869660,
      payerName: 'יצחק נטוביץ',
    },
    notes: '1.128% מהנכס. גבעת שמואל מגרשים 51 ו56',
  },

  // Property 32 - גבעת שמואל מגרשים 51 ו56 (ליאת)
  {
    fileNumber: '32',
    owners: [{ name: 'ליאת נטוביץ', percentage: 3.478 }],
    address: 'גבעת שמואל - מגרשים 51 ו56 (ליאת)',
    city: 'גבעת שמואל',
    type: PropertyType.LAND,
    status: PropertyStatus.OWNED,
    estimatedValue: 3825800,
    mortgage: {
      bank: 'לא צוין',
      amount: 1355787,
      payerName: 'ליאת נטוביץ',
    },
    notes: '3.478% מהנכס. גבעת שמואל מגרשים 51 ו56',
  },
];

// ============================================================
// HELPERS
// ============================================================

function log(msg: string) {
  console.log(msg);
}

// ============================================================
// MAIN IMPORT
// ============================================================

async function main() {
  log('🏢 Netobitz Family Property Import v2');
  log('='.repeat(60));

  try {
    // Step 1: Create Persons (owners)
    log('\n👥 Step 1: Creating persons (owners)...');
    const personMap = new Map<string, string>(); // name -> id

    for (const ownerData of owners) {
      let person = await prisma.person.findFirst({
        where: { name: ownerData.name },
      });

      if (person) {
        log(`   ↪️  Person already exists: ${person.name}`);
      } else {
        person = await prisma.person.create({
          data: {
            name: ownerData.name,
            email: ownerData.email,
            phone: ownerData.phone,
            type: ownerData.type,
          },
        });
        log(`   ✅ Created person: ${person.name} (${person.id.substring(0, 8)}...)`);
      }

      personMap.set(ownerData.name, person.id);
    }

    log(`\n   📊 Total persons: ${personMap.size}`);

    // Step 2: Create Properties
    log('\n🏘️  Step 2: Creating properties...');
    const propertyMap = new Map<string, string>(); // fileNumber -> id
    let created = 0;
    let skipped = 0;

    for (const propData of properties) {
      let property = await prisma.property.findFirst({
        where: { fileNumber: propData.fileNumber },
      });

      if (property) {
        log(`   ↪️  Property #${propData.fileNumber} already exists: ${propData.address}`);
        skipped++;
      } else {
        property = await prisma.property.create({
          data: {
            address: propData.address,
            fileNumber: propData.fileNumber,
            type: propData.type,
            status: propData.status,
            city: propData.city,
            country: propData.country || 'Israel',
            gush: propData.gush,
            helka: propData.helka,
            estimatedValue: propData.estimatedValue,
            totalArea: propData.totalArea,
            landArea: propData.landArea,
            balconySizeSqm: propData.balconySizeSqm,
            isMortgaged: !!propData.mortgage,
            notes: propData.notes,
          },
        });
        log(`   ✅ Created #${propData.fileNumber}: ${propData.address}`);
        created++;
      }

      propertyMap.set(propData.fileNumber, property.id);
    }

    log(`\n   📊 Properties created: ${created}, skipped: ${skipped}`);

    // Step 3: Create Ownerships
    log('\n🤝 Step 3: Creating ownerships...');
    let ownershipsCreated = 0;
    let ownershipsSkipped = 0;

    for (const propData of properties) {
      const propertyId = propertyMap.get(propData.fileNumber);
      if (!propertyId) continue;

      for (const ownerData of propData.owners) {
        const personId = personMap.get(ownerData.name);
        if (!personId) {
          log(`   ⚠️  Person not found: ${ownerData.name}`);
          continue;
        }

        const existing = await prisma.ownership.findFirst({
          where: { propertyId, personId },
        });

        if (existing) {
          ownershipsSkipped++;
          continue;
        }

        await prisma.ownership.create({
          data: {
            propertyId,
            personId,
            ownershipPercentage: ownerData.percentage,
            ownershipType: OwnershipType.REAL,
            startDate: new Date('2021-12-14'),
          },
        });
        ownershipsCreated++;
      }
    }

    log(`   📊 Ownerships created: ${ownershipsCreated}, skipped: ${ownershipsSkipped}`);

    // Step 4: Create Mortgages
    log('\n🏦 Step 4: Creating mortgages...');
    let mortgagesCreated = 0;
    let mortgagesSkipped = 0;

    for (const propData of properties) {
      if (!propData.mortgage) continue;

      const propertyId = propertyMap.get(propData.fileNumber);
      if (!propertyId) continue;

      const payerId = personMap.get(propData.mortgage.payerName);
      if (!payerId) {
        log(`   ⚠️  Payer not found: ${propData.mortgage.payerName} for property #${propData.fileNumber}`);
        continue;
      }

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
          bank: propData.mortgage.bank,
          loanAmount: propData.mortgage.amount,
          monthlyPayment: propData.mortgage.monthlyPayment,
          startDate: new Date('2021-12-14'),
          status: MortgageStatus.ACTIVE,
          linkedProperties: [],
          payerId,
        },
      });

      log(`   ✅ Created mortgage for #${propData.fileNumber}: ${propData.mortgage.bank} - ${propData.mortgage.amount.toLocaleString()} ₪`);
      mortgagesCreated++;
    }

    log(`   📊 Mortgages created: ${mortgagesCreated}, skipped: ${mortgagesSkipped}`);

    // Step 5: Summary
    log('\n' + '='.repeat(60));
    log('📊 VERIFICATION SUMMARY');
    log('='.repeat(60));

    const personCount = await prisma.person.count();
    const propertyCount = await prisma.property.count();
    const ownershipCount = await prisma.ownership.count();
    const mortgageCount = await prisma.mortgage.count();

    log(`Persons:            ${personCount}`);
    log(`Properties:         ${propertyCount}`);
    log(`Ownerships:         ${ownershipCount}`);
    log(`Mortgages:          ${mortgageCount}`);

    const allProperties = await prisma.property.findMany({
      include: { mortgages: true },
    });

    const totalValue = allProperties.reduce((s, p) => s + (p.estimatedValue ? Number(p.estimatedValue) : 0), 0);
    const totalMortgages = allProperties.reduce((s, p) =>
      s + p.mortgages.reduce((ms, m) => ms + Number(m.loanAmount), 0), 0);

    log('\n💰 Financial Summary (all properties):');
    log(`   Total Value:      ${totalValue.toLocaleString()} ₪`);
    log(`   Total Mortgages:  ${totalMortgages.toLocaleString()} ₪`);
    log(`   Net Value:        ${(totalValue - totalMortgages).toLocaleString()} ₪`);

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
