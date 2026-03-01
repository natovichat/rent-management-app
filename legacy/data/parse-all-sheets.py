#!/usr/bin/env python3
"""
Parse all 4 rental Excel sheets (exported as HTML) into a structured JSON file.
Output: legacy/data/all-rental-data.json

Groups:
  1. Netobitz  - נכסים איציק+ חברים נטו.html
  2. Sharon    - עיזבון שלמה שרון - 6422.html
  3. Harmon    - -618 חרמון.html
  4. Greenspan - - רחלי גרינשפן  6557 - .html
"""

import json
import re
import os
from html.parser import HTMLParser
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RENTAL_DIR = os.path.join(BASE_DIR, "טבלה מרכזת שכירויות- עם גיליונות נפרדים.xlsx (1)")
OUTPUT_FILE = os.path.join(BASE_DIR, "all-rental-data.json")


# ─────────────────────────────────────────────
# HTML TABLE PARSER
# ─────────────────────────────────────────────

class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_cell = False
        self.rows = []
        self.current_row = []
        self.current_cell = []

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.current_row = []
        elif tag in ("td", "th"):
            self.in_cell = True
            self.current_cell = []

    def handle_endtag(self, tag):
        if tag in ("td", "th"):
            self.current_row.append("".join(self.current_cell).strip())
            self.in_cell = False
        elif tag == "tr":
            if any(c.strip() for c in self.current_row):
                self.rows.append(self.current_row)

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell.append(data)


def parse_html_file(filename):
    path = os.path.join(RENTAL_DIR, filename)
    with open(path, encoding="utf-8") as f:
        content = f.read()
    parser = TableParser()
    parser.feed(content)
    return [r for r in parser.rows if any(c.strip() for c in r)]


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def clean_rent(s):
    """Parse rent string like '₪ 7,770.00' or '6,000' or '7500 ₪' → int or None."""
    if not s:
        return None
    s = str(s).strip()
    # Remove currency symbol
    s = s.replace("₪", '').replace('ש"ח', "").strip()
    # Remove thousands commas that may appear as leading comma too
    s = s.replace(",", "")
    # Remove trailing decimal zeros (.00 or similar cents notation)
    s = re.sub(r"\.\d+$", "", s)
    # Remove all remaining whitespace
    s = re.sub(r"\s+", "", s)
    # Extract first number
    m = re.search(r"(\d+)", s)
    if m:
        try:
            return int(m.group(1))
        except ValueError:
            pass
    return None


def is_numeric_rent(s):
    """Return True if s is primarily a numeric rent value (not a text note)."""
    if not s:
        return False
    stripped = re.sub(r"[₪\s,.]", "", str(s))
    stripped = stripped.replace('ש"ח', "")
    return bool(re.match(r"^\d+", stripped))


def clean_phone(s):
    """Normalize phone number, return first phone found."""
    if not s:
        return None
    # Take only digits and hyphens, skip non-phone text
    s = str(s).split("+")[0].split("טלפון")[-1].split("/")[0].strip()
    s = re.sub(r"[^\d\-]", "", s)
    return s if len(s) >= 9 else None


def parse_date(s):
    """Convert various date formats to ISO string YYYY-MM-DD, or None."""
    if not s:
        return None
    s = str(s).strip()

    patterns = [
        (r"(\d{1,2})\.(\d{1,2})\.(\d{4})", "DD.MM.YYYY"),
        (r"(\d{1,2})\.(\d{1,2})\.(\d{2})",  "DD.MM.YY"),
        (r"(\d{1,2})/(\d{1,2})/(\d{4})",    "MM/DD/YYYY"),
        (r"(\d{1,2})/(\d{1,2})/(\d{2})",    "MM/DD/YY"),
        (r"(\d{4})-(\d{2})-(\d{2})",          "YYYY-MM-DD"),
    ]

    for pat, fmt in patterns:
        m = re.search(pat, s)
        if m:
            a, b, c = m.group(1), m.group(2), m.group(3)
            if fmt == "YYYY-MM-DD":
                return f"{a}-{b}-{c}"
            if fmt in ("MM/DD/YYYY", "MM/DD/YY"):
                month, day, year = int(a), int(b), int(c)
                if year < 100:
                    year += 2000
                return f"{year}-{month:02d}-{day:02d}"
            else:
                day, month, year = int(a), int(b), int(c)
                if year < 100:
                    year += 2000
                return f"{year}-{month:02d}-{day:02d}"
    return None


