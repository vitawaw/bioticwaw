#!/usr/bin/env python3
"""Save the official FDA label of each antibiotic as exact text (evidence for every number on the site).

Usage:  python3 tools/fetch_labels.py [id ...]      (no ids = every drug in DRUGS below)
Output: docs/antibiotics/labels/<id>.json  {id, query, set_id, version, effective_time, brand, generic, route,
        manufacturer, url, sections:{name: text}}  (sections copied verbatim from openFDA = the label on DailyMed)

The newest human prescription label whose generic name matches exactly and whose route matches is chosen.
Drugs without a US label are listed in NO_US_LABEL; they need the EU/UK label (see docs/antibiotics/PLAN.md).
"""
import json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'antibiotics', 'labels')
API = 'https://api.fda.gov/drug/label.json'
# the sections kept (everything a dose, kidney adjustment, timing or interaction can come from)
KEEP = ['boxed_warning', 'indications_and_usage', 'dosage_and_administration', 'dosage_and_administration_table',
        'dosage_forms_and_strengths', 'contraindications', 'warnings_and_cautions', 'warnings', 'precautions',
        'drug_interactions', 'drug_interactions_table', 'use_in_specific_populations', 'pregnancy', 'nursing_mothers',
        'lactation', 'pediatric_use', 'geriatric_use', 'renal_impairment', 'hepatic_impairment', 'overdosage',
        'information_for_patients', 'clinical_pharmacology', 'pharmacokinetics']

