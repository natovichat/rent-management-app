/**
 * Structured data extracted from Netobitz family property list
 * Source: רשימת נכסים – יצחק נטוביץ 14.12.2021
 * 
 * This file contains all property, ownership, and mortgage data
 * extracted from the HTML export.
 */

export interface PropertyOwner {
  name: string;
  percentage?: number; // Ownership percentage, if specified
}

export interface MortgageInfo {
  amount: number;
  bank: string;
  monthlyPayment?: number;
}

export interface UnitInfo {
  apartmentNumber?: string;
  floor?: number;
  roomCount?: number;
  area?: number; // in square meters
}

export interface NetobitzProperty {
  fileNumber: string; // Sequential number from list
  owners: PropertyOwner[];
  address: string;
  description: string;
  city?: string;
  gush?: string;
  helka?: string;
  currentValue?: number;
  purchasePrice?: number;
  mortgage?: MortgageInfo;
  units?: UnitInfo[];
  notes?: string;
}

// Main loan: 6 million in Bank Leumi (mentioned at top)
export const mainLoan = {
  amount: 6000000,
  bank: 'בנק לאומי',
  monthlyPayment: 57000,
};

export const netobitzData = {
  account: {
    name: 'משפחת נטוביץ',
    email: 'netobitz-family@temp-import.local',
  },
  
  // All unique owners extracted from the list
  owners: [
    { name: 'יצחק נטוביץ', email: 'yitzhak@temp-import.local', phone: '050-000-0001' },
    { name: 'אילנה נטוביץ', email: 'ilana@temp-import.local', phone: '050-000-0002' },
    { name: 'ליאת נטוביץ', email: 'liat@temp-import.local', phone: '050-000-0003' },
    { name: 'מיכל נטוביץ', email: 'michal@temp-import.local', phone: '050-000-0004' },
    { name: 'אביעד נטוביץ', email: 'aviad@temp-import.local', phone: '050-000-0005' },
    { name: 'י נטוביץ ושות', email: 'netobitz-partners@temp-import.local', phone: '050-000-0006' },
  ],
  
  properties: [
    // Property 1
    {
      fileNumber: '1',
      owners: [{ name: 'יצחק נטוביץ', percentage: 50 }],
      address: 'לביא 6, רמת גן',
      description: '50% מזכויות בדירה ברח\' לביא 6 רמת גן (דירה 60 מטר שתוגדל ל100 מטר) - 50 אחרים זה אריאלה לאובר',
      city: 'רמת גן',
      gush: '6158',
      helka: '371-376',
      currentValue: 800000,
      mortgage: undefined, // Not mortgaged
      notes: 'בהליכי פינוי בינוי מתקדמים חברת קרסו. לא משועבדת. צפי 6 שנים',
    },
    
    // Property 2
    {
      fileNumber: '2',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'דרך המלך 11, גני תקווה',
      description: 'דירה חדשה שטח 90 מ"ר - רחוב דרך המלך 11 גני תקווה קומה 2',
      city: 'גני תקווה',
      gush: '6717',
      helka: '225',
      currentValue: 2700000,
      mortgage: {
        amount: 6000000, // Part of main loan
        bank: 'בנק לאומי',
        monthlyPayment: 57000,
      },
      units: [{ floor: 2, area: 90 }],
      notes: 'משועבדת ביחד עם נכס מספר 8 ו11 לטובת הלוואה הגדולה של 6 מליון - לבנק לאומי',
    },
    
    // Property 3
    {
      fileNumber: '3',
      owners: [{ name: 'יצחק נטוביץ', percentage: 16.67 }], // 1/6
      address: 'הרברט סמואל, חדרה',
      description: '1/6 ממגרש בחדרה גוש 1036 חלקות 181 ו- 60 ( חלקה 60 1/6 מדירה/מחסן בקומת קרקע) + (חלקה 181 1/6 מגרש)',
      city: 'חדרה',
      gush: '1036',
      helka: '181, 60',
      currentValue: 1200000,
      mortgage: undefined,
      notes: 'לא משועבד. שותפים יבולים - שוקי שרון + זיו שמור (0509733355)',
    },
    
    // Property 4 & 5 (combined building)
    {
      fileNumber: '4',
      owners: [
        { name: 'יצחק נטוביץ', percentage: 50 },
        { name: 'אילנה נטוביץ', percentage: 50 },
      ],
      address: 'שאול חרנ"ם 10, פתח תקווה',
      description: 'דירה מס\' 45, דירת פנטהאוס 140 מ"ר + מרפסת 50 מ"ר',
      city: 'פתח תקווה',
      gush: '6393',
      helka: '314/45',
      currentValue: 4000000,
      mortgage: {
        amount: 1400000,
        bank: 'בנק מרכנתיל',
      },
      units: [{ apartmentNumber: '45', area: 140 }],
      notes: 'דירת פנטהאוס',
    },
    
    // Property 5
    {
      fileNumber: '5',
      owners: [{ name: 'ליאת נטוביץ', percentage: 100 }],
      address: 'שאול חרנ"ם 10, פתח תקווה',
      description: 'דירה מס\' 47, דירת פנטהאוס חדרים 90 מ"ר + מרפסת 50 מ"ר',
      city: 'פתח תקווה',
      gush: '6393',
      helka: '314/47',
      currentValue: 3000000,
      mortgage: undefined,
      units: [{ apartmentNumber: '47', area: 90 }],
      notes: 'לא משועבד',
    },
    
    // Property 6
    {
      fileNumber: '6',
      owners: [{ name: 'ליאת נטוביץ', percentage: 36 }],
      address: 'שאול חרנ"ם 10, פתח תקווה',
      description: '36% מדירה מס\' 6 שווי דירה 3 מליון חלקי 972,000 - יחד עם צביקה נטוביץ',
      city: 'פתח תקווה',
      gush: '6393',
      helka: '314/6',
      currentValue: 1000000,
      mortgage: undefined,
      units: [{ apartmentNumber: '6' }],
      notes: 'לא משועבד. שותפות עם צביקה נטוביץ',
    },
    
    // Property 7
    {
      fileNumber: '7',
      owners: [{ name: 'אילנה נטוביץ', percentage: 100 }],
      address: 'הרוא"ה 295, רמת גן',
      description: 'דירה 4 חדרים ברחוב הרוא"ה 295, ר"ג - דירת קרקע',
      city: 'רמת גן',
      gush: '6144',
      helka: '409/2',
      currentValue: 2700000,
      mortgage: {
        amount: 400000,
        bank: 'בנק לאומי',
      },
      units: [{ floor: 0, roomCount: 4 }],
      notes: 'משועבד 400,000 ₪ - בנק לאומי',
    },
    
    // Property 8
    {
      fileNumber: '8',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'מנדלי 7, תל אביב',
      description: '2 דירות בנות 1 חדר במנדלי 7, ת"א',
      city: 'תל אביב',
      gush: '6905',
      helka: '39/17, 39/16',
      currentValue: 3000000,
      mortgage: {
        amount: 6000000, // Part of main loan
        bank: 'בנק לאומי',
      },
      units: [
        { apartmentNumber: '17', roomCount: 1 },
        { apartmentNumber: '16', roomCount: 1 },
      ],
      notes: 'משועבד ללאומי כחלק מ6 מליון',
    },
    
    // Property 10 (note: property 9 seems missing in original)
    {
      fileNumber: '10',
      owners: [{ name: 'י נטוביץ ושות', percentage: 50 }],
      address: 'מגדל ב.ס.ר 3 קומה 26',
      description: 'משרד במגדל ב.ס.ר 3 קומה 26, חצי משרד - 210 מ"ר מתוך 420 (+ מרפסת בשטח 40 מ"ר) - יוסי גבילי',
      city: 'לא צוין',
      gush: 'לא צוין',
      helka: undefined,
      currentValue: 3000000,
      mortgage: {
        amount: 700000,
        bank: 'בלמ"ש',
      },
      units: [{ apartmentNumber: '103, 105', area: 210 }],
      notes: 'משועבד – (הלוואה בבלמ"ש 700,000 ₪)',
    },
    
    // Property 11
    {
      fileNumber: '11',
      owners: [
        { name: 'יצחק נטוביץ', percentage: 50 },
        { name: 'אילנה נטוביץ', percentage: 50 },
      ],
      address: 'טבנקין 22, גבעתיים',
      description: 'דירת גג (2 קומות) שטח 280 מ"ר+150 מ"ר מרפסת, טבנקין 22, גבעתיים',
      city: 'גבעתיים',
      gush: '6156',
      helka: '559/21',
      currentValue: 8000000,
      mortgage: {
        amount: 6000000, // Part of main loan
        bank: 'בנק לאומי',
      },
      units: [{ area: 280 }],
      notes: 'משועבדת כחלק מהלוואת ה6 מליון. דירת גג 2 קומות',
    },
    
    // Property 12
    {
      fileNumber: '12',
      owners: [{ name: 'יצחק נטוביץ', percentage: 25 }],
      address: 'הפלמ"ח 50, ירושלים',
      description: '1/4 דירה ברחוב הפלמ"ח 50, ירושלים (המגרש 730 מ"ר ועליו בנויות 4 דירות והדירה הנ"ל אחת מהן) - 1/4 של ליאת בפועל + 1/2 אילן אשר',
      city: 'ירושלים',
      gush: '63732',
      helka: '330',
      currentValue: 700000,
      mortgage: {
        amount: 300000, // 150,000 x 2 mentioned
        bank: 'בלמ"ש',
      },
      notes: 'משועבדת בלמ"ש 150,000 ₪',
    },
    
    // Property 13
    {
      fileNumber: '13',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'בר-כוכבא 34, רמת גן',
      description: 'דירה חדשה בת 4 חדרים בבניין ברחוב בר-כוכבא 34 ר"ג',
      city: 'רמת גן',
      gush: '1650, 1652',
      helka: '34',
      currentValue: 2800000,
      mortgage: undefined,
      units: [{ roomCount: 4 }],
      notes: 'נמכר אך לא הסתיים ב3,250,000. לא משועבדת',
    },
    
    // Property 14
    {
      fileNumber: '14',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'ראשון לציון - קרקע חקלאית',
      description: 'קרקע חקלאית בראשון לציון 3 דונם (ליוסי וצביקה יש חלקים נוספים)',
      city: 'ראשון לציון',
      gush: '3943',
      helka: '10',
      currentValue: 2700000,
      mortgage: undefined,
      notes: 'לא משועבדת. קרקע חקלאית 3 דונם',
    },
    
    // Property 15
    {
      fileNumber: '15',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'רחובות - קרקע חקלאית',
      description: 'קרקע חקלאית ברחובות 10 דונם',
      city: 'רחובות',
      gush: '3689',
      helka: '24',
      currentValue: 5000000,
      mortgage: undefined,
      notes: 'לא משועבדת. קרקע חקלאית 10 דונם',
    },
    
    // Property 16
    {
      fileNumber: '16',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'חדרה - קרקע לבניה',
      description: 'קרקע בחדרה לבניה (שנתיים,שלוש עד להתחלת בניה) - יחד עם עוזיאל ויבולים) - בנייה יחד שותפים',
      city: 'חדרה',
      gush: '10026',
      helka: '46',
      currentValue: 2800000,
      mortgage: undefined,
      notes: 'קרקע ל-7 יח"ד. שותפות עם עוזיאל ויבולים',
    },
    
    // Property 17
    {
      fileNumber: '17',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'לייפציג, גרמניה',
      description: 'בניין בלייפציג, גרמניה. 4 דירות בבעלות חברת איילי שאני מחזיק במניותיה',
      city: 'לייפציג',
      gush: undefined,
      helka: undefined,
      currentValue: 1800000,
      mortgage: {
        amount: 350000,
        bank: 'בנק גרמני',
      },
      notes: 'הלוואה של כ-100,000 אירו (350,000 ₪). משועבד מבנק גרמני',
    },
    
    // Property 18
    {
      fileNumber: '18',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'דימפל, לייפציג, גרמניה',
      description: 'השקעה בבניין דירות ברחוב דימפל לייפציג - באמצעות אפ-הולדינג. 33% מהרווחים של הניהול - 1/8 נכס',
      city: 'לייפציג',
      currentValue: 600000,
      mortgage: undefined,
      notes: 'יניב שפיץ 054-3120178. 33% מהרווחים של הניהול',
    },
    
    // Property 19
    {
      fileNumber: '19',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'לימבורגר, לייפציג, גרמניה',
      description: 'השקעה בבניין דירות ברחוב לימבורגר לייפציג - באמצעות אפ-הולדינג (חלק מהשותפות)',
      city: 'לייפציג',
      currentValue: 600000,
      mortgage: undefined,
      notes: 'חלק מהנכס',
    },
    
    // Property 20
    {
      fileNumber: '20',
      owners: [{ name: 'יצחק נטוביץ', percentage: 100 }],
      address: 'גלפי, גרמניה',
      description: 'השקעה בבניין דירות גלפי - באמצעות אפ-הולדינג (חלק מהשותפות). שתי דירות (מיכל הולכת לגור שם)',
      city: 'גרמניה',
      currentValue: 1500000,
      mortgage: undefined,
      notes: 'מספר תיק 226/206. הסכם הלוואה (נטוביץ הלווה לאפ הולדינג) 1.5 שקל עוד 36 חודש החזר עם ריבית שנתית של 7 אחוז לשנה. תחילת החזר הלוואה ב-16.11.2025. 38% מהרווחים',
    },
    
    // Property 21
    {
      fileNumber: '21',
      owners: [{ name: 'אילנה נטוביץ', percentage: 20 }],
      address: 'מוצקין 22, רעננה',
      description: 'מוצקין 22 רעננה - 20% אחוז מהחלקה (אברהם הנדלר, איציק וייס, צביקה) - קומבינציה עם קבלן - התר בנייה תוך חודשיים 2 דירות',
      city: 'רעננה',
      gush: '6580',
      helka: '329',
      currentValue: 5000000,
      mortgage: {
        amount: 1500000,
        bank: 'לא צוין',
      },
      notes: 'צריך לקחת הלוואה 800,000 בשביל מיסים. לוקח את דירת הגן בשווי 5 מליון ש"ח ומגיע לו 900,000 ש"ח נוספים מחלקו בדירה נוספת',
    },
    
    // Property 22
    {
      fileNumber: '22',
      owners: [{ name: 'ליאת נטוביץ', percentage: 100 }],
      address: 'שלום עליכם 6, רמת גן',
      description: 'שלום עליכם 6 רמת גן - דירת 3.5 חדרים',
      city: 'רמת גן',
      gush: '6142',
      helka: '228/6',
      currentValue: 1800000,
      mortgage: {
        amount: 300000,
        bank: 'לא צוין',
      },
      units: [{ roomCount: 3.5 }],
      notes: 'משכנתא 300,000',
    },
    
    // Property 23
    {
      fileNumber: '23',
      owners: [{ name: 'מיכל נטוביץ', percentage: 100 }],
      address: 'פטרסון 3, יד אליהו, תל אביב',
      description: 'יד אליהו פטרסון 3 דירת 2 חדרים',
      city: 'תל אביב',
      currentValue: 1500000,
      mortgage: {
        amount: 174000,
        bank: 'דיסקונט',
      },
      units: [{ roomCount: 2 }],
      notes: 'משכנתא מדיסקונט 174,000',
    },
    
    // Property 24
    {
      fileNumber: '24',
      owners: [{ name: 'אביעד נטוביץ', percentage: 50 }],
      address: 'הפלמח 9, פתח תקווה',
      description: 'הפלמח 9 פתח תקווה - 50% משתי דירות (דופלקס ו 3 חדרים) - שותפות עם משה בורשטיין',
      city: 'פתח תקווה',
      currentValue: 3000000,
      mortgage: {
        amount: 750000,
        bank: 'לא צוין',
      },
      notes: 'שותפות עם משה בורשטיין. 800 אבא, 280 אביעד. משכנתא 750,000',
    },
    
    // Property 25
    {
      fileNumber: '25',
      owners: [{ name: 'אביעד נטוביץ', percentage: 100 }],
      address: 'אלנבי 85, תל אביב - מחסן',
      description: 'מחסן אלנבי 85  7 מטר',
      city: 'תל אביב',
      gush: '6937',
      helka: '14',
      currentValue: 300000,
      mortgage: undefined,
      units: [{ area: 7 }],
      notes: 'מחסן 7 מטר',
    },
    
    // Property 26
    {
      fileNumber: '26',
      owners: [{ name: 'אביעד נטוביץ', percentage: 27.4 }],
      address: 'אלנבי 85, תל אביב',
      description: 'אלנבי 85 - 2/3 מדירה (1/3 למיקי שלומוביץ) - 85 מטר (אחרי קנייה יהיה תמא 38)',
      city: 'תל אביב',
      currentValue: 2600000,
      mortgage: undefined,
      units: [{ area: 85 }],
      notes: 'עדיין לא לקח משכנתא של 650,000. חלקו של אביעד בנכס שנקנה ב-2,239,772 הוא 650,000 ש"ח (27.40%). עלות הדירה 3,130,000',
    },
    
    // Property 27
    {
      fileNumber: '27',
      owners: [{ name: 'ליאת נטוביץ', percentage: 100 }],
      address: 'מורדות הכרמל - קרקע',
      description: 'קרקע מורדות הכרמל',
      city: 'לא צוין',
      gush: '10879',
      helka: '63',
      currentValue: 800000,
      mortgage: undefined,
      notes: 'חלק מהקרקע. יש לבדוק שווי',
    },
    
    // Property 28
    {
      fileNumber: '28',
      owners: [{ name: 'יצחק נטוביץ', percentage: 7.32 }],
      address: 'מניות בחברים נטו דיור בע"מ',
      description: 'מניות בחברים נטו דיור בע"מ מספר תיק 6459  7.32% (דירה בלוד 1.6 מליון + פבריגט)',
      city: 'לא צוין',
      currentValue: 147200,
      mortgage: undefined,
      notes: 'מניות בחברה. מספר תיק 6459',
    },
    
    // Property 29
    {
      fileNumber: '29',
      owners: [{ name: 'אביעד נטוביץ', percentage: 100 }],
      address: 'שאול חרנם 6, פתח תקווה',
      description: 'שאול חרנם 6',
      city: 'פתח תקווה',
      currentValue: 7000000,
      mortgage: {
        amount: 2000000,
        bank: 'מרכנתיל דיסקונט',
      },
      notes: 'משכנתא 2 מליון - מרכנתיל דיסקונט',
    },
    
    // Property 30
    {
      fileNumber: '30',
      owners: [{ name: 'אילנה נטוביץ', percentage: 50 }],
      address: 'הרצל 57',
      description: 'הרצל 57 - 50 אחוז מדירת 3 חדרים',
      city: 'לא צוין',
      currentValue: 1000000,
      mortgage: undefined,
      units: [{ roomCount: 3 }],
      notes: '50% בעלות',
    },
    
    // Property 31
    {
      fileNumber: '31',
      owners: [{ name: 'י נטוביץ ושות', percentage: 1.128 }],
      address: 'גבעת שמואל - מגרשים 51 ו56',
      description: 'גבעת שמואל מגרשים 51 ו56',
      city: 'גבעת שמואל',
      currentValue: 1408000,
      mortgage: {
        amount: 869660,
        bank: 'לא צוין',
      },
      notes: '1.128% מהנכס',
    },
    
    // Property 32
    {
      fileNumber: '32',
      owners: [{ name: 'ליאת נטוביץ', percentage: 3.478 }],
      address: 'גבעת שמואל - מגרשים 51 ו56',
      description: 'גבעת שמואל מגרשים 51 ו56',
      city: 'גבעת שמואל',
      currentValue: 3825800,
      mortgage: {
        amount: 1355787,
        bank: 'לא צוין',
      },
      notes: '3.478% מהנכס',
    },
  ] as NetobitzProperty[],
};

// Helper function to get unique owners list
export function getUniqueOwners(): string[] {
  const ownersSet = new Set<string>();
  netobitzData.properties.forEach(prop => {
    prop.owners.forEach(owner => {
      ownersSet.add(owner.name);
    });
  });
  return Array.from(ownersSet);
}

// Statistics
export const statistics = {
  totalProperties: netobitzData.properties.length,
  totalValue: netobitzData.properties.reduce((sum, p) => sum + (p.currentValue || 0), 0),
  totalMortgages: netobitzData.properties
    .filter(p => p.mortgage)
    .reduce((sum, p) => sum + (p.mortgage?.amount || 0), 0),
  propertiesByOwner: netobitzData.properties.reduce((acc, prop) => {
    prop.owners.forEach(owner => {
      acc[owner.name] = (acc[owner.name] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>),
};
