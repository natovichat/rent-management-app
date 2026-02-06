#!/usr/bin/env python3
"""
Parse HTML files from Excel export to CSV format for import.

This script parses the HTML files generated from Excel exports
and creates structured CSV files for properties and leases.
"""

from bs4 import BeautifulSoup
import csv
import os
import re
from datetime import datetime

def clean_text(text):
    """Clean text from HTML."""
    if not text:
        return ''
    # Remove extra whitespace
    text = ' '.join(text.split())
    # Remove special characters
    text = text.replace('\u200f', '').replace('\u200e', '')
    return text.strip()

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
    
    return ''

def extract_gush_helka(text):
    """Extract gush and helka from text."""
    gush_match = re.search(r'גוש\s+(\d+)', text)
    helka_match = re.search(r'חלקה?\s+([\d/\\.]+)', text)
    
    gush = gush_match.group(1) if gush_match else ''
    helka = helka_match.group(1) if helka_match else ''
    
    return gush, helka

def parse_properties_html(file_path):
    """Parse properties from HTML file."""
    print(f"\n📄 Reading properties HTML: {os.path.basename(file_path)}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Find all table rows
    rows = soup.find_all('tr')
    print(f"   Found {len(rows)} rows")
    
    properties = []
    current_owner = ''
    
    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 3:
            continue
        
        # Extract text from cells
        cell_texts = [clean_text(cell.get_text()) for cell in cells]
        
        # Check if this is an owner row (column 0 contains owner name)
        if cell_texts[0]:
            owner_text = cell_texts[0]
            if any(name in owner_text for name in ['נטוביץ', 'ליאת', 'מיכל', 'אביעד', 'אילנה']):
                current_owner = owner_text
        
        # Check if this is a property row (column 1 starts with number or contains address)
        if len(cell_texts) > 1:
            desc = cell_texts[1]
            
            # Look for numbered property (1. 2. 3. etc.) or address keywords
            if re.match(r'^\d+\.', desc) or any(kw in desc for kw in ['רחוב', 'דירה', 'קרקע', 'מגרש', 'משרד']):
                # Extract property number
                num_match = re.match(r'^(\d+)\.', desc)
                property_num = num_match.group(1) if num_match else ''
                
                # Clean description
                address = re.sub(r'^\d+\.\s*', '', desc)
                
                # Get value (usually in column 2)
                value_text = cell_texts[2] if len(cell_texts) > 2 else ''
                value = None
                if value_text:
                    try:
                        value = float(value_text.replace(',', '').replace('₪', '').strip())
                    except ValueError:
                        pass
                
                # Extract gush and helka from description
                gush, helka = extract_gush_helka(desc)
                
                # Extract city
                city = extract_city(address)
                
                # Check for mortgage info in text
                has_mortgage = 'משועבד' in desc or 'הלוואה' in desc
                mortgage_amount = ''
                mortgage_bank = ''
                
                if has_mortgage:
                    # Try to extract amount
                    amount_match = re.search(r'([\d,]+)\s*₪', desc)
                    if amount_match:
                        mortgage_amount = amount_match.group(1).replace(',', '')
                    
                    # Extract bank
                    if 'לאומי' in desc:
                        mortgage_bank = 'בנק לאומי'
                    elif 'מרכנתיל' in desc:
                        mortgage_bank = 'בנק מרכנתיל דיסקונט'
                    elif 'בלמ' in desc or 'מזרחי' in desc:
                        mortgage_bank = 'בנק מזרחי טפחות'
                
                property_data = {
                    'fileNumber': property_num or f'AUTO-{len(properties) + 1}',
                    'address': address[:200],
                    'owner': current_owner or 'יצחק נטוביץ',
                    'city': city,
                    'propertyType': 'RESIDENTIAL',
                    'status': 'OWNED',
                    'purchasePrice': value or '',
                    'currentValue': value or '',
                    'plotGush': gush,
                    'plotHelka': helka,
                    'hasMortgage': 'yes' if has_mortgage else 'no',
                    'mortgageBank': mortgage_bank,
                    'mortgageAmount': mortgage_amount,
                }
                
                properties.append(property_data)
    
    print(f"\n   ✅ Extracted {len(properties)} properties")
    return properties

def parse_leases_html(file_path):
    """Parse leases from HTML file."""
    print(f"\n📄 Reading leases HTML: {os.path.basename(file_path)}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    rows = soup.find_all('tr')
    print(f"   Found {len(rows)} rows")
    
    leases = []
    header_found = False
    
    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 10:
            continue
        
        cell_texts = [clean_text(cell.get_text()) for cell in cells]
        
        # Check if this is header row
        if 'מספר תיק' in ' '.join(cell_texts):
            header_found = True
            continue
        
        if not header_found:
            continue
        
        # Skip rows that don't have file number
        file_number = cell_texts[2] if len(cell_texts) > 2 else ''
        if not file_number or '/' not in file_number:
            continue
        
        # Extract lease data
        address = cell_texts[3] if len(cell_texts) > 3 else ''
        apt_number = cell_texts[4] if len(cell_texts) > 4 else ''
        floor = cell_texts[5] if len(cell_texts) > 5 else ''
        rooms = cell_texts[6] if len(cell_texts) > 6 else ''
        tenant_name = cell_texts[7] if len(cell_texts) > 7 else ''
        tenant_email = cell_texts[8] if len(cell_texts) > 8 else ''
        tenant_phone = cell_texts[9] if len(cell_texts) > 9 else ''
        start_date = cell_texts[10] if len(cell_texts) > 10 else ''
        end_date = cell_texts[11] if len(cell_texts) > 11 else ''
        monthly_rent = cell_texts[12] if len(cell_texts) > 12 else ''
        notes = cell_texts[13] if len(cell_texts) > 13 else ''
        
        # Clean monthly rent
        rent_clean = monthly_rent.replace(',', '').replace('₪', '').strip()
        try:
            rent_value = float(rent_clean) if rent_clean else ''
        except ValueError:
            rent_value = ''
        
        # Parse dates
        def parse_date(date_str):
            if not date_str or '#ERROR!' in date_str:
                return ''
            try:
                # Try format: 1.2.25
                if '.' in date_str:
                    parts = date_str.split('.')
                    if len(parts) == 3:
                        day, month, year = parts
                        # Convert 2-digit year to 4-digit
                        if len(year) == 2:
                            year = '20' + year
                        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                return date_str
            except:
                return date_str
        
        start_date_clean = parse_date(start_date)
        end_date_clean = parse_date(end_date)
        
        lease_data = {
            'fileNumber': file_number,
            'propertyAddress': address,
            'apartmentNumber': apt_number,
            'floor': floor,
            'roomCount': rooms,
            'tenantName': tenant_name,
            'tenantEmail': tenant_email,
            'tenantPhone': tenant_phone,
            'startDate': start_date_clean,
            'endDate': end_date_clean,
            'monthlyRent': rent_value,
            'notes': notes,
        }
        
        leases.append(lease_data)
    
    print(f"   ✅ Extracted {len(leases)} leases")
    return leases

def main():
    """Main conversion function."""
    print("=" * 80)
    print("🏢 Property Portfolio Data Converter (HTML Parser)")
    print("=" * 80)
    
    base_dir = '/Users/aviad.natovich/personal/rentApplication'
    output_dir = f'{base_dir}/data/imports'
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # File paths
    properties_html = f'{base_dir}/רשימת נכסים - איציק נטוביץ 5.2023 2.xlsx/רשימת נכסים איציק  (2).html'
    leases_html = f'{base_dir}/טבלה מרכזת שכירויות- עם גיליונות נפרדים.xlsx (1)/נכסים איציק+ חברים נטו.html'
    
    # Parse properties
    properties = []
    if os.path.exists(properties_html):
        properties = parse_properties_html(properties_html)
    else:
        print(f"⚠️ Properties HTML not found: {properties_html}")
    
    # Parse leases
    leases = []
    if os.path.exists(leases_html):
        leases = parse_leases_html(leases_html)
    else:
        print(f"⚠️ Leases HTML not found: {leases_html}")
    
    # Create CSV files
    if properties:
        print(f"\n📝 Creating properties CSV...")
        output_file = f'{output_dir}/properties_from_excel.csv'
        
        with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
            fieldnames = ['fileNumber', 'address', 'owner', 'city', 'propertyType', 
                         'status', 'purchasePrice', 'currentValue', 'plotGush', 
                         'plotHelka', 'hasMortgage', 'mortgageBank', 'mortgageAmount']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(properties)
        
        print(f"   ✅ Created: {output_file}")
        print(f"   📊 {len(properties)} properties")
        
        # Print sample
        print(f"\n   Sample properties:")
        for i, prop in enumerate(properties[:3]):
            print(f"   {i+1}. {prop['address'][:60]} - {prop['owner']}")
    
    if leases:
        print(f"\n📝 Creating leases CSV...")
        output_file = f'{output_dir}/leases_from_excel.csv'
        
        with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
            fieldnames = ['fileNumber', 'propertyAddress', 'apartmentNumber', 'floor',
                         'roomCount', 'tenantName', 'tenantEmail', 'tenantPhone',
                         'startDate', 'endDate', 'monthlyRent', 'notes']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(leases)
        
        print(f"   ✅ Created: {output_file}")
        print(f"   📊 {len(leases)} leases")
        
        # Print sample
        print(f"\n   Sample leases:")
        for i, lease in enumerate(leases[:3]):
            print(f"   {i+1}. {lease['propertyAddress'][:40]} - {lease['tenantName']}")
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 CONVERSION SUMMARY")
    print("=" * 80)
    print(f"✅ Properties: {len(properties)}")
    print(f"✅ Leases: {len(leases)}")
    print(f"\n📂 Output directory: {output_dir}/")
    
    if properties:
        print(f"   - properties_from_excel.csv")
    if leases:
        print(f"   - leases_from_excel.csv")
    
    print("\n🎯 Next Steps:")
    print("   1. Review the generated CSV files")
    print("   2. Start the application: npm run dev")
    print("   3. Navigate to Properties or Leases page")
    print("   4. Use the import button to upload the CSV files")
    print("=" * 80)

if __name__ == '__main__':
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("❌ BeautifulSoup4 is required. Installing...")
        os.system('pip3 install beautifulsoup4')
        from bs4 import BeautifulSoup
    
    main()
