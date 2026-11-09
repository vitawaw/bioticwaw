#!/usr/bin/env python3
"""Save the official UK / EU / French label (SmPC, RCP) of the antibiotics that have no US label.

Usage:  python3 tools/fetch_eu_labels.py [id ...]
Output: docs/antibiotics/labels/<id>.json in the same shape as tools/fetch_labels.py, with sections
        '4.1' (uses), '4.2' (dose), '4.3' (contraindications), '4.4' (warnings), '4.5' (interactions) and the full text.
Sources: UK eMC (medicines.org.uk SmPC), EMA product information (PDF), French public medicines database (RCP, in French).
"""
import json, os, re, subprocess, sys, tempfile, urllib.request, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'antibiotics', 'labels')
UA = {'User-Agent': 'Mozilla/5.0 (label-evidence-script)'}

# id: (kind, reference, name shown as the source)
EU = {
  'fluclox': ('emc', '12636', 'Flucloxacillin 500 mg capsules, hard (UK SmPC, eMC)'),
  'teico': ('emc', '2927', 'Targocid 400 mg powder for solution for injection/infusion (UK SmPC, eMC)'),
  'fusidic': ('emc', '5515', 'Fucidin 250 mg Tablets (sodium fusidate), UK SmPC, eMC'),
  'delamanid': ('ema', 'https://www.ema.europa.eu/en/documents/product-information/deltyba-epar-product-information_en.pdf', 'Deltyba (delamanid), EU product information (EMA)'),
  'temocillin': ('ansm', '62424059', 'NEGABAN 1 g (temocilline), RCP, French public medicines database'),
  'roxithro': ('ansm', '65393957', 'RULID 150 mg (roxithromycine), RCP, French public medicines database'),
  'josamycin': ('ansm', '64877364', 'JOSACINE 500 mg (josamycine), RCP, French public medicines database'),
  'pristina': ('ansm', '63728481', 'PYOSTACINE 500 mg (pristinamycine), RCP, French public medicines database'),
  'norflox': ('ansm', '68557867', 'NORFLOXACINE EG 400 mg, RCP, French public medicines database'),
}


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        return r.read(), r.geturl()


def html_text(b):
    t = b.decode('utf-8', 'replace')
    t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
    t = re.sub(r'<(br|p|div|li|h\d|tr)[^>]*>', '\n', t)
    t = H.unescape(re.sub(r'<[^>]+>', ' ', t))
    return re.sub(r'[ \t\r\f\v]+', ' ', re.sub(r'\n\s*\n+', '\n', t)).strip()


def sections(text):
    """cut sections 4.1 to 4.5 of an SmPC / RCP (numbering is the same in every EU country)"""
    out = {}
    marks = [(m.start(), m.group(1)) for m in re.finditer(r'(?m)^\s*(4\.[1-9])\.?\s+[A-ZÉÈa-zé]', text)]
    # the table of contents repeats the headings: keep the LAST start of each number before 5.1
    end51 = [m.start() for m in re.finditer(r'(?m)^\s*5\.1\.?\s+[A-ZÉa-zé]', text)]
    stop = end51[-1] if end51 else len(text)
    last = {}
    for pos, num in marks:
        if pos < stop:
            last[num] = pos
    nums = sorted(last.items(), key=lambda x: x[1])
    for k, (num, pos) in enumerate(nums):
        nxt = nums[k + 1][1] if k + 1 < len(nums) else stop
        if num in ('4.1', '4.2', '4.3', '4.4', '4.5'):
            out[num] = [text[pos:nxt].strip()]
    return out


def one(i):
    kind, ref, name = EU[i]
    if kind == 'emc':
        url = 'https://www.medicines.org.uk/emc/product/%s/smpc' % ref
        b, final = fetch(url)
        text = html_text(b)
    elif kind == 'ansm':
        if not ref:
            return None
        url = 'https://base-donnees-publique.medicaments.gouv.fr/affichageDoc.php?specid=%s&typedoc=R' % ref
        b, final = fetch(url)
        text = html_text(b)
    else:
        url = ref
        b, final = fetch(url)
        with tempfile.NamedTemporaryFile(suffix='.pdf') as f:
            f.write(b); f.flush()
            text = subprocess.run(['pdftotext', '-layout', f.name, '-'], capture_output=True, text=True).stdout
        text = text.split('ANNEX II')[0]  # the SmPC only (annex I)
    secs = sections(text)
    secs['full_text'] = [text]
    m = re.search(r'(?:Date of revision of the text|DATE OF REVISION OF THE TEXT|Date de mise à jour du texte|DATE DE MISE A JOUR DU TEXTE)[^\n]*\n?\s*([^\n]{3,40})', text)
    return {'id': i, 'query': url, 'set_id': None, 'version': None, 'effective_time': m.group(1).strip() if m else None,
            'brand': [name], 'generic': [], 'route': [], 'manufacturer': [], 'url': url, 'sections': secs,
            'label_kind': {'emc': 'UK SmPC', 'ema': 'EU SmPC (EMA)', 'ansm': 'French RCP'}[kind]}


def main(ids):
    os.makedirs(OUT, exist_ok=True)
    for i in ids:
        try:
            rec = one(i)
        except Exception as e:
            print(i, 'FAILED', e); continue
        if not rec:
            print(i, 'NO LABEL'); continue
        with open(os.path.join(OUT, i + '.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, ensure_ascii=False, indent=1)
        s = rec['sections']
        print(i, rec['label_kind'], rec['effective_time'], {k: len(v[0]) for k, v in s.items() if k != 'full_text'}, 'full', len(s['full_text'][0]))


if __name__ == '__main__':
    main(sys.argv[1:] or list(EU))
