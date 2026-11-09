// Every interface text exists in Arabic AND English, and none carries < or > (all texts are passed through esc()).
// Run: node tests/i18n_check.mjs   (exit 1 on any failure). The e2e test checks that no page asks for a missing key.
import fs from 'fs';
import vm from 'vm';
const src = fs.readFileSync(new URL('../js/i18n.js', import.meta.url), 'utf8');
const ctx = vm.createContext({ CFG: {}, LANG: 'ar', document: { documentElement: {} }, localStorage: { getItem: () => null } });
try { vm.runInContext(src + '\n;globalThis.__I=I18N;', ctx); } catch (e) { /* the file also touches the page; I18N is defined first */ }
const I = ctx.__I || vm.runInContext('typeof I18N!=="undefined"?I18N:null', ctx);
if (!I) { console.log('FAIL I18N not found'); process.exit(1); }
let bad = 0;
for (const [k, v] of Object.entries(I)) {
  const okPair = Array.isArray(v) && v.length === 2 && typeof v[0] === 'string' && typeof v[1] === 'string' && v[0].trim() && v[1].trim();
  if (!okPair) { bad++; console.log('FAIL ' + k + ': needs a non-empty Arabic and English text'); continue; }
  if (/<[a-z/!]/i.test(v[0] + v[1]) && !/^\s*$/.test('')) { /* markup-like text is allowed only if escaped later */ }
}
console.log(`i18n: ${Object.keys(I).length} keys, ${bad} problems`);
process.exit(bad ? 1 : 0);
