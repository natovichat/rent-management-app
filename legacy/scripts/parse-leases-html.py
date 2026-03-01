#!/usr/bin/env python3
"""
Parse leases HTML file and extract structured data
"""
import re
import html
import json
from datetime import datetime

def clean_text(text):
    """Clean HTML entities and whitespace"""
    if not text:
        return ""
    text = html.unescape(text)
    text = text.replace('&quot;', '"')
    text = text.replace('&#39;', "'")
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_date(date_str):
    """Parse Israeli date format DD.MM.YY to ISO"""
    if not date_str or date_str.strip() == '':
        return None
    
    try:
        # Remove any HTML tags or extra whitespace
        date_str = re.sub(r'<[^>]+>', '', date_str).strip()
        
        # Try DD.MM.YY format
        match = re.match(r'(\d{1,2})\.(\d{1,2})\.(\d{2})', date_str)
        if match:
            day, month, year = match.groups()
            # Convert 2-digit year to 4-digit
            year = '20' + year if int(year) < 50 else '19' + year
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    except Exception as e:
        print(f"Error parsing date '{date_str}': {e}")
    
    return None

def extract_cell_text(cell_html):
    """Extract text content from table cell HTML"""
    # Remove all HTML tags
    text = re.sub(r'<[^>]+>', '', cell_html)
    return clean_text(text)

def parse_leases_html(html_file):
    """Parse leases HTML file"""
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Find all table rows
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html_content, re.DOTALL)
    
    leases = []
    
    # Start from row 3 (index 3 in array, which is row 4 in spreadsheet - first data row)
    for i, row in enumerate(rows[3:], start=4):  # Skip header rows
        # Extract all cells
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        
        if len(cells) < 18:  # Not enough data
            continue
        
        # Extract data from cells (based on column positions)
        arnona_num = extract_cell_text(cells[0])  # A: מס ארנונה
        electric_meter = extract_cell_text(cells[1])  # B: מונה חשמל
        notes = extract_cell_text(cells[2])  # C: הערות
        end_date = extract_cell_text(cells[3])  # D: תאריך סיום
        our_share_money = extract_cell_text(cells[4])  # E: חלק שלנו (כסף)
        insurance = extract_cell_text(cells[5])  # F: ביטוח
        start_date = extract_cell_text(cells[6])  # G: תאריך התחלה
        phone = extract_cell_text(cells[7])  # H: טלפון/נייד
        email = extract_cell_text(cells[8])  # I: מייל שוכרים
        tenant_name = extract_cell_text(cells[9])  # J: שוכרים
        room_count = extract_cell_text(cells[10])  # K: מס חדרים
        floor = extract_cell_text(cells[11])  # L: מס קומה
        apartment_num = extract_cell_text(cells[12])  # M: מס דירה
        monthly_rent_total = extract_cell_text(cells[13])  # N: שכ"ד
        our_share = extract_cell_text(cells[14])  # O: חלק שלנו
        address = extract_cell_text(cells[15])  # P: כתובת הנכס
        file_number = extract_cell_text(cells[16])  # Q: מס תיק
        sequential = extract_cell_text(cells[17])  # R: סידורי
        handled_by = extract_cell_text(cells[18]) if len(cells) > 18 else ''  # S: בטיפול
        
        # Skip rows without tenant name or address
        if not tenant_name or not address:
            continue
        
        # Parse monetary values
        try:
            monthly_rent = float(monthly_rent_total.replace(',', '')) if monthly_rent_total else 0
        except:
            monthly_rent = 0
        
        try:
            our_share_amount = float(our_share.replace(',', '')) if our_share else 0
        except:
            our_share_amount = 0
        
        lease = {
            'row': i,
            'sequential': sequential,
            'file_number': file_number,
            'address': address,
            'apartment_number': apartment_num,
            'floor': floor,
            'room_count': room_count,
            'tenant_name': tenant_name,
            'tenant_email': email,
            'tenant_phone': phone,
            'monthly_rent_total': monthly_rent,
            'our_share': our_share_amount,
            'start_date': parse_date(start_date),
            'end_date': parse_date(end_date),
            'notes': notes,
            'insurance': insurance,
            'arnona_number': arnona_num,
            'electric_meter': electric_meter,
            'handled_by': handled_by
        }
        
        leases.append(lease)
    
    return leases

if __name__ == '__main__':
    html_file = '/Users/aviad.natovich/personal/rentApplication/רשימת נכסים - איציק נטוביץ 5.2023 2.xlsx/שכירות.html'
    
    leases = parse_leases_html(html_file)
    
    print(f"Found {len(leases)} leases\n")
    
    # Print as JSON
    output_file = '/Users/aviad.natovich/personal/rentApplication/נכסים נטוביץ/leases-data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(leases, f, ensure_ascii=False, indent=2)
    
    print(f"Saved to: {output_file}")
    
    # Print summary
    print("\n" + "="*60)
    print("LEASES SUMMARY")
    print("="*60)
    for lease in leases:
        print(f"\n{lease['sequential']}. {lease['address']}")
        print(f"   File: {lease['file_number']}")
        print(f"   Unit: {lease['apartment_number']} (Floor: {lease['floor']})")
        print(f"   Tenant: {lease['tenant_name']}")
        print(f"   Rent: ₪{lease['monthly_rent_total']:,.0f} (Our share: ₪{lease['our_share']:,.0f})")
        print(f"   Dates: {lease['start_date']} → {lease['end_date']}")
