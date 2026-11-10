# CLAUDE.md — handoff notes for Claude Code

> مستودع BIOTICWAW الجديد (حساب bioticwaw26، مستودع vitawaw/bioticwaw). لا يرتبط بأي مشروع Supabase أو Cloudflare قديم.

Read this first. It explains how the owner works, the rules that must not be broken, where things are,
and where the project stands. Details: `README.md` (architecture, file map, tests), `SECURITY.md`, `CHANGELOG.md`.

## The owner
- **سيف الدين (Saifaldeen)**, pharmacist. BIOTICWAW is his **academic pharmacy project**; he will present and explain it in detail.
- Talk to him **in Arabic**, addressing him in the **masculine**. Keep replies short and clear; he is not a programmer.
- He wants: professional, simple, fast, secure, private. **Proposals before big changes** ("اعطني المقترحات قبل التنفيذ").
  For small fixes just do them.
- He judges by looking at the site on **phone, iPad and computer**. Always check all three sizes (Playwright screenshots).
- He rejected 1.5.0 completely because the layout felt messy ("خربطه"). Change the look **in small, reviewable steps**
  and keep the existing design and colours unless he asks otherwise.

## Approved design (frozen)
- The visual identity is approved and frozen: see `docs/DESIGN.md`. Do not change colours, fonts, shapes, the logo or the components without the owner's written approval.

## Release workflow (always)
1. Work on the session's branch (now `ccr-c59940f6-mvyndg`) from `main`. Every push builds a Cloudflare **preview** that uses the
   **test** Supabase project: `https://ccr-c59940f6-mvyndg-bioticwaw.bioticwaw26.workers.dev`. Production
   (`https://bioticwaw.bioticwaw26.workers.dev`) is untouched. Check what the preview really serves before sending it:
   `curl -s <preview>/js/config.js | grep -o "APP_VERSION='[^']*'"` (a build takes a few minutes).
2. Before every push that changes `css/` or `js/`: `python3 tools/set_version.py X.Y.Z` (content-hashed asset URLs;
   without it browsers load stale scripts) and add a section to `CHANGELOG.md` (Arabic).
3. Run the tests (below), send him **both links after every change** (he asked for this): preview + production.
4. **Only when he says «جاهز» / «انشر» (or clearly approves publishing)**: apply the pending migrations and content files on LIVE
   (see Database), merge into `main` and push → production; then he publishes from the owner interface.
- Commit messages end with the attribution lines the session asks for.

## Rules that must never be broken
- Never put the Supabase **service_role** key in the page or the repo. The page uses only the public anon key (`js/config.js`).
- Never ask for, print or handle his passwords. He creates passwords himself.
- Sign-up stays **invite-only** (`private.invites` + trigger). Only the owner invites.
- **Soft delete only** for content (the `deleted` / `hidden` flags; history in `config_history`).
- New or edited medical content by a pharmacist is `reviewed = false` and **never reaches visitors** until the owner approves
  and publishes (`publish_site()` copies only reviewed rows).
- Permissions are enforced **in the database** (RLS, definer functions that check `private.my_role()`, `draft_guard` trigger),
  not only in the page. Any new editable feature needs the matching database rule.
- No `<` or `>` in stored text (CHECK constraints) and all external data goes through `clean()` then `esc()`.
- CSP in `_headers`: scripts only from this site + pinned `supabase-js@2.45.4` on jsDelivr. Don't add other script hosts.
- Medical numbers: every dose rule in `js/abrules.js` comes from a named official label (FDA / DailyMed first, the newest
  available); run `node tests/abrules_test.mjs` after any change. Open clinical points go to the owner, never guessed.
- Do not revoke anon EXECUTE on `private.my_role()`: the policy that lets visitors read the published row calls it.

## Database (Supabase project `pxvytusjqpvuwsbiraia` = bioticwaw = LIVE, eu-central-1; test: `ehmucaelvxrftspkqrtq` = bioticwaw-test)
- Every change = a new file in `supabase/migrations/` named with the **version Supabase assigns** when applied
  (check with list_migrations, rename the file to match). Apply on TEST first; LIVE only at release.
- Changes must stay **compatible with the version currently live** (LIVE still runs the vitamin site 1.17.3 until release).
- MCP write tools (apply_migration) ask him for approval; it often times out on his tablet. Then: do not retry in the same
  turn; tell him, and either retry when he is watching or give him the raw GitHub link + the SQL editor link.
- The free projects pause after 7 idle days; the worker's daily cron (`src/worker.js`) keeps both awake.
- Advisor warnings about owner functions callable by signed-in users are expected: each checks the owner role inside.
- **LIVE released 2026-11-10 (1.6.5)**: on LIVE via pg_net + md5 (versions 20261110102821…102841): the six antibiotic migrations + the cleanup
  migration; content: sources_antibiotics_1_26.sql + batches_1_10_load_test.sql (100 drugs waiting, 294 interactions, 126 sources).
  LIVE had already been emptied (0 sources, no info pages, 8 hidden vitamin rows dropped with the nutrients table). main = branch (fast-forward).