def is_active_lease(end_date_str):
    """Returns True if end date is in the future or missing."""
    d = parse_date(str(end_date_str))
    if not d:
        return True
    try:
        end = datetime.strptime(d, "%Y-%m-%d")
        return end >= datetime.now()
    except ValueError:
        return True


def cell(row, idx, default=""):
    """Safe cell accessor."""
    try:
        return (row[idx] or "").strip()
    except IndexError:
        return default


def make_lease(tenant_name, email, phone, start_date_raw, end_date_raw, rent_raw,
               notes="", apartment_number="", floor="", rooms=""):
    rent = clean_rent(str(rent_raw)) if rent_raw else None
    start = parse_date(str(start_date_raw))
    end = parse_date(str(end_date_raw))
    active = is_active_lease(str(end_date_raw))
    # Clean up email
    if email and "@" not in email:
        email = None
    return {
        "tenant_name": tenant_name.strip() if tenant_name else None,
        "email": email.strip() if email else None,
        "phone": clean_phone(str(phone)) if phone else None,
        "start_date": start,
        "end_date": end,
        "monthly_rent": rent,
        "status": "ACTIVE" if active else "EXPIRED",
        "apartment_number": apartment_number.strip() if apartment_number else None,
        "floor": floor.strip() if floor else None,
        "rooms": rooms.strip() if rooms else None,
        "notes": notes.strip() if notes else None,
    }


# ─────────────────────────────────────────────
# ADDRESS NORMALIZATION (Netobitz)
# ─────────────────────────────────────────────

NETOBITZ_ADDRESS_MAP = {
    'הפלמח 50 , ירושלים':    'הפלמ"ח 50, ירושלים',
    'הפלמח 50, ירושלים':     'הפלמ"ח 50, ירושלים',
    'הרא"ה 295 רמת גן':      'הרוא"ה 295, רמת גן',
    'מנדלי 7 תל אביב':       'מנדלי 7, תל אביב',
    'לביא 6 גבעתיים':        'לביא 6, גבעתיים',
    'שלום עליכם 6 רמת גן':   'שלום עליכם 6, רמת גן',
    'פטרסון 3, תל אביב':     'פטרסון 3, תל אביב',
    'פטרסון 3 תל אביב':      'פטרסון 3, תל אביב',
    'טבנקין 22 גבעתיים':     'טבנקין 22, גבעתיים',
    'אלנבי 85 תל אביב':      'אלנבי 85, תל אביב',
    'חרנם 10 פ"ת':           'שאול חרנ"ם 10, פתח תקווה',
    'חרנם 6 פ"ת':            'שאול חרנ"ם 6, פתח תקווה',
    'הרברט סמואל 71 חדרה':   'הרברט סמואל 71, חדרה',
    'כנרת 5 בני ברק':        'כנרת 5, בני ברק',
    'פבריגט 32 רמת גן':      'פבריגט 32, רמת גן',
    'קדושיי מזריץ לוד':      'קדושי מזריץ, לוד',
    'טרומן 16 רמת גן':       'טרומן 16, רמת גן',
    'צפת 36 ז"ט':            'צפת 36, זיכרון יעקב',
    'פלמ"ח 9 פ"ת':           'פלמ"ח 9, פתח תקווה',
    'פלמ"ח 9 פת':            'פלמ"ח 9, פתח תקווה',
}

CITY_PATTERNS = [
    (r'ירושלים',   'ירושלים'),
    (r'רמת גן',    'רמת גן'),
    (r'גבעתיים',   'גבעתיים'),
    (r'תל אביב',   'תל אביב'),
    (r'פ"ת',       'פתח תקווה'),
    (r'פת"ה|פתח תקווה', 'פתח תקווה'),
    (r'חדרה',      'חדרה'),
    (r'בני ברק',   'בני ברק'),
    (r'לוד',       'לוד'),
    (r'גני תקווה', 'גני תקווה'),
    (r'רעננה',     'רעננה'),
    (r'זיכרון',    'זיכרון יעקב'),
    (r'ז"ט',       'זיכרון יעקב'),
]


def normalize_address(raw):
    raw = raw.strip()
    return NETOBITZ_ADDRESS_MAP.get(raw, raw)


def extract_city(addr):
    for pat, city in CITY_PATTERNS:
        if re.search(pat, addr):
            return city
    return 'ישראל'


# ─────────────────────────────────────────────
# SHEET 1: NETOBITZ
# ─────────────────────────────────────────────

