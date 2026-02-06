/**
 * Property Report Generator
 * 
 * Features:
 * - Export to Excel (.xlsx)
 * - Export to CSV
 * - Export to PDF
 * - Generate financial reports
 * - Generate ownership reports
 * - Generate mortgage reports
 * - Customizable columns
 */

import * as XLSX from 'xlsx';

// Types
interface Property {
  id: string;
  address: string;
  city?: string;
  country: string;
  type?: string;
  status?: string;
  totalArea?: number;
  estimatedValue?: number;
  ownerships?: any[];
  mortgages?: any[];
  _count?: {
    units: number;
    mortgages: number;
  };
}

interface ReportOptions {
  includeColumns?: string[];
  filename?: string;
  sheetName?: string;
}

/**
 * Format property type label in Hebrew
 */
const formatPropertyType = (type?: string): string => {
  const labels: Record<string, string> = {
    RESIDENTIAL: 'מגורים',
    COMMERCIAL: 'מסחרי',
    LAND: 'קרקע',
    MIXED_USE: 'שימוש מעורב',
  };
  return type ? labels[type] || type : '';
};

/**
 * Format property status label in Hebrew
 */
const formatPropertyStatus = (status?: string): string => {
  const labels: Record<string, string> = {
    OWNED: 'בבעלות',
    IN_CONSTRUCTION: 'בבנייה',
    IN_PURCHASE: 'בהליכי רכישה',
    SOLD: 'נמכר',
    INVESTMENT: 'השקעה',
  };
  return status ? labels[status] || status : '';
};

/**
 * Format currency value
 */
