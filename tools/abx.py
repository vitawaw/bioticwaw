#!/usr/bin/env python3
"""Antibiotic batches: checks and the SQL that loads them on the TEST project.

Usage:
  python3 tools/abx.py check N        check docs/antibiotics/batchN.json
  python3 tools/abx.py sql N          write supabase/manual/batchN_load_test.sql (sources + drugs + interactions, reviewed = false)
  python3 tools/abx.py sources        print the source id of every drug's label

Each drug's label (docs/antibiotics/labels/<id>.json) becomes one source row, with a fixed id: 27 + its place in ORDER.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, 'docs', 'antibiotics')

ORDER = [
  # batch 1
  'amox', 'amox_clav', 'cefalex', 'doxy', 'cipro', 'azithro', 'nitro', 'metro', 'ceftriaxone', 'smx_tmp',
  # batch 2
  'clarith', 'levo', 'cefurox', 'cefixime', 'clinda', 'fluclox', 'cefazolin', 'genta', 'vanco', 'linezolid',
  # batch 3
  'ampicillin', 'amp_sulb', 'pen_v', 'benz_pen', 'pen_g', 'dicloxa', 'pip_tazo', 'temocillin', 'sul_dur', 'cefadroxil',
  # batch 4
  'oxacillin', 'cefaclor', 'cefprozil', 'cefpodox', 'cefdinir', 'cefditoren', 'cefoxitin', 'cefotetan', 'cefotaxime', 'ceftaz',
  # batch 5
  'cefepime', 'ceftaroline', 'ceftobiprole', 'cefiderocol', 'ceftolo_tazo', 'ceftaz_avi', 'imi_cila', 'meropenem', 'ertapenem', 'imi_rele',
  # batch 6
  'aztreonam', 'mero_vabor', 'amikacin', 'tobra', 'strepto', 'plazomicin', 'erythro', 'roxithro', 'josamycin', 'telithro',
  # batch 7
  'lincomycin', 'minocycline', 'tetracycline', 'tigecycline', 'omadacycline', 'eravacycline', 'moxi', 'oflox', 'norflox', 'gemiflox',
  # batch 8
  'delaflox', 'azt_avi', 'methenamine', 'tmp', 'sulfadiazine', 'fosfo', 'tinidazole', 'secnidazole', 'teico', 'dapto',
  # batch 9
  'dalba', 'orita', 'tedizolid', 'rifampin', 'rifabutin', 'rifapentine', 'isoniazid', 'ethambutol', 'pza', 'bedaquiline',
  # batch 10
  'delamanid', 'pretomanid', 'chloramph', 'colistin', 'polymyxin_b', 'fusidic', 'fidaxo', 'rifaximin', 'lefamulin', 'pristina',
]
assert len(ORDER) == 100 and len(set(ORDER)) == 100
SRC = {d: 27 + i for i, d in enumerate(ORDER)}

# WHO AWaRe 2023 (docs/antibiotics/aware_2023.json), route-specific entries chosen; '' = not classified in 2023
AWARE = {
  'amox': 'access', 'amox_clav': 'access', 'cefalex': 'access', 'doxy': 'access', 'cipro': 'watch', 'azithro': 'watch',
  'nitro': 'access', 'metro': 'access', 'ceftriaxone': 'watch', 'smx_tmp': 'access',
  'clarith': 'watch', 'levo': 'watch', 'cefurox': 'watch', 'cefixime': 'watch', 'clinda': 'access', 'fluclox': 'access',
  'cefazolin': 'access', 'genta': 'access', 'vanco': 'watch', 'linezolid': 'reserve',
  'ampicillin': 'access', 'amp_sulb': 'access', 'pen_v': 'access', 'benz_pen': 'access', 'pen_g': 'access', 'dicloxa': 'access',
  'pip_tazo': 'watch', 'temocillin': 'watch', 'sul_dur': '', 'cefadroxil': 'access',
  'oxacillin': 'access', 'cefaclor': 'watch', 'cefprozil': 'watch', 'cefpodox': 'watch', 'cefdinir': 'watch', 'cefditoren': 'watch',
  'cefoxitin': 'watch', 'cefotetan': 'watch', 'cefotaxime': 'watch', 'ceftaz': 'watch',
  'cefepime': 'watch', 'ceftaroline': 'reserve', 'ceftobiprole': 'reserve', 'cefiderocol': 'reserve', 'ceftolo_tazo': 'reserve',
  'ceftaz_avi': 'reserve', 'imi_cila': 'watch', 'meropenem': 'watch', 'ertapenem': 'watch', 'imi_rele': 'reserve',
  'aztreonam': 'reserve', 'mero_vabor': 'reserve', 'amikacin': 'access', 'tobra': 'watch', 'strepto': 'watch', 'plazomicin': 'reserve',
  'erythro': 'watch', 'roxithro': 'watch', 'josamycin': 'watch', 'telithro': 'watch',
  'lincomycin': 'watch', 'minocycline': 'watch', 'tetracycline': 'access', 'tigecycline': 'reserve', 'omadacycline': 'reserve',
  'eravacycline': 'reserve', 'moxi': 'watch', 'oflox': 'watch', 'norflox': 'watch', 'gemiflox': 'watch',
  'delaflox': 'watch', 'azt_avi': '', 'methenamine': '', 'tmp': 'access', 'sulfadiazine': 'access', 'fosfo': 'watch',
  'tinidazole': 'access', 'secnidazole': 'access', 'teico': 'watch', 'dapto': 'reserve',
  'dalba': 'reserve', 'orita': 'reserve', 'tedizolid': 'reserve', 'rifampin': 'watch', 'rifabutin': 'watch',
  'rifapentine': '', 'isoniazid': '', 'ethambutol': '', 'pza': '', 'bedaquiline': '',
  'delamanid': '', 'pretomanid': '', 'chloramph': 'access', 'colistin': 'reserve', 'polymyxin_b': 'reserve', 'fusidic': 'watch',
  'fidaxo': 'watch', 'rifaximin': 'watch', 'lefamulin': 'reserve', 'pristina': 'watch',
}
assert set(AWARE) == set(ORDER)


def label(i):
    return json.load(open(os.path.join(DOCS, 'labels', i + '.json'), encoding='utf-8'))


def ymd(t):
    t = (t or '').strip()
    return '%s-%s-%s' % (t[:4], t[4:6], t[6:8]) if re.fullmatch(r'\d{8}', t) else t


def source_row(i, n_ar, n_en):
    """the source row of a drug's label (org, title, url, use in both languages, kind)"""
    L = label(i)
    kind = L.get('label_kind') or 'US label'
    if kind == 'US label':
        who = ', '.join(L.get('manufacturer') or [])
        brand = (L.get('brand') or [''])[0]
        if brand.startswith('These highlights') or not brand:
            brand = n_en
        org = 'U.S. FDA label on DailyMed' + (' (' + who + ')' if who else '') + (', ' + ymd(L.get('effective_time')) if L.get('effective_time') else '')
        title = brand[:110] + ': prescribing information'
    else:
        org = {'UK SmPC': 'UK summary of product characteristics (eMC)', 'EU SmPC (EMA)': 'European Medicines Agency, product information',
               'French RCP': 'French public medicines database (ANSM), RCP'}[kind] + (', ' + L['effective_time'] if L.get('effective_time') and len(L['effective_time']) < 25 else '')
        title = (L.get('brand') or [n_en])[0][:120]
    return {'id': SRC[i], 'org': org[:200], 'title': title[:200], 'url': L['url'],
            'ar': 'الملصق الرسمي لـ' + n_ar + ': الاستعمالات والجرعات وتعديل الكلى والتداخلات',
            'en': 'Official label of ' + n_en.lower() + ': uses, doses, kidney adjustment and interactions', 'kind': 'd'}


