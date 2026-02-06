#!/usr/bin/env python3
"""
Simple HTML to CSV converter without external dependencies.
Parses property and lease data from HTML tables.
"""

import csv
import os
import re
import html

def extract_text_from_td(td_content):
    """Extract text content from <td> tag."""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', td_content)
    # Decode HTML entities
    text = html.unescape(text)
    # Clean whitespace
    text = ' '.join(text.split())
    return text.strip()

def extract_city(address):
    """Extract city from address."""
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
        'ז"ט': 'זכרון יעקב תל אביב',
        'לייפציג': 'לייפציג',
    }
    
    for key, city in cities.items():
        if key in address:
            return city
    
    return ''

def extract_gush_helka(text):
    """Extract gush and helka."""
    gush_match = re.search(r'גוש\s+(\d+)', text)
    helka_match = re.search(r'חלקה?\s+([\d/\\.]+)', text)
    
    gush = gush_match.group(1) if gush_match else ''
    helka = helka_match.group(1) if helka_match else ''
    
    return gush, helka

def parse_properties_html(file_path):
    """Parse properties from HTML."""
    print(f"\n📄 Parsing properties: {os.path.basename(file_path)}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract all table rows
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.DOTALL)
    print(f"   Found {len(rows)} rows")
    
    properties = []
    current_owner = ''
    
    for row in rows:
        # Extract all cells
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        
        if len(cells) < 3:
            continue
        
        # Extract text from cells
        cell_texts = [extract_text_from_td(cell) for cell in cells]
        
        # Check for owner (first cell with name)
        if cell_texts[0]:
            owner = cell_texts[0]
            if any(name in owner for name in ['נטוביץ', 'ליאת', 'מיכל', 'אביעד', 'אילנה', 'יצחק']):
                current_owner = owner
        
        # Check for property (numbered or has address keywords)
        if len(cell_texts) > 1:
            desc = cell_texts[1]
            
            if re.match(r'^\d+\.', desc) or any(kw in desc for kw in ['רחוב', 'דירה', 'קרקע', 'מגרש', 'משרד', 'בניין']):
                # Extract property number
                num_match = re.match(r'^(\d+)\.', desc)
                prop_num = num_match.group(1) if num_match else str(len(properties) + 1)
                
                # Clean address
                address = re.sub(r'^\d+\.\s*', '', desc)
                
                # Get value
                value = ''
                if len(cell_texts) > 2:
                    value_text = cell_texts[2].replace(',', '').replace('₪', '').strip()
                    try:
                        value = float(value_text) if value_text and value_text != '#ERROR!' else ''
                    except ValueError:
                        value = ''
                
                # Extract location info
                gush, helka = extract_gush_helka(desc)
                city = extract_city(address)
                
                # Check mortgage
                has_mortgage = 'משועבד' in desc or 'הלוואה' in desc
                mortgage_amount = ''
                mortgage_bank = ''
                
                if has_mortgage:
                    # Extract amount
                    amount_match = re.search(r'([\d,]+)\s*₪', desc)
                    if amount_match:
                        mortgage_amount = amount_match.group(1).replace(',', '')
                    elif len(cell_texts) > 4:
                        # Try from other columns
                        for cell in cell_texts[3:6]:
                            amt = cell.replace(',', '').replace('₪', '').strip()
                            if amt and amt.isdigit():
                                mortgage_amount = amt
                                break
                    
                    # Extract bank
                    if 'לאומי' in desc:
                        mortgage_bank = 'בנק לאומי'
                    elif 'מרכנתיל' in desc or 'דיסקונט' in desc:
                        mortgage_bank = 'בנק מרכנתיל דיסקונט'
                    elif 'בלמ' in desc or 'מזרחי' in desc:
                        mortgage_bank = 'בנק מזרחי טפחות'
                
                property_data = {
                    'fileNumber': prop_num,
                    'address': address[:200],
                    'owner': current_owner or 'יצחק נטוביץ',
                    'city': city,
                    'propertyType': 'RESIDENTIAL',
                    'status': 'OWNED',
                    'purchasePrice': value,
                    'currentValue': value,
                    'plotGush': gush,
                    'plotHelka': helka,
                    'hasMortgage': 'yes' if has_mortgage else 'no',
                    'mortgageBank': mortgage_bank,
                    'mortgageAmount': mortgage_amount,
                }
                
                properties.append(property_data)
    
    print(f"   ✅ Extracted {len(properties)} properties")
    return properties