const formatCurrency = (value?: number): string => {
  if (!value) return '';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Convert properties to Excel-friendly format
 */
const convertPropertiesToExcelData = (
  properties: Property[],
  options?: ReportOptions
) => {
  const defaultColumns = [
    'address',
    'city',
    'country',
    'type',
    'status',
    'totalArea',
    'estimatedValue',
    'units',
    'mortgages',
    'owners',
  ];

  const columns = options?.includeColumns || defaultColumns;

  return properties.map((property) => {
    const row: Record<string, any> = {};

    if (columns.includes('address')) row['כתובת'] = property.address;
    if (columns.includes('city')) row['עיר'] = property.city || '';
    if (columns.includes('country')) row['מדינה'] = property.country;
    if (columns.includes('type'))
      row['סוג'] = formatPropertyType(property.type);
    if (columns.includes('status'))
      row['סטטוס'] = formatPropertyStatus(property.status);
    if (columns.includes('totalArea'))
      row['שטח (מ״ר)'] = property.totalArea || '';
    if (columns.includes('estimatedValue'))
      row['שווי מוערך'] = property.estimatedValue || '';
    if (columns.includes('units'))
      row['מספר יחידות'] = property._count?.units || 0;
    if (columns.includes('mortgages'))
      row['משכנתאות'] = property._count?.mortgages || 0;
    if (columns.includes('owners'))
      row['מספר בעלים'] = property.ownerships?.length || 0;

    return row;
  });
};

/**
 * Export properties to Excel
 */
export const exportPropertiesToExcel = (
  properties: Property[],
  options?: ReportOptions
): void => {
  try {
    const data = convertPropertiesToExcelData(properties, options);
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Address
      { wch: 15 }, // City
      { wch: 10 }, // Country
      { wch: 15 }, // Type
      { wch: 15 }, // Status
      { wch: 10 }, // Area
      { wch: 15 }, // Value
      { wch: 10 }, // Units
      { wch: 10 }, // Mortgages
      { wch: 10 }, // Owners
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      options?.sheetName || 'נכסים'
    );

    const filename = options?.filename || `properties_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export properties to Excel');
  }
};

/**
 * Export properties to CSV
 */
export const exportPropertiesToCSV = (
  properties: Property[],
  options?: ReportOptions
): void => {
  try {
    const data = convertPropertiesToExcelData(properties, options);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const filename = options?.filename || `properties_${Date.now()}.csv`;
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export properties to CSV');
  }
};

/**
 * Generate financial summary report
 */
export const generateFinancialSummary = (
  properties: Property[]
): Record<string, any> => {
  const summary = {
    totalProperties: properties.length,
    totalValue: 0,
    totalArea: 0,
    totalMortgages: 0,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    byCountry: {} as Record<string, number>,
  };

  properties.forEach((property) => {
    // Total value
    if (property.estimatedValue) {
      summary.totalValue += property.estimatedValue;
    }

    // Total area
    if (property.totalArea) {
      summary.totalArea += property.totalArea;
    }

    // Total mortgages count
    if (property._count?.mortgages) {
      summary.totalMortgages += property._count.mortgages;
    }

    // By type
    if (property.type) {
      summary.byType[property.type] = (summary.byType[property.type] || 0) + 1;
    }

    // By status
    if (property.status) {
      summary.byStatus[property.status] =
        (summary.byStatus[property.status] || 0) + 1;
    }

    // By country
    summary.byCountry[property.country] =
      (summary.byCountry[property.country] || 0) + 1;
  });

  return summary;
};

/**
 * Generate detailed property report with multiple sheets
 */
export const generateDetailedReport = (
  properties: Property[],
  options?: {
    includeFinancialSummary?: boolean;
    includeOwnershipDetails?: boolean;
    includeMortgageDetails?: boolean;
  }
): void => {
  try {
    const workbook = XLSX.utils.book_new();

    // Main properties sheet
    const propertiesData = convertPropertiesToExcelData(properties);
    const propertiesSheet = XLSX.utils.json_to_sheet(propertiesData);
    XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'נכסים');

    // Financial summary sheet
    if (options?.includeFinancialSummary) {
      const summary = generateFinancialSummary(properties);
      const summaryData = [
        { 'פרמטר': 'סה״כ נכסים', 'ערך': summary.totalProperties },
        {
          'פרמטר': 'סה״כ שווי',
          'ערך': formatCurrency(summary.totalValue),
        },
        { 'פרמטר': 'סה״כ שטח (מ״ר)', 'ערך': summary.totalArea },
        { 'פרמטר': 'סה״כ משכנתאות', 'ערך': summary.totalMortgages },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'סיכום כספי');
    }

    // Ownership details sheet
    if (options?.includeOwnershipDetails) {
      const ownershipData: any[] = [];
      properties.forEach((property) => {
        if (property.ownerships && property.ownerships.length > 0) {
          property.ownerships.forEach((ownership: any) => {
            ownershipData.push({
              'נכס': property.address,
              'בעלים': ownership.owner?.name || '',
              'אחוז בעלות': `${ownership.ownershipPercentage}%`,
              'סוג בעלות': ownership.ownershipType,
            });
          });
        }
      });
      if (ownershipData.length > 0) {
        const ownershipSheet = XLSX.utils.json_to_sheet(ownershipData);
        XLSX.utils.book_append_sheet(workbook, ownershipSheet, 'בעלויות');
      }
    }

    // Mortgage details sheet
    if (options?.includeMortgageDetails) {
      const mortgageData: any[] = [];
      properties.forEach((property) => {
        if (property.mortgages && property.mortgages.length > 0) {
          property.mortgages.forEach((mortgage: any) => {
            mortgageData.push({
              'נכס': property.address,
              'בנק': mortgage.bank,
              'סכום הלוואה': mortgage.loanAmount,
              'ריבית': mortgage.interestRate ? `${mortgage.interestRate}%` : '',
              'תשלום חודשי': mortgage.monthlyPayment || '',
              'סטטוס': mortgage.status,
            });
          });
        }
      });
      if (mortgageData.length > 0) {
        const mortgageSheet = XLSX.utils.json_to_sheet(mortgageData);
        XLSX.utils.book_append_sheet(workbook, mortgageSheet, 'משכנתאות');
      }
    }

    const filename = `detailed_report_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error generating detailed report:', error);
    throw new Error('Failed to generate detailed report');
  }
};

/**
 * Print properties list
 */
export const printPropertiesList = (properties: Property[]): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('נא לאפשר חלונות קופצים כדי להדפיס');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <title>רשימת נכסים</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          direction: rtl;
          padding: 20px;
        }
        h1 {
          text-align: center;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>רשימת נכסים</h1>
      <table>
        <thead>
          <tr>
            <th>כתובת</th>
            <th>עיר</th>
            <th>מדינה</th>
            <th>סוג</th>
            <th>סטטוס</th>
            <th>שטח (מ״ר)</th>
            <th>שווי</th>
          </tr>
        </thead>
        <tbody>
          ${properties
            .map(
              (property) => `
            <tr>
              <td>${property.address}</td>
              <td>${property.city || ''}</td>
              <td>${property.country}</td>
              <td>${formatPropertyType(property.type)}</td>
              <td>${formatPropertyStatus(property.status)}</td>
              <td>${property.totalArea || ''}</td>
              <td>${formatCurrency(property.estimatedValue)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div class="footer">
        תאריך הדפסה: ${new Date().toLocaleDateString('he-IL')}
      </div>
      <script>
        window.print();
        window.onafterprint = function() {
          window.close();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export default {
  exportPropertiesToExcel,
  exportPropertiesToCSV,
  generateFinancialSummary,
  generateDetailedReport,
  printPropertiesList,
};
