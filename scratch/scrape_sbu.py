import urllib.request
import re
import json

url = 'https://sbu.ac.in/assets/index-_qmwC5ZK.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print(f"Fetched bundle size: {len(content)} characters")
        
        # Look for logo URLs
        logos = set(re.findall(r'["\'](/[^"\']*(?:logo|crest|seal|monogram|brand)[^"\']*\.(?:png|jpg|jpeg|svg|webp))["\']', content, re.IGNORECASE))
        print("Logos / Crests:", logos)

        # Look for image URLs
        all_imgs = set(re.findall(r'["\'](/[^"\']*\.(?:png|jpg|jpeg|svg|webp))["\']', content, re.IGNORECASE))
        print("Sample Images:", list(all_imgs)[:15])

        # Look for emails
        emails = set(re.findall(r'[a-zA-Z0-9_.+-]+@sbu\.ac\.in', content))
        print("Official SBU Emails:", emails)

        # Look for address/location mentions
        addresses = re.findall(r'[^"\']*(?:Birla Knowledge City|Mahilong|Purulia Road|Ranchi|Jharkhand)[^"\']*', content, re.IGNORECASE)
        unique_addr = list(set([a.strip() for a in addresses if len(a.strip()) < 200]))[:10]
        print("Address / Location text:", unique_addr)

        # Look for Vision, Mission, Motto, Leadership
        leadership = re.findall(r'[^"\']*(?:Chancellor|Vice Chancellor|Registrar|Sarala Birla|B.K. Birla|Kumar Mangalam Birla)[^"\']*', content)
        unique_leaders = list(set([l.strip() for l in leadership if 10 < len(l.strip()) < 150]))[:10]
        print("Leadership / Founders text:", unique_leaders)

        # Look for text mentioning sports, gymnasium, grounds, umang
        sports_text = re.findall(r'[^"\']*(?:sports|ground|athletic|cricket|football|basketball|volleyball|gymnasium|indoor|outdoor|badminton|kabaddi|yoga)[^"\']*', content, re.IGNORECASE)
        print(f"Total sports mentions: {len(sports_text)}")
        sample_sports = list(set([s.strip() for s in sports_text if 15 < len(s.strip()) < 150]))[:10]
        print("Sample Sports text:", sample_sports)

        # Save extracted info to json
        out_data = {
            "logos": list(logos),
            "sample_imgs": list(all_imgs),
            "emails": list(emails),
            "addresses": unique_addr,
            "leadership": unique_leaders,
            "sample_sports": sample_sports
        }
        with open("scratch/sbu_scraped_data.json", "w", encoding="utf-8") as f:
            json.dump(out_data, f, indent=2)
        print("Wrote scratch/sbu_scraped_data.json")

except Exception as e:
    print("Error fetching bundle:", e)
