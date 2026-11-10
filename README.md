# BIOTICWAW

مرجع لجرعات المضادات الحيوية وتداخلاتها، مبني على الملصقات الرسمية (FDA / DailyMed) ومصادر موثوقة، بالعربية والإنكليزية.
An antibiotic dose and interaction reference built from official labels (FDA / DailyMed), in Arabic and English.

- Version history: [CHANGELOG.md](CHANGELOG.md) · Security model: [SECURITY.md](SECURITY.md) · Design (frozen): [docs/DESIGN.md](docs/DESIGN.md)
- Antibiotic plan and sources: [docs/antibiotics/](docs/antibiotics/)

---

## ملخص بالعربية

- **الموقع** ملفات ثابتة (HTML وCSS وJavaScript) بدون مرحلة بناء، تُنشر تلقائياً على Cloudflare من GitHub.
- **الأقسام**: الحاسبة (حاسبة لكل مضاد)، التداخلات، الأدوية، المصادر، القادم، ودخول المالك وسجل الإجراءات.
- **قواعد الجرعات** بيانات في `js/abrules.js` يقرؤها محرك واحد في `js/abcalc.js`. كل رقم منقول من ملصق رسمي مذكور.
- **المحتوى** (المضادات وتداخلاتها والمصادر) في Supabase. لا يظهر أي عنصر للزوار قبل أن يعتمده المالك وينشره.

---

## Architecture

```
Browser ──► Cloudflare (static files: index.html, css/, js/, fonts/)      free, unlimited, cached worldwide
   │
   ├──► /api/content  ──► src/worker.js ──► Supabase (published row)      cached 60 s at the edge
   ├──► /api/links    ──► src/worker.js (team only: checks source links)
   │
   └──► Supabase Auth + RPC (owner / pharmacist only, after login)       protected by row level security
```

- **No build step.** Plain scripts in `js/` share one global scope and are loaded in order by `index.html`.
- **Content**: tables `antibiotics`, `antibiotic_interactions` and `sources`, each row with a `reviewed` flag.
  The page never reads these tables directly: the owner edits through definer functions that check the owner role
  (`antibiotic_save`, `antibiotic_approve`, …). **Publish** calls `publish_site()`, which writes a snapshot of
  *reviewed* rows to `site_config` row `published` (antibiotics under the key `ab`). Visitors only read that snapshot.
- **Dose rules** are code-reviewed data (`js/abrules.js`), not database rows: a change needs a pharmacist's review and a release.
- **Visitors' data never leaves the device.** Age, weight, height and creatinine are not sent anywhere.

## File map

| Path | What it is |
|---|---|
| `index.html` | Page markup only. Texts come from `data-t="key"` attributes. |
| `css/app.css` | All styles. Colours are CSS variables at the top (light and dark). Design is frozen: `docs/DESIGN.md`. |
| `js/config.js` | Version, Supabase projects (live / test), default settings, `clean()` and `mergeCfg()`. |
| `js/i18n.js` | Arabic / English dictionary `I18N` and the `T()` / `L()` helpers. |
| `js/abrules.js` | **Dose rules of every antibiotic** (data, with the label each number comes from). |
| `js/abcalc.js` | The one calculation engine: Cockcroft-Gault, rule matching, result, copy and print. |
| `js/lists.js` | Interactions page (choose a drug → its interactions), antibiotics page, owner antibiotic editor and «اعتماد الكل», sources, roadmap. |
| `js/ui.js` | Pages, language, event wiring. |
| `js/nav.js` | Menus (bottom bar / side menu), floating windows. |
| `js/owner.js` | Owner and pharmacist interface: login, dialogs, save, publish, activity log. |
| `js/team.js` | Pharmacist accounts (owner only). |
| `js/published.js` | Loads the published content for visitors. |
| `js/content.js`, `js/render.js` | Shared helpers: the sources list (`buildData`), the owner's edit buttons, the review stamp. |
| `js/pre.js`, `js/boot.js` | Before first paint / start-up. |
| `src/worker.js` | Cloudflare Worker: `/api/content` with edge caching, `/api/links`, daily keep-alive. |
| `_headers` | Security headers (CSP etc.) and cache rules. |
| `sw.js` | Offline support for the installed app. |
| `supabase/migrations/` | Every database change, named with the version Supabase assigned. |
| `supabase/manual/` | Content files (sources, antibiotic batches) run by hand, test first. |
| `tests/` | Automated tests (see below). |
| `tools/set_version.py` | Sets the version and content hashes in every file at once. |
| `docs/antibiotics/` | The 100 drugs: `LIST.md` (the 100 drugs, labels, dates, source ids), `batchN.json` (content written from the labels), `labels/` (saved official labels), `aware_2023.json`, `PLAN.md`. |
| `tools/fetch_labels.py`, `tools/fetch_eu_labels.py` | Download the official labels (DailyMed / openFDA, then eMC, EMA, ANSM). |
| `tools/abx.py` | `check N` checks a batch; `sql N` writes `supabase/manual/batchN_load_test.sql` (drafts, reviewed = false). |

## Common tasks

| I want to… | Do this |
|---|---|
| Change a text | Find its key in `js/i18n.js`, edit both languages. |
| Add a text | Add `key:['عربي','English']` to `I18N`, then `data-t="key"` in HTML or `T('key')` in JS. |
| Add a dose calculator | Add the drug's rules to `ABC_RULES` in `js/abrules.js` (rows, ordered rules, the last rule of each row empty = fallback), cite the label, run `node tests/abrules_test.mjs`. The drug shows only after it is approved and published. |
| Add an antibiotic / interaction / source | Owner interface (الأدوية → إضافة) → approve in 🔔 → publish. Batches of 10 go through `supabase/manual/`. |
| Change the database | New file in `supabase/migrations/`, apply on TEST first, rename it to the version Supabase assigns, apply on LIVE at release. |

## Tests

```bash
python3 tests/check_assets.py        # asset links match their content (forgot set_version.py?)
node tests/worker_test.mjs           # edge worker: caching, stale copy, routing
node tests/worker_links_test.mjs     # link check endpoint
node tests/abrules_test.mjs          # every drug rule: fallbacks, both languages, known values
node tests/i18n_check.mjs            # every text exists in Arabic and English
node tests/e2e_flow.cjs              # visitors on phone / iPad / computer (ar + en) and the owner's flow
```

`e2e_flow.cjs` needs the `playwright` package. It uses a fake Supabase (`tests/fake_supabase.js`, seed
`tests/seed_state.json`) and applies the real Content-Security-Policy from `_headers`, so a blocked script fails the test.
It also fails if any page asks for a text key that does not exist. CI runs all of the above on every push.

## Release process

1. Work on a branch; every push builds a **preview URL** on Cloudflare that uses the **test** Supabase project.
2. `python3 tools/set_version.py X.Y.Z` and a section in `CHANGELOG.md` before every push that changes `css/` or `js/`.
3. Run the tests, check the preview on a phone, an iPad and a computer.
4. Only after the owner approves: apply the pending migrations and content files on LIVE, merge into `main`
   (Cloudflare deploys production), then the owner publishes from the owner interface.

## Capacity (free plans, approximate)

| Part | Limit | What it means |
|---|---|---|
| Static files | Unlimited and free on Cloudflare | No limit on page views. |
| `/api/content` (Worker) | 100,000 requests / day free | About 100,000 visits a day; above that the page reads Supabase directly. |
| Supabase | 5 GB egress / month, 500 MB database | The worker calls Supabase about once a minute per edge location. |
| Supabase pausing | Free projects pause after 7 idle days | Prevented by the worker's daily cron request (both projects). |