def bi(x):
    return isinstance(x, dict) and isinstance(x.get('ar'), str) and isinstance(x.get('en'), str) and x['ar'].strip() and x['en'].strip()


def check(n):
    b = json.load(open(os.path.join(DOCS, 'batch%d.json' % n), encoding='utf-8'))
    errs = []
    for d in b['drugs']:
        i = d['id']
        if i not in SRC: errs.append(i + ': not in ORDER')
        if not re.fullmatch(r'[a-z0-9_]{1,24}', i): errs.append(i + ': bad id')
        if not os.path.exists(os.path.join(DOCS, 'labels', i + '.json')): errs.append(i + ': no saved label')
        for k in ('n', 'cls', 'uses', 'dose', 'renal', 'timing'):
            if not bi(d.get(k)): errs.append('%s: %s needs Arabic and English' % (i, k))
        if d.get('aware', '') != AWARE.get(i, '?'): errs.append('%s: AWaRe must be %r' % (i, AWARE.get(i)))
        if SRC.get(i) not in d.get('src', []): errs.append('%s: src must include its label (%s)' % (i, SRC.get(i)))
        if not d.get('inter') and not d.get('inter_none'):
            errs.append(i + ': no interactions (write the label\'s clinically important ones, or set inter_none when the label lists none)')
        for x in d.get('inter', []):
            if not (bi(x.get('with')) and bi(x.get('desc'))): errs.append(i + ': interaction text in both languages')
            if x.get('sev') not in ('major', 'moderate', 'minor'): errs.append(i + ': interaction severity')
            if not x.get('r'): errs.append(i + ': interaction without a source')
        if re.search(r'[<>]', json.dumps(d, ensure_ascii=False)): errs.append(i + ': < or > in the text')
    print('batch %d: %d drugs, %d problems' % (n, len(b['drugs']), len(errs)))
    for e in errs: print('  ' + e)
    return b, errs


