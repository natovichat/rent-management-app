#!/usr/bin/env python3
"""
Convert Excel property and lease data to importable CSV format.

This script reads Excel files containing property and lease data,
parses them, and creates structured CSV files that can be imported
into the rent application system.
"""

import pandas as pd
import sys
import os
from datetime import datetime
import re

def clean_numeric(value):
    """Clean numeric values from Excel."""
    if pd.isna(value) or value == '' or value == '#ERROR!':
        return None
    if isinstance(value, str):
        # Remove commas and other formatting
        value = value.replace(',', '').replace('₪', '').strip()
        try:
            return float(value)
        except ValueError:
            return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def clean_text(value):
    """Clean text values from Excel."""
    if pd.isna(value) or value == '' or value == '#ERROR!':
        return ''
    return str(value).strip()

def parse_date(value):
    """Parse date from Excel."""
    if pd.isna(value) or value == '' or value == '#ERROR!':
        return ''
    
    try:
        # Try to parse as datetime
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d')
        
        # Try to parse string date
        date_str = str(value).strip()
        
        # Try various formats
        for fmt in ['%d.%m.%y', '%d/%m/%Y', '%d.%m.%Y', '%Y-%m-%d']:
            try:
                dt = datetime.strptime(date_str, fmt)
                return dt.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        # If all else fails, return original
        return date_str
    except:
        return ''

def extract_gush_helka(text):
    """Extract gush and helka from property description."""
    if not text:
        return '', ''
    
    # Pattern: גוש XXXX חלקה YYY
    gush_match = re.search(r'גוש\s+(\d+)', text)
    helka_match = re.search(r'חלקה\s+([\d/]+)', text)
    
    gush = gush_match.group(1) if gush_match else ''
    helka = helka_match.group(1) if helka_match else ''
    
    return gush, helka

def parse_properties_sheet(file_path):
    """
    Parse properties data from Excel sheet.
    
    Expected columns:
    - בעלות (Owner)
    - כתובת/תיאור הנכס (Address/Description)
    - שווי (Value)
    - משכנתא (Mortgage info)
    """
    print(f"\n📄 Reading: {file_path}")
    
    try:
        # Read Excel file
        xls = pd.ExcelFile(file_path)
        print(f"   Sheets found: {xls.sheet_names}")
        
        # Try to find the main properties sheet
        sheet_name = xls.sheet_names[0]  # Use first sheet
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        
        print(f"\n   Using sheet: {sheet_name}")
        print(f"   Columns: {df.columns.tolist()}")
        print(f"   Rows: {len(df)}")
        
        properties = []
        current_owner = ''
        property_counter = 1
        
        # Parse each row
        for idx, row in df.iterrows():
            # Check if this is an owner row (usually in first column)
            first_col = clean_text(row.iloc[0]) if len(row) > 0 else ''
            second_col = clean_text(row.iloc[1]) if len(row) > 1 else ''
            third_col = clean_text(row.iloc[2]) if len(row) > 2 else ''
            
            # Update current owner if this looks like an owner row
            if first_col and not second_col.replace('.', '').strip().isdigit():
                if 'נטוביץ' in first_col or 'ליאת' in first_col or 'מיכל' in first_col or 'אביעד' in first_col:
                    current_owner = first_col
                    continue
            
            # Look for property description (usually has number and address)
            if second_col and (re.match(r'^\d+\.', second_col) or 'רחוב' in second_col or 'דירה' in second_col):
                address = second_col
                
                # Extract property number
                number_match = re.match(r'^(\d+)\.', address)
                property_num = number_match.group(1) if number_match else str(property_counter)
                
                # Clean address
                address = re.sub(r'^\d+\.\s*', '', address)
                
                # Get value
                value = clean_numeric(third_col)
                
                # Get mortgage info
                mortgage_amount = None
                mortgage_bank = ''
                has_mortgage = False
                
                # Check next row for mortgage info
                if idx + 1 < len(df):
                    next_row = df.iloc[idx + 1]
                    mortgage_text = clean_text(next_row.iloc[1]) if len(next_row) > 1 else ''
                    if 'משועבד' in mortgage_text or 'הלוואה' in mortgage_text:
                        has_mortgage = True
                        # Try to extract amount
                        amount_match = re.search(r'([\d,]+)', mortgage_text)
                        if amount_match:
                            mortgage_amount = clean_numeric(amount_match.group(1))
                        # Try to extract bank
                        if 'לאומי' in mortgage_text:
                            mortgage_bank = 'בנק לאומי'
                        elif 'מרכנתיל' in mortgage_text or 'דיסקונט' in mortgage_text:
                            mortgage_bank = 'בנק מרכנתיל דיסקונט'
                        elif 'בלמ' in mortgage_text or 'מזרחי' in mortgage_text:
                            mortgage_bank = 'בנק מזרחי טפחות'
                
                # Extract gush and helka
                gush, helka = extract_gush_helka(address)
                
                # Create property entry
                property_data = {
                    'fileNumber': f"{property_num}",
                    'address': address[:200],  # Limit to 200 chars
                    'owner': current_owner,
                    'city': extract_city(address),
                    'propertyType': 'RESIDENTIAL',  # Default
                    'status': 'OWNED',
                    'purchasePrice': value,
                    'currentValue': value,
                    'plotGush': gush,
                    'plotHelka': helka,
                    'hasMortgage': 'yes' if has_mortgage else 'no',
                    'mortgageBank': mortgage_bank,
                    'mortgageAmount': mortgage_amount or '',
                }
                
                properties.append(property_data)
                property_counter += 1
        
        print(f"\n   ✅ Parsed {len(properties)} properties")
        return properties
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return []