def parse_netobitz():
    rows = parse_html_file("נכסים איציק+ חברים נטו.html")
    properties = {}
    current_section = "main"

    for row in rows:
        text = " ".join(c for c in row if c)

        if "מספר סידורי" in text or "שכירויות כללי" in text:
            continue
        if "דירות עבר שנמכרו" in text:
            break

        # "שונות" section header
        if cell(row, 1) == "" and cell(row, 2) == "שונות":
            current_section = "various"
            continue

        file_number = cell(row, 3)
        if not file_number or "/" not in file_number:
            continue

        raw_address = cell(row, 4)
        if not raw_address:
            continue

        address = normalize_address(raw_address)
        city = extract_city(address)
        apt = cell(row, 5)
        floor = cell(row, 6)
        rooms = cell(row, 7)
        tenant_name = cell(row, 8)
        email = cell(row, 9)
        phone = cell(row, 10)
        start_date = cell(row, 11)
        end_date = cell(row, 12)
        rent_raw = cell(row, 13)
        notes = cell(row, 14)
        payable_to = cell(row, 17)

        prop_key = address
        if prop_key not in properties:
            is_existing = (current_section == "main")
            subsection_note = ""
            if "נטו דיור" in payable_to:
                subsection_note = "נטו דיור"
            elif "עזבון טאובר" in (notes + payable_to):
                subsection_note = "עזבון טאובר"
            elif "אביעד" in payable_to:
                subsection_note = "נאמנות אביעד נטוביץ"
            elif "צביקה" in notes:
                subsection_note = "צביקה נטוביץ"

            properties[prop_key] = {
                "address": address,
                "city": city,
                "file_number": file_number,
                "is_existing_in_db": is_existing,
                "subsection": subsection_note or ("main" if is_existing else "various"),
                "leases": [],
            }

        if tenant_name:
            lease = make_lease(tenant_name, email, phone, start_date, end_date,
                               rent_raw, notes, apt, floor, rooms)
            properties[prop_key]["leases"].append(lease)

    return {
        "group": "netobitz",
        "source_tag": "מקור: משפחת נטוביץ",
        "owners": [{"name": "יצחק נטוביץ", "phone": None, "email": None}],
        "properties": list(properties.values()),
    }


# ─────────────────────────────────────────────
# SHEET 2: SHARON ESTATE
# ─────────────────────────────────────────────

# Map file number prefix → building address
SHARON_FILE_PREFIX_TO_BUILDING = {
    "4": "עוזי חיטמן 2, רעננה",
    "3": "עוזי חיטמן 4, רעננה",
    "2": "עוזי חיטמן 6, רעננה",
    "6": "עוזי חיטמן 18, רעננה",
    "5": "עוזי חיטמן 16, רעננה",
}


def get_sharon_building(file_number):
    """Extract building address from file number like '6422/4.2'."""
    m = re.search(r"6422/(\d+)\.", file_number)
    if m:
        return SHARON_FILE_PREFIX_TO_BUILDING.get(m.group(1))
    return None


def parse_sharon():
    rows = parse_html_file("עיזבון שלמה שרון - 6422.html")
    properties = {}
    pending_apt = None  # Track row with empty tenant (continuation follows)

    for row in rows:
        text = " ".join(c for c in row if c)

        # Building header row
        if "עיזבון שלמה שרון" in text and "מס'" not in text:
            continue

        # Column header row
        if "מס' סידורי" in text or "מס' תיק" in text:
            continue

        # End of data (fee summary section)
        if any(kw in text for kw in ('שכ"ט גלובלי', "סה\"כ", "חוזה חדש - חצי חודש")):
            break

        file_number = cell(row, 2)

        # ─── Continuation row (empty tenant in previous row) ───
        if (pending_apt is not None
                and (not file_number or "6422" not in file_number)):
            t_name = cell(row, 1)
            t_email = cell(row, 2)
            t_phone = cell(row, 3)
            t_start = cell(row, 4)
            t_rent_raw = cell(row, 5)
            t_notes = cell(row, 6)
            t_end = cell(row, 8)
            t_rent_curr = cell(row, 10)

            if t_name and t_name not in ("", "עיזבון שלמה שרון"):
                rent = t_rent_curr if is_numeric_rent(t_rent_curr) else t_rent_raw
                lease = make_lease(
                    t_name, t_email, t_phone,
                    t_start, t_end, rent, t_notes,
                    pending_apt["apt"], pending_apt["floor"], pending_apt["rooms"],
                )
                addr = pending_apt["address"]
                if addr not in properties:
                    properties[addr] = {
                        "address": addr,
                        "city": "רעננה",
                        "file_number": pending_apt["file_number"],
                        "is_existing_in_db": False,
                        "leases": [],
                    }
                properties[addr]["leases"].append(lease)
                pending_apt = None
            continue

        pending_apt = None  # Reset if we moved to a different section

        # ─── Regular data row ───
        if not file_number or "6422" not in file_number:
            continue

        building = get_sharon_building(file_number)
        if not building:
            continue

        apt = cell(row, 4)
        floor = cell(row, 5)
        rooms = cell(row, 6)
        tenant_name = cell(row, 8)
        email = cell(row, 9)
        phone = cell(row, 10)
        start_date = cell(row, 11)
        rent_raw = cell(row, 12)
        end_date = cell(row, 15)
        notes = cell(row, 16)
        rent_current = cell(row, 17)

        # Use current rent if it's numeric; otherwise fall back to original
        rent = rent_current if is_numeric_rent(rent_current) else rent_raw

        if building not in properties:
            properties[building] = {
                "address": building,
                "city": "רעננה",
                "file_number": file_number,
                "is_existing_in_db": False,
                "leases": [],
            }

        if tenant_name:
            lease = make_lease(tenant_name, email, phone, start_date, end_date,
                               rent, notes, apt, floor, rooms)
            properties[building]["leases"].append(lease)
            pending_apt = None
        else:
            # Empty tenant - continuation row may follow
            pending_apt = {
                "address": building,
                "file_number": file_number,
                "apt": apt,
                "floor": floor,
                "rooms": rooms,
            }

    return {
        "group": "sharon",
        "source_tag": "מקור: עיזבון שלמה שרון (6422)",
        "owners": [{"name": "משפחת שרון", "phone": None, "email": None}],
        "properties": list(properties.values()),
    }