def q(s):
    s = str(s)
    assert '$q$' not in s
    return '$q$' + s + '$q$'


def sql(n):
    b, errs = check(n)
    if errs: sys.exit(1)
    out = ['-- BIOTICWAW batch %d, generated by tools/abx.py from docs/antibiotics/batch%d.json.' % (n, n),
           '-- TEST project first. Drugs and interactions are drafts (reviewed = false): visitors see them only after the',
           '-- owner approves them in 🔔 and publishes. Safe to run twice.', 'begin;']
    rows = [source_row(d['id'], d['n']['ar'], d['n']['en']) for d in b['drugs']]
    out.append('insert into public.sources (id, org, title, url, use_ar, use_en, kind, reviewed, deleted, hidden) values')
    out.append(',\n'.join('(%d, %s, %s, %s, %s, %s, %s, true, false, false)' % (r['id'], q(r['org']), q(r['title']), q(r['url']), q(r['ar']), q(r['en']), q(r['kind'])) for r in rows))
    out.append('on conflict (id) do update set org = excluded.org, title = excluded.title, url = excluded.url, use_ar = excluded.use_ar, use_en = excluded.use_en, kind = excluded.kind, deleted = false;')
    for k, d in enumerate(b['drugs']):
        i = d['id']; sort = SRC[i] * 10
        src = '{' + ','.join(str(x) for x in d['src']) + '}'
        out.append('insert into public.antibiotics (id, name_ar, name_en, aware, class_ar, class_en, uses_ar, uses_en, dose_ar, dose_en, renal_ar, renal_en, timing_ar, timing_en, source_ids, sort, hidden, reviewed, deleted)')
        out.append("values ('%s', %s, %s, '%s', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, '%s', %d, false, false, false)" % (
            i, q(d['n']['ar']), q(d['n']['en']), d['aware'], q(d['cls']['ar']), q(d['cls']['en']), q(d['uses']['ar']), q(d['uses']['en']),
            q(d['dose']['ar']), q(d['dose']['en']), q(d['renal']['ar']), q(d['renal']['en']), q(d['timing']['ar']), q(d['timing']['en']), src, sort))
        out.append('on conflict (id) do update set name_ar = excluded.name_ar, name_en = excluded.name_en, aware = excluded.aware, class_ar = excluded.class_ar, class_en = excluded.class_en, '
                   'uses_ar = excluded.uses_ar, uses_en = excluded.uses_en, dose_ar = excluded.dose_ar, dose_en = excluded.dose_en, renal_ar = excluded.renal_ar, renal_en = excluded.renal_en, '
                   'timing_ar = excluded.timing_ar, timing_en = excluded.timing_en, source_ids = excluded.source_ids, sort = excluded.sort, reviewed = false, deleted = false, updated_at = now();')
        out.append("delete from public.antibiotic_interactions where drug_id = '%s';" % i)
        for j, x in enumerate(d['inter']):
            out.append("insert into public.antibiotic_interactions (drug_id, with_ar, with_en, desc_ar, desc_en, severity, source_ids, sort, reviewed, deleted) values ('%s', %s, %s, %s, %s, '%s', '{%s}', %d, false, false);" % (
                i, q(x['with']['ar']), q(x['with']['en']), q(x['desc']['ar']), q(x['desc']['en']), x['sev'], ','.join(str(r) for r in x['r']), (j + 1) * 10))
    out.append('commit;')
    path = os.path.join(ROOT, 'supabase', 'manual', 'batch%d_load_test.sql' % n)
    open(path, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print('wrote', os.path.relpath(path, ROOT))


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'check': sys.exit(1 if check(int(sys.argv[2]))[1] else 0)
    elif cmd == 'sql': sql(int(sys.argv[2]))
    elif cmd == 'sources':
        for i in ORDER: print(SRC[i], i)
