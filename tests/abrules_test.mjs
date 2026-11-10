// Structure and known-value checks for the antibiotic rules (js/abrules.js) and the engine (js/abcalc.js).
// Run: node tests/abrules_test.mjs   (exit 1 on any failure)
import fs from 'fs';
import vm from 'vm';
const dir = new URL('../js/', import.meta.url).pathname;
const ctx = vm.createContext({ document: { getElementById: () => null, addEventListener() {}, readyState: 'complete' }, esc: s => s, L: (a) => a, CFG: {}, console });
vm.runInContext(fs.readFileSync(dir + 'abrules.js', 'utf8') + '\n' + fs.readFileSync(dir + 'abcalc.js', 'utf8'), ctx);
const RULES = vm.runInContext('ABC_RULES', ctx), evalRule = vm.runInContext('abEval', ctx), crcl = vm.runInContext('abCrCl', ctx);
let fail = 0, ok = 0;
const check = (cond, msg) => { if (cond) ok++; else { fail++; console.log('FAIL', msg); } };
const txt = t => t && typeof t.ar === 'string' && typeof t.en === 'string' && t.ar && t.en;
for (const [id, d] of Object.entries(RULES)) {
  check(txt(d.name), id + ': name in ar and en');
  check(d.srcIds && d.srcIds.length > 0, id + ': has a source id');
  check(txt(d.notes), id + ': notes in ar and en');
  for (const row of d.rows) {
    check(txt(row.k), id + ': row label in ar and en');
    check(row.rules.length > 0, id + ': row has rules');
    // a warning row may stay empty (shown only when its rule matches); every other row must have a fallback
    if (!row.warn && !row.opt) check(Object.keys(row.rules[row.rules.length - 1].when).length === 0,
      id + ': row "' + row.k.en + '" ends with a fallback rule (empty when)');
    for (const r of row.rules) check(txt(r.text), id + ': rule text in ar and en');
  }
  for (const f of d.inputs) if (f.type === 'select') for (const [v, lab] of f.options) check(txt(lab), id + ': option ' + v);
  // no < or > in stored text (database rule); the medical rules are plain text
  const all = JSON.stringify(d);
  check(!/[<>]/.test(all), id + ': no < or > in rules');
}
// known values from the labels
const c = crcl(60, 'f', 60, 160, 1.0); // Cockcroft-Gault, female, 60 y, 60 kg, 160 cm, SCr 1.0
check(c && Math.abs(c.crcl - (80 * c.weight) / 72 * 0.85) < 1e-9, 'Cockcroft-Gault female factor 0.85');
const amoxHd = evalRule(RULES.amox, { sev: 'mild', hd: true }, 50).rows.find(r => r.strong);
check(amoxHd.v.en.startsWith('250 mg every 24 h'), 'amoxicillin mild on dialysis = 250 mg every 24 h');
const cefCr = evalRule(RULES.cefalex, {}, 45).rows.find(r => r.strong);
check(cefCr.v.en.startsWith('No change; maximum 1 g'), 'cephalexin CrCl 45 = max 1 g a day');
const ciEx = evalRule(RULES.cipro, { ind: 'urinary' }, 50).rows.find(r => r.strong);
check(ciEx.v.en === '250 to 500 mg every 12 h', 'ciprofloxacin CrCl exactly 50 = 250-500 mg q12h (usual dose only above 50)');
// engine features (a made-up drug, so the test does not depend on real content)
const W = vm.runInContext('abWeights', ctx)('m', 100, 180); // ibw 75 kg, actual over 120% → adjusted 85 kg
check(Math.abs(W.ibw - 74.98) < 0.1 && Math.abs(W.adj - (W.ibw + 0.4 * (100 - W.ibw))) < 1e-9 && W.obese, 'ideal and adjusted weight (Devine)');
const fake = { rows: [
  { k: { ar: 'ج', en: 'D' }, rules: [
    { when: { age: { lt: 18 } }, text: { ar: 'طفل', en: 'child' } },
    { when: { crcl: { lt: 30 } }, text: { ar: '{mgkg:7.5@ibw} ملغ', en: '{mgkg:7.5@ibw} mg' } },
    { when: {}, text: { ar: '{mgkg:15-20|max:2000} ملغ', en: '{mgkg:15-20|max:2000} mg' } }] }], notes: { ar: 'ن', en: 'n' } };
