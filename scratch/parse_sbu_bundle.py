import json
import re

js_file = r"C:\Users\abhis\.gemini\antigravity-ide\brain\972c1fd0-b674-43e8-8c92-4b0553f34027\.system_generated\steps\948\content.md"

with open(js_file, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

print(f"Loaded file size: {len(text)} characters")

# Extract SBU details
def find_matches(pattern, max_len=300):
    matches = re.findall(pattern, text, re.IGNORECASE)
    cleaned = []
    for m in matches:
        if isinstance(m, tuple):
            m = " ".join(m)
        m = m.strip().replace("\\n", " ").replace('\\"', '"')
        if 5 < len(m) <= max_len and m not in cleaned:
            cleaned.append(m)
    return cleaned

# 1. Contact Info & Addresses
contacts = find_matches(r'[^"\']*(?:Mahilong|Purulia Road|Birla Knowledge City|Ranchi|info@sbu\.ac\.in|admission@sbu\.ac\.in|\+91\s?[0-9]{10}|Toll Free|Pin\s*[-:]?\s*835103)[^"\']*', 250)

# 2. Vision & Mission
vision_mission = find_matches(r'[^"\']*(?:Vision|Mission|Objective|Preamble)[^"\']*(?:Sarala Birla|University|knowledge|excellence|global|society)[^"\']*', 400)

# 3. Leadership & Authorities
leadership = find_matches(r'[^"\']*(?:Chancellor|Vice-Chancellor|Vice Chancellor|Registrar|Sarala Birla|B.K. Birla|Kumar Mangalam Birla|Jayshree Mohta|Anant Birla|Deepak Srivastava|Gopal Pathak)[^"\']*', 250)

# 4. Schools / Faculties / Departments
schools = find_matches(r'[^"\']*(?:Faculty of|School of|Department of)[^"\']*(?:Engineering|Management|Commerce|Humanities|Yoga|Science|Nursing|Pharmacy|Law)[^"\']*', 200)

# 5. Campus Facilities & Sports
facilities = find_matches(r'[^"\']*(?:Sports|Ground|Gymnasium|Indoor|Outdoor|Court|Track|Hostel|Library|Auditorium|Cafeteria|Laboratories|Cricket|Football|Basketball|Volleyball|Badminton|Table Tennis|Chess|Kabaddi)[^"\']*', 250)

# 6. Monogram / Logo / Images / Motto
logos_and_motto = find_matches(r'[^"\']*(?:motto|logo|crest|seal|symbol|emblem|monogram|dhyeyam|paramam|gyan)[^"\']*', 200)

# 7. Image assets
image_assets = list(set(re.findall(r'/[a-zA-Z0-9_\-\./]+\.(?:png|jpg|jpeg|svg|webp)', text, re.IGNORECASE)))

results = {
    "contacts": contacts[:15],
    "vision_mission": vision_mission[:15],
    "leadership": leadership[:15],
    "schools": schools[:20],
    "facilities": facilities[:25],
    "logos_and_motto": logos_and_motto[:20],
    "image_assets": [img for img in image_assets if any(k in img.lower() for k in ['logo', 'crest', 'seal', 'monogram', 'sbu', 'sports', 'banner', 'campus'])][:30]
}

with open("scratch/sbu_extracted_info.json", "w", encoding="utf-8") as out:
    json.dump(results, out, indent=2)

print("Extraction complete! Saved to scratch/sbu_extracted_info.json")
print("\n--- SAMPLE EXTRACTED CONTACTS ---")
for c in results["contacts"][:5]:
    print(" -", c)

print("\n--- SAMPLE LEADERSHIP ---")
for l in results["leadership"][:5]:
    print(" -", l)

print("\n--- SAMPLE LOGOS & IMAGES ---")
for img in results["image_assets"][:10]:
    print(" -", img)