- Big SQL without pasting: push the file, `select net.http_get(raw GitHub URL at the commit)`, check `md5(content)` against the local file,
  then `execute` it (apply_migration for schema changes, execute_sql for content). Worked on TEST on 2026-11-10 without an approval prompt.

## Where things are (no build step; plain scripts loaded in order by `index.html`)
- Sections: الحاسبة `#calc`, التداخلات `#interactions`, الأدوية `#abx`, المصادر `#sources`, القادم `#roadmap`, + menu `#menu`
  (`menuHTML()` in `js/nav.js`: the five sections in the owner's order, owner «إدارة الموقع», info pages, sign in / out).
- Calculator: `js/abrules.js` = `ABC_RULES` (per drug: inputs, ordered rows of `{when, text}` rules; the first matching rule wins;
  `when` keys = input ids or `crcl:{gt,gte,lt,lte}`); `js/abcalc.js` = engine (`abCrCl` Cockcroft-Gault with ideal/adjusted
  weight, `abMatch`, `abEval`), page (`abcInit` dropdown `#abcsel` of PUBLISHED drugs only; the owner also sees unpublished
  ones), result + «نسخ النتيجة» / «طباعة» (`abcCopy`, `abcPrint`, body.printab).
- Interactions page: `abPicker()` in `js/lists.js` = dropdown `#intsel` (step 1) + card in `#ilist` (step 2), data `CFG.ab[].inter`.
- Antibiotics page + owner editor: `renderAbx()`, `renderAbAdmin()`, `abEdit()` (dialog with «حفظ»/«إلغاء»), approve in 🔔
  (`abPendHTML`, `data-abok`). Database functions: `antibiotics_all`, `antibiotic_save`, `antibiotic_set_flag`,
  `antibiotic_approve`, `publish_site` (adds `ab`). `mergeCfg` falls back to `PUBLISHED.ab` because a draft never has it.
- Dialogs: `dialog()` in `js/owner.js` always has a × (`#dlg-x`) and at least «إلغاء». Floating window: `openSheet()`.
- Owner/pharmacist editing, save, publish, login: `js/owner.js`. `CAN(kind)` / `ISOWNER()` in `nav.js`. Accounts: `js/team.js`.
- Texts: `js/i18n.js` (`key:['عربي','English']`, two blocks: `I18N` and `Object.assign(I18N,…)`). Every text in **both** languages.
- Sources: `buildData()` (content.js) builds `REFS` from CFG.refs; `renderRefs()` / `usedIn()` (lists.js) show under each source the
  antibiotics that cite it. Global search `gsResults()` (nav.js) = antibiotics + sources + info pages.
- Drug data pipeline: `docs/antibiotics/` (`batchN.json`, `labels/`, `LIST.md`, `PLAN.md`), `tools/fetch_labels.py`,
  `tools/fetch_eu_labels.py`, `tools/abx.py check|sql N`. Source id of a drug's label = 27 + its place in `ORDER`.

## Tests (run before every preview; CI runs the same)
```
python3 tests/check_assets.py    # asset hashes match (forgot set_version.py?)
node tests/worker_test.mjs       # edge worker
node tests/worker_links_test.mjs # link check
node tests/abrules_test.mjs      # dose rules: fallback per row, ar+en, known label values
node tests/data_check.cjs        # 100 drugs: data + calculator + own label source/date/name agree
node tests/i18n_check.mjs        # every text in Arabic and English
node tests/e2e_flow.cjs          # visitors 3 sizes ar+en + owner (login, approve, edit, publish), missing text keys → tests/shots/
```
Locally: `NODE_PATH=$(npm root -g) node tests/e2e_flow.cjs` (Playwright is installed globally here; Python Playwright is not).
Gotcha: CSS class names are global; `details.more` already exists (that's why the ⋯ panel is `.mpanel`). Search before naming.

## Where we are (2026-11-10)
- **LIVE = 1.6.6** (he said «انشر» again on 2026-11-10; main fast-forwarded; checked online: 3 sizes ar+en, 0 errors, demo button hidden).
  He approved («اعتماد الكل») and published on LIVE 2026-11-10 10:43 UTC: checked in the DB (100 drugs, 294 interactions, 126 sources
  published, 0 waiting) and online (3 sizes ar+en, 0 errors, all 100 calculators give a result, source links work). LIVE brand logo and
  menu order are still the defaults (he set them on TEST only).
- **1.6.7 (preview)**: his «نفذ الكل» UI items: header `#hlang` (ع/EN, setLang redraws calc keeping values), menu «الإعدادات» (lang + theme auto/light/dark, `setTheme`, localStorage vw-theme), `?lang=en` (boot.js), print forced light, search `#abcq` / `#intq` (abcFill / intFill), option labels without dose (`abOptLabels`), Arabic ranges «إلى» (bidiFix), AWaRe badge `AWB()`.
- **1.6.6**: 🔔 count = notifList + window.ABPEND (loaded at owner login via renderAbAdmin, renderNav after load); full review
  (DB fingerprints LIVE = TEST, advisors expected only, index antibiotic_interactions_drug_idx on BOTH = migration 20261110103536).
- LIVE was 1.6.5 earlier the same day. Logo files for his presentation: `docs/logo/` (PNG + SVG).
- The site is an independent antibiotic reference (vitamin site removed from the code). He gave full authority to finish the 100 drugs,
  review everything and clean the old site («اعمل بدون توقف»); main/LIVE still only after his «انشر».
- **1.6.5 (preview)**: his «عند الخروج لا يطبق الحفظ» (company logo): it WAS saved + published (checked in the TEST DB); the browser kept
  the old /api/content up to 10 min (max-age 60 + stale-while-revalidate 600). Worker now `Cache-Control: public, no-cache` (ETag → 304) and
  CACHE_SECONDS 10, so a publish shows within seconds everywhere.
- **1.6.4 (preview)**: «بيانات تجريبية» `#abdemo` (ui.js; TEST site only: CSS body:not(.demo) hides it — his wish): sample patient 65 y F 60 kg 160 cm SCr 1.3 → dose.
- **1.6.3 (preview)**: `SRCS(ids)` / `srcShort()` (util.js): «حسب المصدر: FDA / DailyMed [n]» next to every interaction, drug line and calculator
  result, links `data-ref` → sources list (highlight). `tools/abx.py label_date()` fixed source names (ANSM/eMC dates; TEST updated).
- **1.6.2 (preview)**: his notes: patient data + result hidden until a drug is chosen (abcOpen); #abx hero icon + colours (CFG.colors.abx);
  owner drug rows only in edit mode; `menuHTML()` = sections in NAV() order + owner «إدارة الموقع» (openNavManager, textedit, openTexts,
  editBrand, editLook, openLog) + info pages for everyone; SECTIONS = calc, interactions, sources, abx, roadmap (tabs #t-abx #t-roadmap, offbar by default).
- **1.6.1 (preview)**: his «راجع و افحص و نضف»: calculator citations = saved label + date + source id (xcheck 0 problems), privacy page
  rewritten, last supplement-list code and stale files removed, `docs/antibiotics/LIST.md`.
- **1.6.0 (preview)**: 100 antibiotics in `docs/antibiotics/batch1..10.json` from the saved labels (`labels/`, US first, then eMC / EMA /
  ANSM translated), AWaRe 2023, sources 27–126 (27 + place in `tools/abx.py` ORDER), calculators for all 100 in `js/abrules.js` (engine:
  `egfr` MDRD rules, `adj25` weight, `{scrx:N}`, `{mgkg:…}`; tests 1999 checks). Label-silent kidney limits are yes/no inputs, never a guessed number.
  Vitamin code removed (calculators/data/validation files, result card, report, share, medicine list, tools page, 125 texts, ~29 KB CSS;
  screenshots identical before/after). «اعتماد الكل» in 🔔. Global search = antibiotics + sources + pages.
- TEST DB: 100 drugs + 294 interactions + 126 sources, cleanup migration applied. He approved and published on TEST (checked
  2026-11-10: visitors see all 100; every calculator gives a result on the real preview, 0 page errors, 3 sizes ar+en).
- Still inert (kept for compatibility with LIVE 1.17.3 until release): the owner draft parts `inter`/`nut` in `owner.js` (save/publish
  summary). Remove after LIVE has the cleanup migration.
- Open clinical points for him: methenamine and polymyxin B and ethambutol and streptomycin labels give no kidney number (calculator asks
  yes/no); delamanid «severe renal impairment» undefined in the SmPC; telithromycin and gemifloxacin are no longer marketed in the US (last
  labels 2012 / 2016) — keep or replace?; amox-clav duration; owner MFA; leaked-password protection (paid).
- Removed with the old menu (unreachable since 1.3.x): backup download, version restore, the all-texts editor. Offer to bring them back.

## History (short; full details in git history and CHANGELOG.md)
- Until 2026-11-08 the project was a vitamin and supplement site (LIVE 1.17.3 still is, until he says «انشر»). He then decided:
  an independent antibiotic reference built from official labels; all vitamin content and code removed (done in 1.5.0–1.6.0).
- Lessons that still apply:
  - Preview gotcha: a successful Workers Build may not update the preview alias. Always check what the preview really serves
    (`curl -s <preview>/js/config.js | grep -o "APP_VERSION='[^']*'"`, or an asset hash from index.html) before sending links.
  - A test script that crashes can still print 0 failures: check the exit code and the count of «ok» lines.
  - Supabase MCP writes on LIVE need his approval and often time out on his tablet; then give him the raw GitHub link + the SQL
    editor link (…/project/pxvytusjqpvuwsbiraia/sql/new) and remind him the button must say «Run», not «Run selected».
  - Old branches release/1.1.0–1.6.0 and ci-probe are kept (his decision); their old previews use the LIVE DB — not to be used.
  - The custom domain is postponed (set in Cloudflare → Workers → Domains when he chooses one).

## Backlog he mentioned (not started)
- Academic material for the presentation: validation document, algorithm flowcharts, academic write-up, slide deck.
  Ask first: university, college, project title, names, template.
- Optional: an AI translate button (Arabic ↔ English) in edit dialogs (offered, not approved); MFA for the owner;
  leaked-password protection (Supabase dashboard, paid plan).
