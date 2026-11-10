// BIOTICWAW · end-to-end test of the antibiotic site (Node + Playwright, no Python needed).
// Visitors on phone / iPad / computer (Arabic and English) and the owner's flow (login, approve, edit, publish),
// against a fake Supabase (tests/fake_supabase.js + tests/seed_state.json). Nothing real is touched.
// Run: node tests/e2e_flow.cjs   (needs the playwright package; exit 1 on any failure)
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(__dirname, 'shots');
const fake = fs.readFileSync(path.join(__dirname, 'fake_supabase.js'), 'utf8');
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed_state.json'), 'utf8'));
const csp = (fs.readFileSync(path.join(ROOT, '_headers'), 'utf8').match(/Content-Security-Policy: (.*)/) || [])[1] || '';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
// what visitors receive: the reviewed antibiotics only (amoxicillin waits for approval in the seed)
const published = { ab: seed.ab.filter(a => a.reviewed).map(({ reviewed, hidden, deleted, ...r }) => r), refs: seed.refs.map(({ rv, ...r }) => r) };
const PUB = JSON.stringify([{ data: published }]);

let fails = 0, oks = 0;
const check = (cond, msg) => { if (cond) { oks++; console.log('ok   ' + msg); } else { fails++; console.log('FAIL ' + msg); } };