const ev = (cr, age) => evalRule(fake, {}, cr, { age, wt: 100, W }).rows[0].v.en;
check(ev(80, 40) === '1500–2000 mg', 'mg/kg range on actual weight, capped at the maximum (' + ev(80, 40) + ')');
check(ev(20, 40) === '560 mg', 'mg/kg on ideal weight, rounded to 10 mg (' + ev(20, 40) + ')');
check(ev(80, 12) === 'child', 'age condition');
check(evalRule(fake, {}, null, { age: 40, wt: 100, W }).rows[0].v.en === '1500–2000 mg', 'no creatinine: kidney rules are skipped');
check(vm.runInContext('abFill', ctx)('{mgkg:5} mg', {}) === '— mg', 'no weight: the dose is not invented');
const fill = vm.runInContext('abFill', ctx);
check(fill('{mgkg:1@lean} mg', { W }) === String(Math.round(W.ibw / 5) * 5) + ' mg' || fill('{mgkg:1@lean} mg', { W }) === Math.round(W.ibw) + ' mg', 'lean weight = ideal weight when obese (' + fill('{mgkg:1@lean} mg', { W }) + ')');
check(fill('every {scrx:8} h', { scr: 2 }) === 'every 16 h', 'gentamicin interval = creatinine x 8 (label example: 2.0 mg/dL -> 16 h)');
check(fill('every {scrx:8} h', {}) === 'every — h', 'no creatinine: no interval invented');
// known values copied from the label tables (one or two per drug; they fail if a rule is changed by mistake)
const W70 = vm.runInContext('abWeights', ctx)('m', 70, 175); // not obese
const strong = (id, x, cr, extra = {}) => { const r = evalRule(RULES[id], x, cr, { age: 50, wt: 70, W: W70, ...extra }); const s = r.rows.find(q => q.strong); return s ? s.v.en : ''; };
const rowEn = (id, x, cr, k, extra = {}) => { const r = evalRule(RULES[id], x, cr, { age: 50, wt: 70, W: W70, ...extra }).rows.find(q => q.k.en === k); return r ? r.v.en : ''; };
const known = [
  ['levo 750 mg, clearance 30', strong('levo', { ind: 'hap', hd: false }, 30), '750 mg every 48 h'],
  ['levo 750 mg, clearance 15', strong('levo', { ind: 'hap', hd: false }, 15), '750 mg first, then 500 mg every 48 h'],
  ['levo 500 mg, dialysis', strong('levo', { ind: 'cap', hd: true }, 5), '500 mg first, then 250 mg every 48 h'],
  ['levo 250 mg uncomplicated UTI, clearance 15', strong('levo', { ind: 'uuti', hd: false }, 15), 'No change (uncomplicated urinary infection)'],
  ['cefazolin, clearance 20', strong('cefazolin', { ind: 'modsev' }, 20), 'Half the usual dose every 12 h'],
  ['cefazolin, clearance 40', strong('cefazolin', { ind: 'modsev' }, 40), 'Full dose, at least 8 h apart'],
  ['smx-tmp, clearance 20', strong('smx_tmp', { ind: 'uti' }, 20), 'Half the usual regimen (clearance 15 to 30 mL/min)'],
  ['nitrofurantoin, clearance 50', strong('nitro', { use: 'treat' }, 50), 'Do not use: the label contraindicates it when creatinine clearance is under 60 mL/min.'],
  ['clarithromycin with ritonavir, clearance 40', strong('clarith', { ind: 'cap', pi: true }, 40), 'Reduce the dose by 50%'],
  ['clarithromycin with ritonavir, clearance 20', strong('clarith', { ind: 'cap', pi: true }, 20), 'Reduce the dose by 75%'],
  ['cefuroxime, clearance 20', strong('cefurox', { ind: 'uti', hd: false }, 20), 'The standard dose every 24 h'],
  ['cefixime, clearance 40', strong('cefixime', { ind: 'usual', dial: 'none' }, 40), 'The 400 mg tablet is not appropriate (clearance 21 to 59); use another form as in the label table'],
  ['gentamicin serious, 70 kg', strong('genta', { sev: 'serious' }, 90), '70 mg every 8 h (3 mg/kg a day)'],
  ['gentamicin interval, creatinine 2.0', rowEn('genta', { sev: 'serious' }, 40, 'If the kidneys are impaired (label method)', { scr: 2 }), 'the usual dose about every 16 h (serum creatinine × 8), with level monitoring'],
  ['vancomycin anephric, 70 kg', strong('vanco', { anephric: true }, 5), '1050 mg first (15 mg/kg), then 130 mg every 24 h (1.9 mg/kg), with a level at 24 h'],
  ['metronidazole anaerobic, 70 kg', strong('metro', { ind: 'anaer', hep: false, hd: false }, null), '530 mg every 6 h (7.5 mg/kg), at most 4 g a day, for 7 to 10 days'],
  ['amox-clav, clearance 20', strong('amox_clav', { sev: 'severe', hd: false }, 20), '500 or 250 mg every 12 h by severity'],
  ['meropenem-vaborbactam, eGFR 40', strong('mero_vabor', { hd: false }, 90, { egfr: 40 }), '2 g (meropenem 1 + vaborbactam 1) every 8 h'],
  ['meropenem-vaborbactam, eGFR 20', strong('mero_vabor', { hd: false }, 90, { egfr: 20 }), '2 g (meropenem 1 + vaborbactam 1) every 12 h'],
  ['plazomicin, clearance 45, 70 kg', strong('plazomicin', {}, 45), '700 mg every 24 h (10 mg/kg)'],
  ['plazomicin, clearance 20, 70 kg', strong('plazomicin', {}, 20), '700 mg every 48 h (10 mg/kg)'],
  ['amikacin every 12 h, 70 kg', strong('amikacin', { reg: 'q12' }, 90), '530 mg every 12 h (7.5 mg/kg; not over 1.5 g a day)'],
  ['amikacin interval, creatinine 2.0', rowEn('amikacin', { reg: 'q12' }, 40, 'If the kidneys are impaired (label method)', { scr: 2 }), '7.5 mg/kg about every 18 h (serum creatinine × 9), with level monitoring'],
  ['tobramycin serious, 70 kg', strong('tobra', { sev: 'serious' }, 90), '70 mg every 8 h (3 mg/kg a day)'],
  ['aztreonam, clearance 20', rowEn('aztreonam', { ind: 'mod', hd: false }, 20, 'By kidney function'), 'A first dose of 1 or 2 g, then half the dose'],
  ['streptomycin TB daily, 70 kg', strong('strepto', { ind: 'tbd' }, 90), '1000 mg once a day (15 mg/kg, maximum 1 g)'],
  ['telithromycin, clearance 20', strong('telithro', { hep: false, hd: false }, 20), '600 mg once a day'],
];
const eg = vm.runInContext('abEgfr', ctx)(60, 'm', 1.0); // 175 x 60^-0.203 = 76.7
check(Math.abs(eg - 175 * Math.pow(60, -0.203)) < 1e-9 && Math.round(eg) === 76, 'MDRD eGFR (60-year-old man, creatinine 1.0 = 76)');
for (const [name, got, want] of known) check(got === want, 'label value: ' + name + (got === want ? '' : ' -> got "' + got + '"'));
console.log(`abrules: ${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
