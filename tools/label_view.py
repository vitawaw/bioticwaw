#!/usr/bin/env python3
"""Print the parts of a saved label needed to write a drug (dose, kidney, interactions, contraindications, food).

Usage: python3 tools/label_view.py <id> [max chars per part, default 4000]
Reads docs/antibiotics/labels/<id>.json (written by fetch_labels.py / fetch_eu_labels.py).
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def txt(v):
    t = ' '.join(v) if isinstance(v, list) else str(v)
    t = re.sub(r'</t[dh]>', ' | ', t)                      # keep table cells apart
    t = re.sub(r'</tr>', ' // ', t)
    t = re.sub(r'<[^>]+>', ' ', t)                         # no markup
    return re.sub(r'\s+', ' ', t).strip()


def sentences(text, pat, limit):
    out, seen = [], set()
    for s in re.split(r'(?<=[.;])\s+', text):
        if re.search(pat, s, re.I) and s not in seen:
            seen.add(s); out.append(s.strip())
    return ' | '.join(out)[:limit]


def main(i, n):
    d = json.load(open(os.path.join(ROOT, 'docs', 'antibiotics', 'labels', i + '.json'), encoding='utf-8'))
    s = {k: txt(v) for k, v in d['sections'].items()}
    full = s.get('full_text') or ' '.join(s.values())
    print('#', i, '|', ', '.join(d.get('brand') or []), '|', ', '.join(d.get('manufacturer') or []), '| date', d.get('effective_time'),
          '|', d.get('label_kind', 'US label'), '|', d.get('url'))
    def part(title, *keys):
        for k in keys:
            if s.get(k):
                print('\n==', title, '(' + k + ')'); print(s[k][:n]); return
    if 'full_text' in s and 'dosage_and_administration' not in s and '4.2' not in s:
        # old or EU label without coded sections: show the dose part of the full text
        j = re.search(r'DOSAGE AND ADMINISTRATION|Posolog|POSOLOG|4\.2', full)
        print('\n== DOSE (from the full text)'); print(full[j.start() if j else 0:][:n * 2])
    part('USES', 'indications_and_usage', '4.1')
    part('DOSE', 'dosage_and_administration', '4.2')
    if s.get('dosage_and_administration_table'):
        print('\n== DOSE TABLES'); print(s['dosage_and_administration_table'][:n])
    print('\n== KIDNEY / DIALYSIS (sentences anywhere in the label)')
    print(sentences(full, r'renal|creatinine clearance|CrCl|CLcr|dialys|kidney|clairance|insuffisance r', n))
    print('\n== FOOD / TIMING (sentences)')
    print(sentences(full, r'with food|without food|empty stomach|meal|antacid|dairy|milk|repas|à jeun|hours (before|after)', n // 2))
    part('CONTRAINDICATIONS', 'contraindications', '4.3')
    part('INTERACTIONS', 'drug_interactions', '4.5')
    if s.get('drug_interactions_table'):
        print('\n== INTERACTION TABLES'); print(s['drug_interactions_table'][:n])
    if s.get('boxed_warning'):
        print('\n== BOXED WARNING'); print(s['boxed_warning'][:n // 2])


if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 4000)