# id: (search words, exact generic name regex, route regex)
DRUGS = {
  # batch 1 (already loaded; labels kept as evidence for the calculators)
  'amox': ('amoxicillin', r'^AMOXICILLIN$', 'ORAL'),
  'amox_clav': ('amoxicillin clavulanate', r'^AMOXICILLIN AND CLAVULANATE POTASSIUM$', 'ORAL'),
  'cefalex': ('cephalexin', r'^CEPHALEXIN$', 'ORAL'),
  'doxy': ('doxycycline', r'^DOXYCYCLINE( HYCLATE)?$', 'ORAL'),
  'cipro': ('ciprofloxacin', r'^CIPROFLOXACIN( HYDROCHLORIDE)?$', 'ORAL'),
  'azithro': ('azithromycin', r'^AZITHROMYCIN( MONOHYDRATE| DIHYDRATE)?$', 'ORAL'),
  'nitro': ('nitrofurantoin', r'^NITROFURANTOIN(, MACROCRYSTALLINE| MONOHYDRATE.*| MACROCRYSTALS)?$', 'ORAL'),
  'metro': ('metronidazole', r'^METRONIDAZOLE$', 'ORAL'),
  'ceftriaxone': ('ceftriaxone', r'^CEFTRIAXONE( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'smx_tmp': ('sulfamethoxazole trimethoprim', r'^SULFAMETHOXAZOLE AND TRIMETHOPRIM$', 'ORAL'),
  # batch 2
  'clarith': ('clarithromycin', r'^CLARITHROMYCIN$', 'ORAL'),
  'levo': ('levofloxacin', r'^LEVOFLOXACIN$', 'ORAL'),
  'cefurox': ('cefuroxime axetil', r'^CEFUROXIME AXETIL$', 'ORAL'),
  'cefixime': ('cefixime', r'^CEFIXIME$', 'ORAL'),
  'clinda': ('clindamycin', r'^CLINDAMYCIN( HYDROCHLORIDE)?$', 'ORAL'),
  'cefazolin': ('cefazolin', r'^CEFAZOLIN( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'genta': ('gentamicin', r'^GENTAMICIN( SULFATE)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'vanco': ('vancomycin', r'^VANCOMYCIN( HYDROCHLORIDE)?$', 'INTRAVENOUS'),
  'linezolid': ('linezolid', r'^LINEZOLID$', 'ORAL'),
  # batch 3
  'ampicillin': ('ampicillin', r'^AMPICILLIN( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'amp_sulb': ('ampicillin sulbactam', r'^AMPICILLIN (SODIUM )?AND SULBACTAM( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'pen_v': ('penicillin v potassium', r'^PENICILLIN V POTASSIUM$', 'ORAL'),
  'benz_pen': ('penicillin g benzathine', r'^PENICILLIN G BENZATHINE$', 'INTRAMUSCULAR'),
  'dicloxa': ('dicloxacillin', r'^DICLOXACILLIN( SODIUM)?$', 'ORAL'),
  'pip_tazo': ('piperacillin tazobactam', r'^PIPERACILLIN( SODIUM)? AND TAZOBACTAM( SODIUM)?$', 'INTRAVENOUS'),
  'cefadroxil': ('cefadroxil', r'^CEFADROXIL$', 'ORAL'),
  # batch 4
  'cefaclor': ('cefaclor', r'^CEFACLOR$', 'ORAL'),
  'cefprozil': ('cefprozil', r'^CEFPROZIL$', 'ORAL'),
  'cefpodox': ('cefpodoxime proxetil', r'^CEFPODOXIME PROXETIL$', 'ORAL'),
  'cefdinir': ('cefdinir', r'^CEFDINIR$', 'ORAL'),
  'cefoxitin': ('cefoxitin', r'^CEFOXITIN( SODIUM)?$', 'INTRAVENOUS'),
  'cefotetan': ('cefotetan', r'^CEFOTETAN( DISODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'cefotaxime': ('cefotaxime', r'^CEFOTAXIME( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'ceftaz': ('ceftazidime', r'^CEFTAZIDIME( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  # batch 5
  'cefepime': ('cefepime', r'^CEFEPIME( HYDROCHLORIDE)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'ceftaroline': ('ceftaroline fosamil', r'^CEFTAROLINE FOSAMIL$', 'INTRAVENOUS'),
  'cefiderocol': ('cefiderocol', r'^CEFIDEROCOL( SULFATE TOSYLATE)?$', 'INTRAVENOUS'),
  'ceftolo_tazo': ('ceftolozane tazobactam', r'^CEFTOLOZANE (SULFATE )?AND TAZOBACTAM( SODIUM)?$', 'INTRAVENOUS'),
  'ceftaz_avi': ('ceftazidime avibactam', r'^CEFTAZIDIME,? (AND )?AVIBACTAM( SODIUM)?$', 'INTRAVENOUS'),
  'imi_cila': ('imipenem cilastatin', r'^IMIPENEM AND CILASTATIN( SODIUM)?$', 'INTRAVENOUS'),
  'meropenem': ('meropenem', r'^MEROPENEM$', 'INTRAVENOUS'),
  'ertapenem': ('ertapenem', r'^ERTAPENEM( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  # batch 6
  'aztreonam': ('aztreonam', r'^AZTREONAM$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'mero_vabor': ('meropenem vaborbactam', r'^MEROPENEM[- ](AND )?VABORBACTAM$', 'INTRAVENOUS'),
  'amikacin': ('amikacin', r'^AMIKACIN( SULFATE)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'tobra': ('tobramycin', r'^TOBRAMYCIN( SULFATE)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'strepto': ('streptomycin', r'^STREPTOMYCIN( SULFATE)?$', 'INTRAMUSCULAR'),
  'plazomicin': ('plazomicin', r'^PLAZOMICIN( SULFATE)?$', 'INTRAVENOUS'),
  'erythro': ('erythromycin', r'^ERYTHROMYCIN( BASE| STEARATE| ETHYLSUCCINATE)?$', 'ORAL'),
  # batch 7
  'lincomycin': ('lincomycin', r'^LINCOMYCIN( HYDROCHLORIDE)?$', 'INTRAMUSCULAR|INTRAVENOUS'),
  'minocycline': ('minocycline', r'^MINOCYCLINE( HYDROCHLORIDE)?$', 'ORAL'),
  'tetracycline': ('tetracycline', r'^TETRACYCLINE( HYDROCHLORIDE)?$', 'ORAL'),
  'tigecycline': ('tigecycline', r'^TIGECYCLINE$', 'INTRAVENOUS'),
  'omadacycline': ('omadacycline', r'^OMADACYCLINE( TOSYLATE)?$', 'ORAL|INTRAVENOUS'),
  'eravacycline': ('eravacycline', r'^ERAVACYCLINE( DIHYDROCHLORIDE)?$', 'INTRAVENOUS'),
  'moxi': ('moxifloxacin', r'^MOXIFLOXACIN( HYDROCHLORIDE)?$', 'ORAL'),
  'oflox': ('ofloxacin', r'^OFLOXACIN$', 'ORAL'),
  # batch 8
  'delaflox': ('delafloxacin', r'^DELAFLOXACIN( MEGLUMINE)?$', 'ORAL|INTRAVENOUS'),
  'tmp': ('trimethoprim', r'^TRIMETHOPRIM( HYDROCHLORIDE)?$', 'ORAL'),
  'sulfadiazine': ('sulfadiazine', r'^SULFADIAZINE$', 'ORAL'),
  'fosfo': ('fosfomycin tromethamine', r'^FOSFOMYCIN TROMETHAMINE$', 'ORAL'),
  'tinidazole': ('tinidazole', r'^TINIDAZOLE$', 'ORAL'),
  'dapto': ('daptomycin', r'^DAPTOMYCIN$', 'INTRAVENOUS'),
  # batch 9
  'dalba': ('dalbavancin', r'^DALBAVANCIN( HYDROCHLORIDE)?$', 'INTRAVENOUS'),
  'orita': ('oritavancin', r'^ORITAVANCIN( DIPHOSPHATE)?$', 'INTRAVENOUS'),
  'tedizolid': ('tedizolid phosphate', r'^TEDIZOLID PHOSPHATE$', 'ORAL|INTRAVENOUS'),
  'rifampin': ('rifampin', r'^RIFAMPIN$', 'ORAL'),
  'rifabutin': ('rifabutin', r'^RIFABUTIN$', 'ORAL'),
  'rifapentine': ('rifapentine', r'^RIFAPENTINE$', 'ORAL'),
  'isoniazid': ('isoniazid', r'^ISONIAZID$', 'ORAL'),
  'ethambutol': ('ethambutol', r'^ETHAMBUTOL( HYDROCHLORIDE)?$', 'ORAL'),
  'pza': ('pyrazinamide', r'^PYRAZINAMIDE$', 'ORAL'),
  'bedaquiline': ('bedaquiline', r'^BEDAQUILINE( FUMARATE)?$', 'ORAL'),
  # batch 10
  'pretomanid': ('pretomanid', r'^PRETOMANID$', 'ORAL'),
  'colistin': ('colistimethate', r'^COLISTIMETHATE( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'polymyxin_b': ('polymyxin b', r'^POLYMYXIN B( SULFATE)?$', 'INTRAVENOUS|INTRAMUSCULAR|INTRATHECAL'),
  'fidaxo': ('fidaxomicin', r'^FIDAXOMICIN$', 'ORAL'),
  'rifaximin': ('rifaximin', r'^RIFAXIMIN$', 'ORAL'),
  'lefamulin': ('lefamulin', r'^LEFAMULIN( ACETATE)?$', 'ORAL|INTRAVENOUS'),
  # replacements for drugs with no current official label anywhere (see docs/antibiotics/PLAN.md)
  'pen_g': ('penicillin g potassium', r'^PENICILLIN G POTASSIUM$', 'INTRAVENOUS|INTRAMUSCULAR'),
  'azt_avi': ('aztreonam avibactam', r'^AZTREONAM.*AVIBACTAM', 'INTRAVENOUS'),
  'methenamine': ('methenamine hippurate', r'^METHENAMINE HIPPURATE$', 'ORAL'),
  'oxacillin': ('oxacillin', r'^OXACILLIN( SODIUM)?$', 'INTRAVENOUS|INTRAMUSCULAR'),
}
# no current US label: the official EU/UK label is used instead (fetched separately)
NO_US_LABEL = ['flucloxacillin', 'temocillin', 'cefradine', 'cefalotin', 'roxithromycin', 'josamycin', 'teicoplanin',
               'delamanid', 'fusidic_acid', 'pristinamycin']


REPACK = re.compile(r'REMEDYREPACK|NUCARE|PREFERRED PHARMA|PROFICIENT RX|BRYANT RANCH|A-S MEDICATION|PD-RX|REDPHARM|'
                    r"ST\. MARY'S|HENRY SCHEIN|CARDINAL HEALTH|DIRECT[_ ]RX|QUALITY CARE|APHENA|LAKE ERIE|NORTHWIND|"
                    r'MEDSOURCE|ASCLEMED|DENTON|UNIT DOSE SERVICES|AIDAREX|RPK|PROPACK|COUPLER|PHYSICIANS TOTAL CARE|'
                    r'BLENHEIM|STAT RX|RXCHANGE|NUCARE|MCKESSON|MAJOR PHARMA|AVKARE|GOLDEN STATE|CLINICAL SOLUTIONS', re.I)

# labels that only DailyMed still holds (newest SPL for these set ids); sections are taken by their LOINC codes
DAILYMED = {
  'secnidazole': '056485b6-8bba-4a21-ae00-cdb4e7ae4bfa',   # Solosec
  'cefditoren': '1c90b649-5536-417c-82cb-89663137f14f',    # Spectracef (2013, no longer marketed in the US)
  'ceftobiprole': '2bd685df-7dc6-78a6-e063-6294a90a580b',  # Zevtera
  'telithro': 'ba1cca98-f350-4655-88e3-6ef990779fb9',      # Ketek (2012, withdrawn from the US market)
  'gemiflox': '63f60426-e27f-4258-9bfc-b4a15ebdca83',      # Factive (2016, no longer marketed in the US)
  'chloramph': 'aed29594-211d-49ef-813f-131975a8d0e3',     # chloramphenicol sodium succinate (openFDA files its dosing as unclassified)
  'imi_rele': 'be32f468-738b-40df-a425-591e12f65159',      # Recarbrio
  'sul_dur': 'c0167aec-a89d-4e96-afe5-2ccf3e89fe72',       # Xacduro
}
LOINC = {'34066-1': 'boxed_warning', '34067-9': 'indications_and_usage', '34068-7': 'dosage_and_administration',
         '43678-2': 'dosage_forms_and_strengths', '34070-3': 'contraindications', '43685-7': 'warnings_and_cautions',
         '34071-1': 'warnings', '42232-9': 'precautions', '34073-7': 'drug_interactions', '43684-0': 'use_in_specific_populations',
         '34081-0': 'pediatric_use', '34082-8': 'geriatric_use', '34090-1': 'clinical_pharmacology', '43682-6': 'pharmacokinetics'}


def dailymed(i, setid):
    import xml.etree.ElementTree as ET
    url = 'https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/%s.xml' % setid
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'label-evidence-script'}), timeout=60) as r:
        root = ET.fromstring(r.read())
    ns = {'v': 'urn:hl7-org:v3'}
    secs = {}
    for sec in root.iter('{urn:hl7-org:v3}section'):
        code = sec.find('v:code', ns)
        name = LOINC.get(code.get('code') if code is not None else '')
        if name and name not in secs:
            secs[name] = [re.sub(r'\s+', ' ', ' '.join(sec.itertext())).strip()]
    # the whole label as text too, so a section the file does not code (old labels) is never lost
    body = root.find('v:component', ns)
    secs['full_text'] = [re.sub(r'\s+', ' ', ' '.join((body if body is not None else root).itertext())).strip()]
    eff = root.find('v:effectiveTime', ns)
    title = re.sub(r'\s+', ' ', ' '.join(root.find('v:title', ns).itertext())).strip() if root.find('v:title', ns) is not None else ''
    ver = root.find('v:versionNumber', ns)
    return {'id': i, 'query': url, 'set_id': setid, 'version': ver.get('value') if ver is not None else None,
            'effective_time': eff.get('value') if eff is not None else None, 'brand': [title[:120]], 'generic': [], 'route': [],
            'manufacturer': [], 'url': 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + setid, 'sections': secs}


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'label-evidence-script'}), timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return {'results': []}
            time.sleep(2 ** i)
        except Exception:
            time.sleep(2 ** i)
    raise RuntimeError('openFDA did not answer: ' + url)


# a label pinned by set id when the newest one is unusable (for example its dose table is only an image)
PIN = {
  'pen_g': 'efef4846-9497-41af-8dd6-518f86eca7f2',   # Pfizerpen (Pfizer): the newest generic label shows its adult dose table as an image
}


def best(words, name_re, route_re, pin=None):
    if pin:
        res = get(API + '?search=set_id:"%s"&limit=1' % pin).get('results', [])
        return (res[0] if res else None), API + '?search=set_id:' + pin, len(res)
    q = 'openfda.generic_name:(' + '+AND+'.join('"%s"' % w for w in words.split()) + ')'
    q += '+AND+openfda.product_type:"HUMAN PRESCRIPTION DRUG"'
    url = API + '?search=' + q.replace(' ', '+') + '&limit=100'
    res = get(url).get('results', [])
    ok = []
    for r in res:
        of = r.get('openfda', {})
        gens = [g.upper().strip() for g in of.get('generic_name', [])]
        routes = ' '.join(of.get('route', []))
        if not any(re.match(name_re, g) for g in gens):
            continue
        if not re.search(route_re, routes):
            continue
        if not (r.get('dosage_and_administration') or r.get('dosage_and_administration_table')):
            continue
        ok.append(r)
    # the manufacturer's own label first (repackagers' copies can carry older text), then the newest version,
    # then the longer (complete) label
    rp = lambda r: bool(REPACK.search(' '.join(r.get('openfda', {}).get('manufacturer_name', []))))
    ok.sort(key=lambda r: (not rp(r), r.get('effective_time', ''), len(json.dumps(r))), reverse=True)
    return (ok[0] if ok else None), url, len(res)


def main(ids):
    os.makedirs(OUT, exist_ok=True)
    report = []
    for i in ids:
        if i in DAILYMED:
            rec = dailymed(i, DAILYMED[i])
            with open(os.path.join(OUT, i + '.json'), 'w', encoding='utf-8') as f:
                json.dump(rec, f, ensure_ascii=False, indent=1)
            report.append((i, rec['effective_time'], 'DailyMed: ' + rec['brand'][0][:60], ','.join(rec['sections'])[:80]))
            continue
        words, name_re, route_re = DRUGS[i]
        r, url, n = best(words, name_re, route_re, PIN.get(i))
        if not r:
            report.append((i, 'NO LABEL', n))
            continue
        of = r.get('openfda', {})
        rec = {
            'id': i, 'query': url, 'set_id': r.get('set_id'), 'version': r.get('version'), 'effective_time': r.get('effective_time'),
            'brand': of.get('brand_name', []), 'generic': of.get('generic_name', []), 'route': of.get('route', []),
            'manufacturer': of.get('manufacturer_name', []),
            'url': 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + str(r.get('set_id')),
            'sections': {k: r[k] for k in KEEP if k in r},
        }
        with open(os.path.join(OUT, i + '.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, ensure_ascii=False, indent=1)
        report.append((i, rec['effective_time'], ','.join(rec['brand'])[:30] + ' | ' + ','.join(rec['manufacturer'])[:30]))
        time.sleep(0.3)
    for row in report:
        print(*row, sep='  ')


if __name__ == '__main__':
    main(sys.argv[1:] or list(DRUGS) + list(DAILYMED))