def extract_city(address):
    """Extract city name from address."""
    cities = {
        'רמת גן': 'רמת גן',
        'ר"ג': 'רמת גן',
        'פתח תקווה': 'פתח תקווה',
        'פ"ת': 'פתח תקווה',
        'תל אביב': 'תל אביב',
        'ת"א': 'תל אביב',
        'גבעתיים': 'גבעתיים',
        'ירושלים': 'ירושלים',
        'חדרה': 'חדרה',
        'רחובות': 'רחובות',
        'גני תקווה': 'גני תקווה',
        'רעננה': 'רעננה',
        'לוד': 'לוד',
        'בני ברק': 'בני ברק',
        'לייפציג': 'לייפציג',
    }
    
    for key, city in cities.items():
        if key in address:
            return city
    
    return 'Israel'

def parse_leases_sheet(file_path):
    """
    Parse lease data from Excel sheet.
    
    Expected columns:
    - מספר תיק (File Number)
    - כתובת הנכס (Property Address)
    - שם השוכר (Tenant Name)
    - תאריך התחלה (Start Date)
    - תאריך סיום (End Date)
    - שכ"ד (Monthly Rent)
    """
    print(f"\n📄 Reading leases from: {file_path}")
    
    try:
        # Read Excel file
        xls = pd.ExcelFile(file_path)
        
        # Try to find leases sheet
        sheet_name = None
        for name in xls.sheet_names:
            if 'שכירות' in name or 'כללי' in name:
                sheet_name = name
                break
        
        if not sheet_name:
            sheet_name = xls.sheet_names[0]
        
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        
        print(f"   Using sheet: {sheet_name}")
        print(f"   Columns: {df.columns.tolist()}")
        
        leases = []
        
        # Find header row (contains "מספר תיק", "כתובת", "שוכר", etc.)
        header_row = None
        for idx, row in df.iterrows():
            row_text = ' '.join([str(x) for x in row if pd.notna(x)])
            if 'מספר תיק' in row_text and 'כתובת' in row_text:
                header_row = idx
                break
        
        if header_row is None:
            print("   ⚠️ Could not find header row")
            return []
        
        print(f"   Header row: {header_row}")
        
        # Parse data rows
        for idx in range(header_row + 1, len(df)):
            row = df.iloc[idx]
            
            # Skip empty rows
            if pd.isna(row).all():
                continue
            
            # Try to extract data (adjust column indices based on actual data)
            try:
                file_number = clean_text(row.iloc[2]) if len(row) > 2 else ''
                address = clean_text(row.iloc[3]) if len(row) > 3 else ''
                apt_number = clean_text(row.iloc[4]) if len(row) > 4 else ''
                floor = clean_text(row.iloc[5]) if len(row) > 5 else ''
                tenant_name = clean_text(row.iloc[7]) if len(row) > 7 else ''
                tenant_email = clean_text(row.iloc[8]) if len(row) > 8 else ''
                tenant_phone = clean_text(row.iloc[9]) if len(row) > 9 else ''
                start_date = parse_date(row.iloc[10]) if len(row) > 10 else ''
                end_date = parse_date(row.iloc[11]) if len(row) > 11 else ''
                monthly_rent = clean_numeric(row.iloc[12]) if len(row) > 12 else None
                notes = clean_text(row.iloc[13]) if len(row) > 13 else ''
                
                # Skip if missing essential data
                if not file_number or not address or not tenant_name:
                    continue
                
                # Create lease entry
                lease_data = {
                    'fileNumber': file_number,
                    'propertyAddress': address,
                    'apartmentNumber': apt_number,
                    'floor': floor,
                    'tenantName': tenant_name,
                    'tenantEmail': tenant_email,
                    'tenantPhone': tenant_phone,
                    'startDate': start_date,
                    'endDate': end_date,
                    'monthlyRent': monthly_rent or '',
                    'notes': notes,
                }
                
                leases.append(lease_data)
                
            except Exception as e:
                print(f"   ⚠️ Error parsing row {idx}: {e}")
                continue
        
        print(f"\n   ✅ Parsed {len(leases)} leases")
        return leases
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    """Main conversion function."""
    print("=" * 80)
    print("🏢 Property Portfolio Data Converter")
    print("=" * 80)
    
    base_dir = '/Users/aviad.natovich/personal/rentApplication'
    output_dir = f'{base_dir}/data/imports'
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # File paths
    properties_file = f'{base_dir}/רשימת נכסים - איציק נטוביץ 5.2023 2.xlsx'
    leases_file_html = f'{base_dir}/טבלה מרכזת שכירויות- עם גיליונות נפרדים.xlsx (1)/נכסים איציק+ חברים נטו.html'
    
    # Parse properties
    properties = []
    if os.path.exists(properties_file):
        properties = parse_properties_sheet(properties_file)
    else:
        print(f"⚠️ Properties file not found: {properties_file}")
    
    # Parse leases (try HTML if Excel not available)
    leases = []
    
    # Try to find leases Excel file
    leases_excel = None
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if 'שכירויות' in file and file.endswith('.xlsx'):
                leases_excel = os.path.join(root, file)
                break
        if leases_excel:
            break
    
    if leases_excel and os.path.exists(leases_excel):
        print(f"\n📄 Found leases Excel file: {leases_excel}")
        leases = parse_leases_sheet(leases_excel)
    else:
        print(f"\n⚠️ Leases Excel file not found, skipping lease parsing")
    
    # Create CSV files
    if properties:
        print(f"\n📝 Creating properties CSV...")
        properties_df = pd.DataFrame(properties)
        output_file = f'{output_dir}/properties_from_excel.csv'
        properties_df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"   ✅ Created: {output_file}")
        print(f"   📊 {len(properties)} properties")
        print(f"\n   Sample data:")
        print(properties_df.head(3).to_string())
    
    if leases:
        print(f"\n📝 Creating leases CSV...")
        leases_df = pd.DataFrame(leases)
        output_file = f'{output_dir}/leases_from_excel.csv'
        leases_df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"   ✅ Created: {output_file}")
        print(f"   📊 {len(leases)} leases")
        print(f"\n   Sample data:")
        print(leases_df.head(3).to_string())
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 CONVERSION SUMMARY")
    print("=" * 80)
    print(f"✅ Properties: {len(properties)}")
    print(f"✅ Leases: {len(leases)}")
    print(f"\n📂 Output directory: {output_dir}")
    print("\n🎯 Next steps:")
    print("   1. Review the generated CSV files")
    print("   2. Go to http://localhost:3000/properties")
    print("   3. Click 'ייבוא נכסים' to import properties_from_excel.csv")
    print("   4. Go to http://localhost:3000/leases")
    print("   5. Click 'ייבוא שכירויות' to import leases_from_excel.csv")
    print("=" * 80)

if __name__ == '__main__':
    main()