# ─────────────────────────────────────────────
# SHEET 3: HARMON FAMILY
# ─────────────────────────────────────────────

def parse_harmon():
    rows = parse_html_file("  -618 חרמון.html")
    properties = {}

    MAIN_BUILDING = "אריה בראון 12, פתח תקווה"
    MAIN_FILE = "618/12"

    for row in rows:
        text = " ".join(c for c in row if c)

        if "משפחת חרמון" in text or "מס' סידורי" in text or "מס' תיק" in text:
            continue
        # End of data
        if any(kw in text for kw in ('שכ"ט', "דמי ניהול", "מתעניינת")):
            break

        file_number = cell(row, 2)
        if not file_number or "618" not in file_number:
            continue

        # Rows 16-17 in raw data have non-standard structure (address in email col)
        apt_candidate = cell(row, 3)
        email_candidate = cell(row, 8)

        # If "email" column contains a street address → it's a different building
        if email_candidate and "@" not in email_candidate and re.search(r"[א-ת]+\s+\d+", email_candidate):
            # Different property
            prop_address = email_candidate.strip()
            prop_city = extract_city(prop_address)
            if prop_address not in properties:
                properties[prop_address] = {
                    "address": prop_address,
                    "city": prop_city,
                    "file_number": file_number,
                    "is_existing_in_db": False,
                    "leases": [],
                }
            tenant_name = cell(row, 7)
            phone = cell(row, 9)
            start_date = cell(row, 10)
            rent_raw = cell(row, 12)
            end_date = cell(row, 13)
            notes = cell(row, 14)
            if tenant_name:
                lease = make_lease(tenant_name, None, phone, start_date, end_date, rent_raw, notes)
                properties[prop_address]["leases"].append(lease)
            continue

        # Regular apartment in main building
        apt = apt_candidate
        floor = cell(row, 4)
        rooms = cell(row, 5)
        landlord = cell(row, 6)
        tenant_name = cell(row, 7)
        email = cell(row, 8)
        phone = cell(row, 9)
        start_date = cell(row, 10)
        rent_raw = cell(row, 12)
        end_date = cell(row, 13)
        notes = cell(row, 14)

        if MAIN_BUILDING not in properties:
            properties[MAIN_BUILDING] = {
                "address": MAIN_BUILDING,
                "city": "פתח תקווה",
                "file_number": MAIN_FILE,
                "is_existing_in_db": False,
                "leases": [],
            }

        if tenant_name:
            lease = make_lease(tenant_name, email, phone, start_date, end_date,
                               rent_raw, notes, apt, floor, rooms)
            lease["landlord"] = landlord
            properties[MAIN_BUILDING]["leases"].append(lease)

    return {
        "group": "harmon",
        "source_tag": "מקור: משפחת חרמון (618)",
        "owners": [
            {"name": "אברהם חרמון", "phone": None, "email": None},
            {"name": "שמעון חרמון", "phone": None, "email": None},
        ],
        "properties": list(properties.values()),
    }


# ─────────────────────────────────────────────
# SHEET 4: GREENSPAN
# ─────────────────────────────────────────────