async function setup(ctx) {
  await ctx.addInitScript(`window.__SEED=${JSON.stringify(seed)};`);
  await ctx.route('https://cdn.jsdelivr.net/**', r => r.fulfill({ status: 200, body: fake, contentType: 'application/javascript' }));
  await ctx.route(/https:\/\/[a-z]+\.supabase\.co\/.*/, r => r.fulfill({ status: 200, body: PUB, contentType: 'application/json' }));
  await ctx.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, body: '', contentType: 'text/css' }));
  await ctx.route('http://app.test/**', r => {
    const u = new URL(r.request().url());
    if (u.pathname === '/api/content') return r.fulfill({ status: 200, body: PUB, contentType: 'application/json' });
    // the worker's link check for the team (same answer shape as src/worker.js)
    if (u.pathname === '/api/links') { const ids = (u.searchParams.get('ids') || '').split(',').filter(Boolean).map(Number);
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ at: new Date().toISOString(), links: ids.map(id => ({ id, code: 200, state: 'ok' })) }) }); }
    if (u.pathname.startsWith('/api/')) return r.fulfill({ status: 404, body: '{}', contentType: 'application/json' });
    let f = path.join(ROOT, decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html');
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(ROOT, 'index.html');
    let body = fs.readFileSync(f);
    const ct = MIME[path.extname(f)] || 'application/octet-stream', headers = {};
    if (ct === 'text/html') headers['Content-Security-Policy'] = csp.replace("connect-src 'self'", "connect-src 'self' http://app.test").replace('; upgrade-insecure-requests', '');
    // the fake library stands in for supabase-js, so the page must expect the fake's fingerprint
    if (f.endsWith('owner.js')) body = Buffer.from(body.toString('utf8').replace(/sri:'sha384-[^']+'/, "sri:'sha384-" + crypto.createHash('sha384').update(fake).digest('base64') + "'"));
    return r.fulfill({ status: 200, body, contentType: ct, headers });
  });
}
function watch(page) {
  const errs = [];
  page.on('pageerror', e => errs.push('page: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || /Content Security Policy/.test(m.text())) errs.push('console: ' + m.text()); });
  return errs;
}
const txt = (page, sel) => page.evaluate(s => (document.querySelector(s) || {}).innerText || '', sel);
// every text key the page asks for must exist (a missing key shows as an empty label); lookups fall through to this watcher
const MISSWATCH = () => { window.__MISS = new Set(); Object.setPrototypeOf(I18N, new Proxy({}, { get(t, k) { if (typeof k === 'string') window.__MISS.add(k); return undefined; } })); refreshAll(); };
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);

async function visitor(b, name, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await setup(ctx);
  const page = await ctx.newPage(); const errs = watch(page);
  await page.goto('http://app.test/'); await page.waitForTimeout(1500);
  await page.evaluate(MISSWATCH);
  const tag = `[visitor ${name}]`;

  // calculator: only published antibiotics are offered
  const opts = await page.evaluate(() => [...document.querySelectorAll('#abcsel option')].map(o => o.value));
  check(JSON.stringify(opts) === JSON.stringify(['', 'cefalex', 'cipro']) || JSON.stringify(opts) === JSON.stringify(['', 'cipro', 'cefalex']), `${tag} calculator lists only the published drugs (${opts.join(',')})`);
  check(await page.evaluate(() => document.getElementById('s-data').hidden && document.getElementById('resbox').hidden), `${tag} patient data and result stay hidden until a drug is chosen`);
  await page.selectOption('#abcsel', 'cipro');
  check(await page.isVisible('#s-data'), `${tag} patient data appears after choosing a drug`);
  await page.fill('#age', '45'); await page.selectOption('#sex', 'm'); await page.fill('#wt', '80'); await page.fill('#ht', '175');
  await page.fill('#abscr', '1.2'); await page.selectOption('#ab_ind', 'urinary'); await page.click('#abcgo');
  const res = await txt(page, '#res');
  check(/\b88\b/.test(res), `${tag} ciprofloxacin: creatinine clearance 88 mL/min`);
  check(res.includes('الجرعة المعتادة'), `${tag} ciprofloxacin: usual dose above 50 mL/min`);
  await page.screenshot({ path: path.join(SHOTS, `calc-${name}.png`), fullPage: true });
  // «بيانات تجريبية» fills a sample patient and calculates at once
  check(!(await page.isVisible('#abdemo')), `${tag} «بيانات تجريبية» is hidden on the main site`);
  await page.evaluate(() => document.body.classList.add('demo')); // the test site
  await page.click('#clear'); await page.click('#abdemo'); await page.waitForTimeout(200);
  check(await page.evaluate(() => document.getElementById('age').value === '65' && /\d+ mL\/min|\d+ مل\/دقيقة/.test(document.getElementById('res').innerText)), `${tag} «بيانات تجريبية» fills a sample patient and shows the dose`);
  await page.evaluate(() => document.body.classList.remove('demo'));
  // copy and print the result (print is replaced by a stub that records what would be printed)
  await page.click('#abccopy'); await page.waitForTimeout(150);
  check((await txt(page, '#toast')).includes('نُسخت'), `${tag} copy the result`);
  await page.evaluate(() => { window.print = () => { const p = document.getElementById('abprint'); window.__printed = !!p && document.body.classList.contains('printab') && p.innerText.includes('سيبروفلوكساسين'); }; });
  await page.click('#abcprint'); await page.waitForTimeout(100);
  check(await page.evaluate(() => window.__printed === true), `${tag} print shows only the result with the drug name`);

  // interactions: choose a drug, its interactions appear
  await page.evaluate(() => go('interactions')); await page.waitForTimeout(200);
  await page.selectOption('#intsel', 'cipro'); await page.waitForTimeout(100);
  check((await txt(page, '#ilist')).includes('مضادات الحموضة'), `${tag} interactions: ciprofloxacin shows antacids`);
  const sref = await page.evaluate(() => { const a = document.querySelector('#ilist a[data-ref]'); return a ? a.dataset.ref + ' ' + a.textContent : ''; });
  check(!!sref, `${tag} interactions: each one shows its source name and number (${sref})`);
  if (sref) { await page.click('#ilist a[data-ref]'); await page.waitForTimeout(400);
    check(await page.evaluate(n => !document.getElementById('sources').hidden && document.getElementById('ref-' + n).classList.contains('hl'), sref.split(' ')[0]), `${tag} tapping the source opens it in the sources list`);
    await page.evaluate(() => go('interactions')); await page.waitForTimeout(150); }
  await page.selectOption('#intsel', 'cefalex'); await page.waitForTimeout(100);
  check((await txt(page, '#ilist')).includes('لا توجد تداخلات منشورة'), `${tag} interactions: cephalexin says none published`);
  await page.screenshot({ path: path.join(SHOTS, `inter-${name}.png`), fullPage: true });

  // every page opens without sideways scrolling
  for (const p of ['calc', 'interactions', 'abx', 'sources', 'roadmap', 'menu']) {
    await page.evaluate(x => go(x), p); await page.waitForTimeout(150);
    check(!(await overflow(page)), `${tag} page ${p}: no sideways scrolling`);
  }
  // a dialog always has a way out: × and Cancel
  const viaX = await page.evaluate(async () => { const pr = dialog({ title: 't', fields: [] }); document.getElementById('dlg-x').click(); return (await pr).action; });
  check(viaX === 'cancel', `${tag} dialog: × closes it`);
  const btns = await page.evaluate(async () => { const pr = dialog({ title: 't', fields: [] }); const b = [...document.querySelectorAll('#dlg-a button')].map(x => x.textContent); document.querySelector('#dlg-a button').click(); await pr; return b; });
  check(btns.length === 1 && btns[0] === 'إلغاء', `${tag} dialog without buttons gets «إلغاء»`);

  // English: the same pages in English, nothing left in Arabic in the calculator choice
  await page.evaluate(() => { setLang('en'); go('interactions'); }); await page.waitForTimeout(200);
  const first = await page.evaluate(() => (document.querySelector('#intsel option') || {}).textContent || '');
  check(first.includes('Choose a drug'), `${tag} English: interactions list in English`);
  check(await page.evaluate(() => document.documentElement.dir) === 'ltr', `${tag} English: page direction left to right`);

  for (const p of ['calc', 'interactions', 'abx', 'sources', 'roadmap', 'menu']) { await page.evaluate(x => go(x), p); await page.waitForTimeout(100); }
  const miss = await page.evaluate(() => [...window.__MISS]);
  check(miss.length === 0, `${tag} every text key exists (Arabic and English)` + (miss.length ? ': ' + miss.join(', ') : ''));
  check(errs.length === 0, `${tag} no page errors` + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

async function owner(b, name, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await setup(ctx);
  const page = await ctx.newPage(); const errs = watch(page);
  const tag = `[owner ${name}]`;
  await page.goto('http://app.test/'); await page.waitForTimeout(1200);
  // sign in from the menu (the fake keeps a session, as after a real login)
  const box = await page.evaluate(() => WIDE() ? '#side-b' : '#menu-b');
  if (box === '#menu-b') { await page.click('#t-menu'); await page.waitForTimeout(200); }
  await page.locator(`${box} button, ${box} a`, { hasText: 'دخول المالك' }).first().click(); await page.waitForTimeout(1200);
  check(await page.evaluate(() => OWN.on && ISOWNER()), `${tag} signed in as owner`);
  check(await page.isVisible('#obar'), `${tag} owner bar visible`);
  // 🔔 counts the waiting antibiotic right after login (before the antibiotics page is opened)
  await page.waitForTimeout(600);
  const bell = await page.evaluate(() => ({ n: notifCount(), shown: !document.getElementById('hnt-count').hidden || !document.getElementById('nt-count').hidden }));
  check(bell.n >= 1 && bell.shown, `${tag} 🔔 shows the waiting antibiotic at login (${bell.n})`);
  await page.evaluate(MISSWATCH);

  // the owner's tools in the menu: arrange the menus and the bottom bar, every text, logos
  const adm = await page.evaluate(() => [...document.querySelectorAll((WIDE() ? '#side-b' : '#menu-b') + ' .mi')].map(b => b.textContent));
  check(['تعديل وترتيب القوائم', 'كل نصوص الموقع', 'الشعارات'].every(t => adm.some(x => x.includes(t))), `${tag} menu has the owner's tools (arrange menus, all texts, logos)`);
  await page.evaluate(() => { const n = NAV(); n.bar = [...n.bar, 'abx']; navSave(n); closeSheet(false); }); await page.waitForTimeout(150);
  check(await page.evaluate(() => !document.getElementById('t-abx').classList.contains('offbar')), `${tag} «الأدوية» can be put in the bottom bar`);
  await page.evaluate(() => { const n = NAV(); n.bar = n.bar.filter(x => x !== 'abx'); navSave(n); closeSheet(false); });
  await page.evaluate(() => go('abx')); await page.waitForTimeout(150);
  check(await page.evaluate(() => getComputedStyle(document.querySelector('#abx .hero')).backgroundImage !== 'none' || getComputedStyle(document.querySelector('#abx .hero')).backgroundColor !== 'rgba(0, 0, 0, 0)'), `${tag} the antibiotics page banner has its colours`);
  // bug fixed in 1.5.0: with a saved draft the owner still sees the published antibiotics
  await page.evaluate(() => go('interactions')); await page.waitForTimeout(200);
  const n = await page.evaluate(() => document.querySelectorAll('#intsel option').length - 1);
  check(n === 2, `${tag} interactions: the owner sees the ${n} published antibiotics`);

  // «اعتماد الكل» appears when more than one antibiotic waits (two made-up waiting drugs, shown only)
  const allBtn = await page.evaluate(() => { const keep = window.ABPEND; window.ABPEND = [{ id: 'x1', n: { ar: 'أ', en: 'A' } }, { id: 'x2', n: { ar: 'ب', en: 'B' } }];
    const h = abPendHTML(); window.ABPEND = keep; return /data-aball/.test(h) && /\(2\)/.test(h); });
  check(allBtn, `${tag} 🔔 «اعتماد الكل (2)» when two antibiotics wait`);
  // 🔔 approve the waiting antibiotic (amoxicillin)
  await page.evaluate(() => go('abx')); await page.waitForTimeout(800);
  await page.evaluate(() => openNotif()); await page.waitForTimeout(400);
  const ok = page.locator('[data-abok="amox"]');
  check(await ok.count() === 1, `${tag} 🔔 lists amoxicillin as waiting`);
  if (await ok.count()) { await ok.first().click(); await page.waitForTimeout(500); }
  check(await page.evaluate(() => __calls.some(c => c[0] === 'rpc' && c[1] === 'antibiotic_approve')), `${tag} approve calls antibiotic_approve`);
  await page.evaluate(() => { if (typeof closeSheet === 'function') closeSheet(false); go('abx'); }); await page.waitForTimeout(800);

  // the antibiotic editor has Save, Cancel and × (its buttons show in «تعديل وترتيب» mode)
  check(await page.locator('[data-abedit]').count() === 0, `${tag} drug edit buttons hidden outside edit mode`);
  await page.click('#o-texts'); await page.waitForTimeout(800);
  const ed = page.locator('[data-abedit="cefalex"]');
  check(await ed.count() >= 1, `${tag} editor button on cephalexin`);
  if (await ed.count()) {
    await ed.first().click(); await page.waitForTimeout(300);
    const labels = await page.evaluate(() => [...document.querySelectorAll('#dlg-a button')].map(x => x.textContent));
    check(labels.includes('حفظ') && labels.includes('إلغاء'), `${tag} editor has «حفظ» and «إلغاء» (${labels.join(', ')})`);
    check(await page.isVisible('#dlg-x'), `${tag} editor has the × mark`);
    await page.click('#dlg-a .pri'); await page.waitForTimeout(500);
    check(await page.evaluate(() => __calls.some(c => c[0] === 'rpc' && c[1] === 'antibiotic_save')), `${tag} «حفظ» calls antibiotic_save`);
    check(await page.evaluate(() => document.getElementById('dlg').hidden), `${tag} editor closes after saving`);
  }

  // publish: the approved amoxicillin reaches the published list and shows at once
  await page.click('#o-publish'); await page.waitForTimeout(300);
  await page.click('#dlg-a .pri'); await page.waitForTimeout(1200);
  check(await page.evaluate(() => __calls.some(c => c[0] === 'rpc' && c[1] === 'publish_site')), `${tag} publish calls publish_site`);
  await page.evaluate(() => go('interactions')); await page.waitForTimeout(200);
  const after = await page.evaluate(() => [...document.querySelectorAll('#intsel option')].map(o => o.value).filter(Boolean));
  check(after.includes('amox'), `${tag} after publishing, amoxicillin is in the interactions list (${after.join(',')})`);
  await page.screenshot({ path: path.join(SHOTS, `owner-${name}.png`), fullPage: false });
  for (const p of ['calc', 'interactions', 'abx', 'sources', 'roadmap', 'menu', 'notif']) { await page.evaluate(x => go(x), p); await page.waitForTimeout(100); }
  await page.evaluate(() => { if (typeof openLog === 'function') openLog(); }); await page.waitForTimeout(400);
  const miss = await page.evaluate(() => [...window.__MISS]);
  check(miss.length === 0, `${tag} every text key exists in the owner's screens` + (miss.length ? ': ' + miss.join(', ') : ''));

  check(errs.length === 0, `${tag} no page errors` + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch();
  for (const [name, w, h] of [['phone', 390, 844], ['ipad', 820, 1180], ['pc', 1280, 800]]) await visitor(b, name, w, h);
  for (const [name, w, h] of [['phone', 390, 844], ['pc', 1280, 800]]) await owner(b, name, w, h);
  await b.close();
  console.log(`e2e: ${oks} ok, ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('ERROR', e); process.exit(1); });
