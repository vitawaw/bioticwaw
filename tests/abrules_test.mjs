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
    if (!row.warn) check(Object.keys(row.rules[row.rules.length - 1].when).length === 0,
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
console.log(`abrules: ${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
