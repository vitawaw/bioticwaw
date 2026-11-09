# Plan: 100 antibiotics (working plan, 2026-11-09)

## Goal
Every one of the 100 antibiotics in `antibiotics_100.csv` on the site with: uses, adult dose, kidney adjustment, timing,
the label's clinically important interactions, a dose calculator built from the label, and the source of every number.

## Method (one pipeline for every drug)
1. **Label evidence.** `tools/fetch_labels.py` saves the official label as exact text in `labels/<id>.json`
   (openFDA = the FDA label on DailyMed: set id, version date, indications, dosage and administration with tables,
   contraindications, drug interactions, renal sections). For a drug with no US label, the official EU/UK label
   (EMA SmPC or the UK eMC) is used and named as such. Nothing is written from memory or from a secondary site.
2. **Authoring.** `batchN.json` holds each drug in Arabic and English (uses, dose, renal, timing), its interactions
   (from the label's interactions section; `major` = contraindicated or "avoid" in the label, `moderate` = dose change or
   monitoring, `minor` = laboratory test interference) and the source ids. The calculator rules go into `js/abrules.js`.
3. **Checks.** `tests/abrules_test.mjs` (fallback per row, both languages, known values from each label),
   `tools/check_batch.py` (no < or >, Arabic and English present, every interaction cites a source, every drug has a label).
4. **Loading.** `tools/batch_sql.py` writes `supabase/manual/batchN_load_test.sql` (sources, antibiotics with
   `reviewed = false`, interactions). Loaded on the TEST project only.
5. **Approval.** The owner approves in 🔔 (one drug, or «اعتماد الكل» for a whole batch) and presses «نشر».
   Calculators show to visitors only for approved and published drugs.
6. **Release.** Main site only after the owner says «انشر».

## Calculator scope
- Adults (18 and over). Creatinine clearance by Cockcroft-Gault (actual, ideal or adjusted weight as in `abCrCl`).
- Doses by infection where the label lists them; kidney bands exactly as the label's table; dialysis as the label says.
- Weight-based doses (mg/kg) are calculated from the weight entered and capped where the label gives a maximum.
- Under 18: the calculator says the dose is not calculated for children and points to the label section.
- Drugs dosed by blood levels (vancomycin, aminoglycosides, colistin…) show the label's starting dose and say that
  the dose is then adjusted by levels; the calculator never replaces monitoring.

## Batches (10 drugs each, most used first; batch 1 is loaded)
1. amoxicillin, amoxicillin-clavulanate, cefalexin, doxycycline, ciprofloxacin, azithromycin, nitrofurantoin, metronidazole, ceftriaxone, sulfamethoxazole-trimethoprim
2. clarithromycin, levofloxacin, cefuroxime, cefixime, clindamycin, flucloxacillin, cefazolin, gentamicin, vancomycin, linezolid
3. ampicillin, ampicillin-sulbactam, penicillin V, benzathine penicillin, procaine penicillin, dicloxacillin, piperacillin-tazobactam, temocillin, cefradine, cefadroxil
4. cefalotin, cefaclor, cefprozil, cefpodoxime, cefdinir, cefditoren, cefoxitin, cefotetan, cefotaxime, ceftazidime
5. cefepime, ceftaroline, ceftobiprole, cefiderocol, ceftolozane-tazobactam, ceftazidime-avibactam, imipenem-cilastatin, meropenem, ertapenem, doripenem
6. aztreonam, meropenem-vaborbactam, amikacin, tobramycin, streptomycin, plazomicin, erythromycin, roxithromycin, josamycin, telithromycin
7. lincomycin, minocycline, tetracycline, tigecycline, omadacycline, eravacycline, moxifloxacin, ofloxacin, norfloxacin, gemifloxacin
8. delafloxacin, gatifloxacin, nalidixic acid, trimethoprim, sulfadiazine, fosfomycin, tinidazole, secnidazole, teicoplanin, daptomycin
9. dalbavancin, oritavancin, tedizolid, rifampicin, rifabutin, rifapentine, isoniazid, ethambutol, pyrazinamide, bedaquiline
10. delamanid, pretomanid, chloramphenicol, colistin, polymyxin B, fusidic acid, fidaxomicin, rifaximin, lefamulin, pristinamycin

## Rules for every drug
- The dose and the kidney table are copied from the label (section named); the label version date is recorded.
- A drug withdrawn from a market keeps its last official label and says so.
- Every interaction cites its source; Arabic and English for every field; no < or > in any text.
- Open clinical points are listed for the owner in `OPEN_POINTS.md`, never guessed.
