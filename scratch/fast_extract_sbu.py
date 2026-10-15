import json

js_file = r"C:\Users\abhis\.gemini\antigravity-ide\brain\972c1fd0-b674-43e8-8c92-4b0553f34027\.system_generated\steps\948\content.md"

with open(js_file, "r", encoding="utf-8", errors="ignore") as f:
    raw = f.read()

print(f"Read file length: {len(raw)} chars")

# Split by double quotes to get all string literals
parts = raw.split('"')
print(f"Total quoted segments: {len(parts)}")

keywords = [
    "sarala birla", "b.k. birla", "kumar mangalam birla", "chancellor", "vice-chancellor",
    "registrar", "mahilong", "purulia road", "birla knowledge city", "ranchi", "jharkhand",
    "pin", "835103", "info@sbu.ac.in", "admission@sbu.ac.in", "motto", "dhyeyam",
    "vision", "mission", "sports", "ground", "gymnasium", "court", "umang", "faculty",
    "school of", "department of", "engineering", "management", "library", "hostel",
    "logo", "crest"
]

matched_strings = []
seen = set()

for p in parts:
    p_clean = p.strip()
    if 10 <= len(p_clean) <= 400:
        p_lower = p_clean.lower()
        for kw in keywords:
            if kw in p_lower:
                if p_clean not in seen and not p_clean.startswith("http://www.w3.org") and not p_clean.startswith("M") and not p_clean.startswith("d="):
                    seen.add(p_clean)
                    matched_strings.append(p_clean)
                break

print(f"Found {len(matched_strings)} relevant university text strings.")

# Group into categories
categorized = {
    "identity_and_location": [],
    "leadership_and_people": [],
    "vision_mission_motto": [],
    "academics_and_schools": [],
    "sports_and_facilities": [],
    "media_and_logos": []
}

for s in matched_strings:
    s_low = s.lower()
    if any(k in s_low for k in ["mahilong", "purulia road", "birla knowledge city", "835103", "info@sbu", "admission@sbu", "campus"]):
        categorized["identity_and_location"].append(s)
    elif any(k in s_low for k in ["chancellor", "vice-chancellor", "vice chancellor", "registrar", "kumar mangalam", "sarala birla", "b.k. birla"]):
        categorized["leadership_and_people"].append(s)
    elif any(k in s_low for k in ["vision", "mission", "motto", "dhyeyam", "knowledge is", "goal", "objective"]):
        categorized["vision_mission_motto"].append(s)
    elif any(k in s_low for k in ["faculty of", "school of", "department of", "course", "b.tech", "mba", "polytechnic"]):
        categorized["academics_and_schools"].append(s)
    elif any(k in s_low for k in ["sports", "ground", "gym", "court", "cricket", "football", "badminton", "volleyball", "basketball", "athletics", "indoor", "outdoor"]):
        categorized["sports_and_facilities"].append(s)
    elif any(k in s_low for k in ["logo", "crest", ".png", ".jpg", ".svg", ".webp"]):
        categorized["media_and_logos"].append(s)

with open("scratch/sbu_clean_extracted.json", "w", encoding="utf-8") as f:
    json.dump(categorized, f, indent=2)

print("\n--- SAMPLE EXTRACTED DATA ---")
for cat, items in categorized.items():
    print(f"\n[{cat.upper()}] ({len(items)} items)")
    for it in items[:6]:
        print(f"  • {it[:120]}")
