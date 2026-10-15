with open('scratch/sbu_bundle.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

import re
matches = re.findall(r'src[:=]["\']([^"\']*logo[^"\']*)["\']', js, re.I)
print('src matches:', set(matches[:20]))

header_matches = [m.start() for m in re.finditer(r'toplogo', js, re.I)]
for pos in header_matches[:5]:
    print('--- context around toplogo ---')
    print(js[max(0, pos-200):min(len(js), pos+200)])