def parse_leases_html(file_path):
    """Parse leases from HTML."""
    print(f"\n📄 Parsing leases: {os.path.basename(file_path)}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract all table rows
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.DOTALL)
    print(f"   Found {len(rows)} rows")
    
    leases = []
    header_found = False
    
    for row in rows:
        # Extract all cells
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        
        if len(cells) < 10:
            continue
        
        # Extract text from cells
        cell_texts = [extract_text_from_td(cell) for cell in cells]
        
        # Check if header row
        row_text = ' '.join(cell_texts)
        if 'מספר תיק' in row_text and 'כתובת' in row_text:
            header_found = True
            continue
        
        if not header_found:
            continue
        
        # Extract file number (column 2)
        file_number = cell_texts[2] if len(cell_texts) > 2 else ''
        
        # Skip if not a valid file number
        if not file_number or '/' not in file_number or '#ERROR!' in file_number:
            continue
        
        # Extract other fields
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
            rent_value = float(rent_clean) if rent_clean and rent_clean != '#ERROR!' else ''
        except ValueError:
            rent_value = ''
        
        # Parse dates
        def parse_date(date_str):
            if not date_str or '#ERROR!' in date_str:
                return ''
            try:
                # Format: 1.2.25 or 10.11.20
                if '.' in date_str:
                    parts = date_str.split('.')
                    if len(parts) == 3:
                        day, month, year = parts
                        # Convert 2-digit year
                        if len(year) == 2:
                            year_int = int(year)
                            # If 20-40, assume 2020s, else 1900s
                            year = f"20{year}" if year_int >= 20 else f"19{year}"
                        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                return date_str
            except:
                return date_str
        
        start_clean = parse_date(start_date)
        end_clean = parse_date(end_date)
        
        # Skip if missing essential data
        if not tenant_name or tenant_name == '#ERROR!':
            continue
        
        lease_data = {
            'fileNumber': file_number,
            'propertyAddress': address,
            'apartmentNumber': apt_number,
            'floor': floor,
            'roomCount': rooms,
            'tenantName': tenant_name,
            'tenantEmail': tenant_email,
            'tenantPhone': tenant_phone,
            'startDate': start_clean,
            'endDate': end_clean,
            'monthlyRent': rent_value,
            'notes': notes,
        }
        
        leases.append(lease_data)
    
    print(f"   ✅ Extracted {len(leases)} leases")
    return leases

def main():
    """Main function."""
    print("=" * 80)
    print("🏢 Property Portfolio Data Converter")
    print("=" * 80)
    
    base_dir = '/Users/aviad.natovich/personal/rentApplication'
    output_dir = f'{base_dir}/data/imports'
    
    os.makedirs(output_dir, exist_ok=True)
    
    # File paths
    properties_html = f'{base_dir}/רשימת נכסים - איציק נטוביץ 5.2023 2.xlsx/רשימת נכסים איציק  (2).html'
    leases_html = f'{base_dir}/טבלה מרכזת שכירויות- עם גיליונות נפרדים.xlsx (1)/נכסים איציק+ חברים נטו.html'
    
    # Parse properties
    properties = []
    if os.path.exists(properties_html):
        properties = parse_properties_html(properties_html)
    else:
        print(f"⚠️ File not found: {properties_html}")
    
    # Parse leases
    leases = []
    if os.path.exists(leases_html):
        leases = parse_leases_html(leases_html)
    else:
        print(f"⚠️ File not found: {leases_html}")
    
    # Create CSV files
    if properties:
        print(f"\n📝 Creating properties CSV...")
        output_file = f'{output_dir}/properties_from_excel.csv'
        
        fieldnames = ['fileNumber', 'address', 'owner', 'city', 'propertyType', 
                     'status', 'purchasePrice', 'currentValue', 'plotGush', 
                     'plotHelka', 'hasMortgage', 'mortgageBank', 'mortgageAmount']
        
        with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(properties)
        
        print(f"   ✅ Created: {output_file}")
        print(f"   📊 {len(properties)} properties")
        
        print(f"\n   Sample properties:")
        for i, prop in enumerate(properties[:5]):
            print(f"      {i+1}. {prop['fileNumber']:3s} - {prop['address'][:50]:50s} - {prop['owner']}")
    
    if leases:
        print(f"\n📝 Creating leases CSV...")
        output_file = f'{output_dir}/leases_from_excel.csv'
        
        fieldnames = ['fileNumber', 'propertyAddress', 'apartmentNumber', 'floor',
                     'roomCount', 'tenantName', 'tenantEmail', 'tenantPhone',
                     'startDate', 'endDate', 'monthlyRent', 'notes']
        
        with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(leases)
        
        print(f"   ✅ Created: {output_file}")
        print(f"   📊 {len(leases)} leases")
        
        print(f"\n   Sample leases:")
        for i, lease in enumerate(leases[:5]):
            rent = f"₪{lease['monthlyRent']}" if lease['monthlyRent'] else 'N/A'
            print(f"      {i+1}. {lease['fileNumber']:10s} - {lease['tenantName']:25s} - {rent}")
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 CONVERSION SUMMARY")
    print("=" * 80)
    print(f"✅ Properties extracted: {len(properties)}")
    print(f"✅ Leases extracted:     {len(leases)}")
    print(f"\n📂 Output files:")
    
    if properties:
        print(f"   📄 data/imports/properties_from_excel.csv")
    if leases:
        print(f"   📄 data/imports/leases_from_excel.csv")
    
    print("\n🎯 Next Steps:")
    print("   1. Review the CSV files in data/imports/")
    print("   2. Start the app: npm run dev (if not running)")
    print("   3. Import Properties:")
    print("      - Go to: http://localhost:3000/properties")
    print("      - Click: 'ייבוא נכסים' button")
    print("      - Upload: properties_from_excel.csv")
    print("   4. Import Leases:")
    print("      - Go to: http://localhost:3000/leases")
    print("      - Click: 'ייבוא שכירויות' button")
    print("      - Upload: leases_from_excel.csv")
    print("=" * 80)
    
    return len(properties), len(leases)

if __name__ == '__main__':
    try:
        prop_count, lease_count = main()
        if prop_count == 0 and lease_count == 0:
            print("\n⚠️ No data extracted. Please check the HTML files.")
            exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
