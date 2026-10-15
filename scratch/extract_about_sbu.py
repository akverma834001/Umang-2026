import json
import re

js_file = r"C:\Users\abhis\.gemini\antigravity-ide\brain\972c1fd0-b674-43e8-8c92-4b0553f34027\.system_generated\steps\948\content.md"
with open(js_file, encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Find Vision and Mission
parts = text.split('"')

vision_items = []
for i, p in enumerate(parts):
    if any(k in p for k in ["To build", "To develop", "To become a globally", "To provide quality", "To impart", "To emerge as a premier", "To foster"]):
        if 20 < len(p) < 400:
            vision_items.append(p)

about_items = []
for p in parts:
    if any(k in p for k in ["Sarala Birla University has been established", "Sarala Birla University is a", "Bharat Arogya", "The University aims to"]):
        if 20 < len(p) < 400:
            about_items.append(p)

sports_items = []
for p in parts:
    if any(k in p.lower() for k in ["sports department", "sports ground", "umang", "athletic meet", "basketball court", "volleyball court", "astroturf"]):
        if 15 < len(p) < 400:
            sports_items.append(p)

summary = {
    "vision_mission": list(set(vision_items)),
    "about_university": list(set(about_items)),
    "sports_facility_and_umang": list(set(sports_items))
}

with open("scratch/sbu_official_summary.json", "w", encoding="utf-8") as out:
    json.dump(summary, out, indent=2)

print(f"Extracted {len(summary['vision_mission'])} vision/mission items")
print(f"Extracted {len(summary['about_university'])} about university items")
print(f"Extracted {len(summary['sports_facility_and_umang'])} sports/umang items")

print("\n--- ABOUT UNIVERSITY ---")
for a in summary["about_university"][:5]:
    print("•", a)

print("\n--- SPORTS & UMANG ---")
for s in summary["sports_facility_and_umang"][:10]:
    print("•", s)