# Known Greenspan properties and their canonical names
GREENSPAN_BUILDINGS = {
    "קונגרס": ("הקונגרס 3, תל אביב", "תל אביב"),
    "הקונגרס": ("הקונגרס 3, תל אביב", "תל אביב"),
    "משה סנה": ("משה סנה 9, רמת גן", "רמת גן"),
    "הסנה": ("משה סנה 9, רמת גן", "רמת גן"),
}

GREENSPAN_SKIP_WORDS = {
    "תת חלקה", "חלקה", "שכ\"ט", "דמי ניהול", "חוזה שכירות",
    "הארכת שכירות", "רחל החלה", "כתובת", "גוש", "שוכרים",
    "רחל גרינשפן", "קלאודיה", "תיק 6557", "סה\"כ", "ששולם",
    "לחייב", "18294", "15463", "33757",
}


def is_greenspan_address(text):
    """True if text looks like a street address (not a subparcel or note)."""
    if not text:
        return False
    if any(kw in text for kw in ("תת חלקה", "חלקה", "גוש", "תת")):
        return False
    return bool(re.search(r"[א-ת]+\s+\d+", text))


def parse_greenspan():
    rows = parse_html_file("- רחלי גרינשפן  6557 - .html")
    properties = {}

    FEE_SECTION_MARKERS = ('שכ"ט לגביה', "דמי ניהול חודש", "חוזה שכירות חדש")

    for row in rows:
        text = " ".join(c for c in row if c)

        # Break at fee/admin section
        if any(kw in text for kw in FEE_SECTION_MARKERS):
            break

        # The address is always in col1 (index 1)
        col0 = cell(row, 1)  # address column

        # Only process rows where col0 is a valid street address
        if not is_greenspan_address(col0):
            continue

        col2 = cell(row, 3)  # tenant name
        col3 = cell(row, 4)  # end date (contract expiry)
        col4 = cell(row, 5)  # rent
        col5 = cell(row, 6)  # contact info

        # Identify building
        building_addr, city = None, None
        for key, (addr, c) in GREENSPAN_BUILDINGS.items():
            if key in col0:
                building_addr, city = addr, c
                break

        if not building_addr:
            continue

        if building_addr not in properties:
            properties[building_addr] = {
                "address": building_addr,
                "city": city,
                "file_number": "6557",
                "is_existing_in_db": False,
                "leases": [],
            }

        tenant_name = col2
        end_date = col3
        rent_raw = col4
        contact_info = col5

        # Extract phone from contact info (avoid extracting national IDs)
        phone = None
        if contact_info:
            m = re.search(r"(0\d[\d\-]{8,})", contact_info)
            if m:
                phone = m.group(1)

        if tenant_name and tenant_name not in ("כתובת", ""):
            lease = make_lease(tenant_name, None, phone, None, end_date, rent_raw)
            properties[building_addr]["leases"].append(lease)

    return {
        "group": "greenspan",
        "source_tag": "מקור: רחלי גרינשפן (6557)",
        "owners": [{"name": "רחל גרינשפן", "phone": None, "email": None}],
        "properties": list(properties.values()),
    }


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    print("Parsing Netobitz sheet...")
    netobitz = parse_netobitz()
    print(f"  → {len(netobitz['properties'])} properties, "
          f"{sum(len(p['leases']) for p in netobitz['properties'])} leases")

    print("Parsing Sharon Estate sheet...")
    sharon = parse_sharon()
    print(f"  → {len(sharon['properties'])} properties, "
          f"{sum(len(p['leases']) for p in sharon['properties'])} leases")

    print("Parsing Harmon family sheet...")
    harmon = parse_harmon()
    print(f"  → {len(harmon['properties'])} properties, "
          f"{sum(len(p['leases']) for p in harmon['properties'])} leases")

    print("Parsing Greenspan sheet...")
    greenspan = parse_greenspan()
    print(f"  → {len(greenspan['properties'])} properties, "
          f"{sum(len(p['leases']) for p in greenspan['properties'])} leases")

    result = {
        "generated_at": datetime.now().isoformat(),
        "groups": [netobitz, sharon, harmon, greenspan],
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Output written to: {OUTPUT_FILE}")

    total_props = sum(len(g["properties"]) for g in result["groups"])
    total_leases = sum(
        len(p["leases"])
        for g in result["groups"]
        for p in g["properties"]
    )
    print(f"\n📊 Summary:")
    print(f"   Groups:     4")
    print(f"   Properties: {total_props}")
    print(f"   Leases:     {total_leases}")


if __name__ == "__main__":
    main()
